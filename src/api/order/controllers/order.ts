/**
 * order controller
 */

import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { buildDeliveryRules, resolveDeliveryFee } from '../../../utils/delivery-rules';
import { validateDeliveryTimeSelection } from '../../../utils/delivery-time';

const { ForbiddenError, ValidationError } = errors;

const stripUserQuery = (ctx) => {
  if (!ctx.query) {
    return;
  }

  if (Object.prototype.hasOwnProperty.call(ctx.query, 'user')) {
    delete ctx.query.user;
  }

  const filters = ctx.query.filters;
  if (filters && typeof filters === 'object' && !Array.isArray(filters)) {
    if (Object.prototype.hasOwnProperty.call(filters, 'user')) {
      delete filters.user;
    }
  }
};

const withUserFilter = (filters: unknown, userId: number) => {
  if (filters && typeof filters === 'object' && Object.keys(filters).length > 0) {
    return { $and: [filters, { user: { id: { $eq: userId } } }] };
  }

  return { user: { id: { $eq: userId } } };
};

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    stripUserQuery(ctx);
    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);
    const scopedQuery = {
      ...sanitizedQuery,
      filters: withUserFilter(sanitizedQuery.filters, user.id),
    };

    const { results, pagination } = await strapi.service('api::order.order').find(scopedQuery);
    const sanitizedResults = await this.sanitizeOutput(results, ctx);
    return this.transformResponse(sanitizedResults, { pagination });
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    stripUserQuery(ctx);
    const id = Number(ctx.params.id);
    const entity = await strapi.db.query('api::order.order').findOne({
      where: { id, user: user.id },
      select: ['id'],
    });

    if (!entity) {
      throw new ForbiddenError('Forbidden');
    }

    return await super.findOne(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

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

    const body = ctx.request.body ?? {};
    const payload = body?.data && typeof body.data === 'object' ? body.data : body;
    const delivery = payload?.delivery;
    if (delivery && !['courier', 'pickup'].includes(String(delivery))) {
      return ctx.badRequest('invalid delivery');
    }

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

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new ValidationError('Missing "data" payload in the request body');
    }

    const totalPriceRaw = payload?.total_price ?? payload?.totalPrice;
    const totalPrice = Number.parseInt(String(totalPriceRaw), 10);

    if (!Number.isFinite(totalPrice)) {
      return ctx.badRequest('total_price required');
    }

    const deliverySettings = await strapi.db
      .query('api::delivery-setting.delivery-setting')
      .findOne({
        where: {},
        populate: {
          courierTiers: true,
          pickupTiers: true,
        },
      });

    const deliveryRules = buildDeliveryRules(deliverySettings);
    const feeResult = resolveDeliveryFee({
      deliveryType: requestedDelivery,
      totalPrice,
      rules: deliveryRules,
    });

    if (!feeResult.ok) {
      if (feeResult.code === 'min_order_not_met') {
        ctx.status = 409;
        ctx.body = {
          data: null,
          error: {
            status: 409,
            name: 'MinOrderError',
            message: 'min_order_not_met',
            details: {
              requiredMin: feeResult.requiredMin,
              delivery: feeResult.deliveryType,
              totalPrice,
            },
          },
        };
        return;
      }

      const httpStatus = feeResult.code === 'invalid_total' ? 400 : 503;
      ctx.status = httpStatus;
      ctx.body = {
        data: null,
        error: {
          status: httpStatus,
          name: httpStatus === 400 ? 'ValidationError' : 'ServiceUnavailableError',
          message:
            feeResult.code === 'invalid_total'
              ? 'total_price required'
              : 'delivery_rules_not_configured',
          details: {
            delivery: feeResult.deliveryType,
          },
        },
      };
      return;
    }

    const deliveryTimeModeRaw = payload?.deliveryTimeMode ?? payload?.delivery_time_mode;
    const scheduledAtRaw = payload?.scheduledAt ?? payload?.scheduled_at;

    const timeValidation = validateDeliveryTimeSelection({
      status,
      deliveryTime: status.deliveryTime,
      mode: deliveryTimeModeRaw,
      scheduledAtISO: scheduledAtRaw,
    });

    if (!timeValidation.ok) {
      const httpStatus = timeValidation.errorType === 'unavailable' ? 409 : 400;
      ctx.status = httpStatus;
      ctx.body = {
        data: null,
        error: {
          status: httpStatus,
          name: httpStatus === 409 ? 'DeliveryTimeUnavailable' : 'ValidationError',
          message:
            httpStatus === 409 ? 'delivery_time_unavailable' : 'delivery_time_invalid',
          details: {
            delivery: requestedDelivery,
          },
        },
      };
      return;
    }

    stripUserQuery(ctx);
    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);
    const sanitizedInputData = (await this.sanitizeInput(payload, ctx)) as Record<string, unknown>;

    const entity = await strapi.service('api::order.order').create({
      ...sanitizedQuery,
      data: {
        ...sanitizedInputData,
        user: user.id,
        delivery_fee: feeResult.fee,
        deliveryTimeMode: timeValidation.mode,
        scheduledAt: timeValidation.scheduledAt,
        windowMinutes: timeValidation.windowMinutes,
      },
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    stripUserQuery(ctx);
    const id = Number(ctx.params.id);
    const entity = await strapi.db.query('api::order.order').findOne({
      where: { id, user: user.id },
      select: ['id'],
    });

    if (!entity) {
      throw new ForbiddenError('Forbidden');
    }

    return await super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    stripUserQuery(ctx);
    const id = Number(ctx.params.id);
    const entity = await strapi.db.query('api::order.order').findOne({
      where: { id, user: user.id },
      select: ['id'],
    });

    if (!entity) {
      throw new ForbiddenError('Forbidden');
    }

    return await super.delete(ctx);
  },
}));
