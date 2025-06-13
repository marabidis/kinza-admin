import { factories } from '@strapi/strapi';
import crypto from 'crypto';

export default factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  async send(ctx) {
    const { phone } = ctx.request.body as { phone: string };
    if (!phone) {
      return ctx.badRequest('Phone is required');
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await strapi.entityService.create('api::otp-code.otp-code', {
      data: { phone, code, expires, used: false },
    });
    await strapi.plugin('sms').service('sms').send({ to: phone, text: `Code: ${code}` });
    ctx.body = { ok: true };
  },

  async confirm(ctx) {
    const { phone, code } = ctx.request.body as { phone: string; code: string };
    if (!phone || !code) {
      return ctx.badRequest('Phone and code required');
    }
    const now = new Date();
    const [otp] = await strapi.entityService.findMany('api::otp-code.otp-code', {
      filters: { phone, code, used: false },
      sort: { createdAt: 'desc' },
      limit: 1,
    });
    if (!otp || new Date(otp.expires) < now) {
      return ctx.badRequest('Invalid code');
    }
    await strapi.entityService.update('api::otp-code.otp-code', otp.id, { data: { used: true } });

    let user = await strapi.query('plugin::users-permissions.user').findOne({ where: { phone } });
    if (!user) {
      const password = crypto.randomBytes(8).toString('hex');
      user = await strapi.query('plugin::users-permissions.user').create({
        data: { username: phone, phone, password, confirmed: true },
      });
    }

    const token = await strapi.service('plugin::users-permissions.jwt').issue({ id: user.id });
    ctx.body = { jwt: token, user };
  },
}));
