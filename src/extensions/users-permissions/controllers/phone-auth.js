// src/extensions/users-permissions/controllers/phone-auth.js
'use strict';
const crypto = require('crypto');

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '7d';
const REFRESH_TOKEN_TTL_DAYS = Number.parseInt(
  process.env.REFRESH_TOKEN_TTL_DAYS || '30',
  10,
);
const REFRESH_TOKEN_BYTES = Number.parseInt(
  process.env.REFRESH_TOKEN_BYTES || '64',
  10,
);

const getPositiveInt = (value, fallback) =>
  Number.isFinite(value) && value > 0 ? value : fallback;

const REFRESH_TOKEN_TTL_MS =
  getPositiveInt(REFRESH_TOKEN_TTL_DAYS, 30) * 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_BYTE_LENGTH = getPositiveInt(REFRESH_TOKEN_BYTES, 64);

const hashRefreshToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const issueAccessToken = (userId) =>
  strapi
    .service('plugin::users-permissions.jwt')
    .issue({ id: userId }, { expiresIn: ACCESS_TOKEN_TTL });

const createRefreshToken = async ({ userId, deviceId }) => {
  const token = crypto.randomBytes(REFRESH_TOKEN_BYTE_LENGTH).toString('hex');
  const tokenHash = hashRefreshToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await strapi.db.query('api::refresh-token.refresh-token').create({
    data: {
      tokenHash,
      expiresAt,
      revokedAt: null,
      lastUsedAt: null,
      deviceId: deviceId || null,
      user: userId,
    },
  });

  return { token, expiresAt };
};

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
    const { phone, code, deviceId } = ctx.request.body;
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

    /* 4. Выпускаем access + refresh */
    const jwt = issueAccessToken(user.id);
    const { token: refreshToken } = await createRefreshToken({
      userId: user.id,
      deviceId,
    });

    /* 5. Санитизируем ответ */
    const { password, resetPasswordToken, deletedAt, ...safeUser } = user;

    ctx.send({ jwt, refreshToken, user: safeUser });
  },

  /*─────────────────── /refresh ──────────────────────*/
  async refresh(ctx) {
    const { refreshToken, deviceId } = ctx.request.body || {};
    if (!refreshToken) return ctx.badRequest('refreshToken required');

    const tokenHash = hashRefreshToken(refreshToken);
    const now = new Date();

    const existingToken = await strapi.db
      .query('api::refresh-token.refresh-token')
      .findOne({
        where: { tokenHash },
        populate: {
          user: {
            select: ['id', 'blocked', 'deletedAt'],
          },
        },
      });

    if (!existingToken) {
      return ctx.unauthorized('invalid_refresh_token');
    }

    if (existingToken.revokedAt) {
      return ctx.unauthorized('refresh_token_revoked');
    }

    if (existingToken.expiresAt && new Date(existingToken.expiresAt) < now) {
      return ctx.unauthorized('refresh_token_expired');
    }

    if (!existingToken.user) {
      return ctx.unauthorized('invalid_refresh_token');
    }

    if (existingToken.user.blocked || existingToken.user.deletedAt) {
      return ctx.forbidden('account_blocked');
    }

    if (existingToken.deviceId && deviceId && existingToken.deviceId !== deviceId) {
      return ctx.unauthorized('invalid_device');
    }

    await strapi.db.query('api::refresh-token.refresh-token').update({
      where: { id: existingToken.id },
      data: { revokedAt: now, lastUsedAt: now },
    });

    const jwt = issueAccessToken(existingToken.user.id);
    const { token: newRefreshToken } = await createRefreshToken({
      userId: existingToken.user.id,
      deviceId: deviceId || existingToken.deviceId,
    });

    ctx.send({ jwt, refreshToken: newRefreshToken });
  },
};
