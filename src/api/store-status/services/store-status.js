'use strict';

const { computeStoreStatus } = require('../../../utils/store-status');
const { buildDeliveryRules } = require('../../../utils/delivery-rules');
const { buildDeliveryTime } = require('../../../utils/delivery-time');

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
    const cutlery = {
      enabled: settings?.cutleryEnabled !== false,
      defaultMode: settings?.cutleryDefaultMode === 'always_show' ? 'always_show' : 'opt_in',
      price: Number.isFinite(Number(settings?.cutleryPrice))
        ? Number(settings?.cutleryPrice)
        : 0,
      max: Number.isFinite(Number(settings?.cutleryMax))
        ? Number(settings?.cutleryMax)
        : 20,
      freeMode: settings?.cutleryFreeMode === 'fixed' ? 'fixed' : 'recommended',
      freeFixed: Number.isFinite(Number(settings?.cutleryFreeFixed))
        ? Number(settings?.cutleryFreeFixed)
        : 0,
    };
    const deliveryTime = buildDeliveryTime({ status, settings });

    return {
      ...status,
      deliveryRules,
      cutlery,
      deliveryTime,
    };
  },
});
