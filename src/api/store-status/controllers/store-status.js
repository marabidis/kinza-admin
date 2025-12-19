'use strict';

module.exports = {
  async get(ctx) {
    const status = await strapi.service('api::store-status.store-status').getStatus();
    ctx.send(status);
  },
};
