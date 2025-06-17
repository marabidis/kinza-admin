// src/extensions/users-permissions/controllers/phone-auth.js
'use strict';
const crypto = require('crypto');

module.exports = {
  async send(ctx) {
    const { phone } = ctx.request.body;
    if (!phone) return ctx.badRequest('phone required');

    // генерим и сохраняем код…
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    await strapi.entityService.create('api::otp-code.otp-code', {
      data: { phone, code, expires: new Date(Date.now() + 5*60e3), used: false },
    });
await strapi.service('plugin::sms.sms').send({ to: phone, text: `Code: ${code}` });

    ctx.send({ ok: true });
  },

  async confirm(ctx) {
    const { phone, code } = ctx.request.body;
    if (!phone || !code) {
      return ctx.badRequest('phone and code required');
    }

    const now = new Date();
    const [otp] = await strapi.entityService.findMany('api::otp-code.otp-code', {
      filters: { phone, code, used: false },
      sort: { createdAt: 'desc' },
      limit: 1,
    });

    if (!otp || new Date(otp.expires) < now) {
      return ctx.badRequest('invalid code');
    }

    await strapi.entityService.update('api::otp-code.otp-code', otp.id, {
      data: { used: true },
    });

    let user = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { phone } });

    if (!user) {
      const password = crypto.randomBytes(8).toString('hex');
      user = await strapi.db
        .query('plugin::users-permissions.user')
        .create({ data: { username: phone, phone, password, confirmed: true } });
    }

    const token = await strapi
      .service('plugin::users-permissions.jwt')
      .issue({ id: user.id });

    ctx.send({ jwt: token, user });
  },
};
