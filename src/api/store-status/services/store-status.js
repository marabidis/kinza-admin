'use strict';

const { computeStoreStatus } = require('../../../utils/store-status');
const { buildDeliveryRules } = require('../../../utils/delivery-rules');

module.exports = ({ strapi }) => ({
  async getStatus({ now } = {}) {
    const [settings, deliverySettings] = await Promise.all([
      strapi.db.query('api::store-setting.store-setting').findOne({
        where: {},
        populate: {
          weeklySchedule: true,
          overrides: true,
        },
      }),
      strapi.db.query('api::delivery-setting.delivery-setting').findOne({
        where: {},
        populate: {
          courierTiers: true,
          pickupTiers: true,
        },
      }),
    ]);

    const status = computeStoreStatus(settings, { now });
    const deliveryRules = buildDeliveryRules(deliverySettings);

    return {
      ...status,
      deliveryRules,
    };
  },
});
