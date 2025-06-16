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
    // логика подтверждения…
  },
};