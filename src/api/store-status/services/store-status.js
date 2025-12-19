'use strict';

const { computeStoreStatus } = require('../../../utils/store-status');

module.exports = ({ strapi }) => ({
  async getStatus({ now } = {}) {
    const settings = await strapi.db.query('api::store-setting.store-setting').findOne({
      where: {},
      populate: {
        weeklySchedule: true,
        overrides: true,
      },
    });

    return computeStoreStatus(settings, { now });
  },
});
