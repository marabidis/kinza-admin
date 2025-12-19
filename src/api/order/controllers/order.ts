/**
 * order controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
    const status = await strapi.service('api::store-status.store-status').getStatus();

    if (!status?.ok) {
      ctx.status = 503;
      ctx.body = {
        data: null,
        error: {
          status: 503,
          name: 'ServiceUnavailableError',
          message: 'store_status_unavailable',
          details: status ?? {},
        },
      };
      return;
    }

    const delivery = ctx.request.body?.data?.delivery ?? ctx.request.body?.delivery;
    const requestedDelivery = String(delivery || 'courier');
    const isPickup = requestedDelivery === 'pickup';

    const canOrder = isPickup ? status.canOrderPickupNow : status.canOrderDeliveryNow;

    if (!canOrder) {
      const httpStatus = status.isPaused ? 423 : 409;
      ctx.status = httpStatus;
      ctx.body = {
        data: null,
        error: {
          status: httpStatus,
          name: 'StoreClosedError',
          message: status.isPaused ? 'store_paused' : 'store_closed',
          details: {
            requestedDelivery,
            ...status,
          },
        },
      };
      return;
    }

    return await super.create(ctx);
  },
}));
