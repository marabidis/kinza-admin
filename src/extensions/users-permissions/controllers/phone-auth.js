// src/extensions/users-permissions/controllers/phone-auth.js
'use strict';
const crypto = require('crypto');

module.exports = {
  /*────────────────────── /send ──────────────────────*/
  async send(ctx) {
    const { phone } = ctx.request.body;
    if (!phone) return ctx.badRequest('phone required');

    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const otp = await strapi.entityService.create('api::otp-code.otp-code', {
      data: {
        phone,
        code,
        expires: new Date(Date.now() + 5 * 60e3),
        used: false,
      },
    });

    try {
      await strapi.service('plugin::sms.sms').send({
        to: phone,
        text: `Код подтверждения: ${code}`,
        priority: 1,
        externalId: String(otp.id),
      });
    } catch (error) {
      strapi.log.error('phone-auth.send: failed to send SMS', error);
      if (typeof error?.code === 'number') {
        await strapi.entityService
          .update('api::otp-code.otp-code', otp.id, { data: { used: true } })
          .catch(() => {});
      }
      return ctx.internalServerError('sms send failed');
    }

    const smsMode = String(process.env.SMS_MODE || 'mock').toLowerCase();
    ctx.send({ ok: true, ...(smsMode === 'real' ? {} : { code }) });
  },

  /*─────────────────── /confirm ──────────────────────*/
  async confirm(ctx) {
    const { phone, code } = ctx.request.body;
    if (!phone || !code) return ctx.badRequest('phone and code required');

    /* 1. Проверяем OTP */
    const now = new Date();
    const [otp] = await strapi.entityService.findMany(
      'api::otp-code.otp-code',
      {
        filters: { phone, code, used: false },
        sort: { createdAt: 'desc' },
        limit: 1,
      },
    );

    if (!otp || new Date(otp.expires) < now)
      return ctx.badRequest('invalid code');

    await strapi.entityService.update('api::otp-code.otp-code', otp.id, {
      data: { used: true },
    });

    /* 2. Ищем роль “authenticated” (Strapi v4) */
    const authRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } });

    if (!authRole) {
      return ctx.internalServerError('Role "authenticated" not found');
    }

    /* 3. Создаём или находим пользователя */
    let user = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { phone } });

    if (user && (user.blocked || user.deletedAt)) {
      return ctx.forbidden('account_blocked');
    }

    if (!user) {
      user = await strapi.db.query('plugin::users-permissions.user').create({
        data: {
          username: phone,
          phone,
          password: crypto.randomBytes(8).toString('hex'),
          confirmed: true,
          role: authRole.id,
        },
      });
    } else if (user.role !== authRole.id) {
      await strapi.entityService.update(
        'plugin::users-permissions.user',
        user.id,
        { data: { role: authRole.id } },
      );
    }

    /* 4. Выпускаем JWT */
    const jwt = await strapi
      .service('plugin::users-permissions.jwt')
      .issue({ id: user.id });

    /* 5. Санитизируем ответ */
    const { password, resetPasswordToken, deletedAt, ...safeUser } = user;

    ctx.send({ jwt, user: safeUser });
  },
};
