/**
 * order controller
 */

import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

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

    stripUserQuery(ctx);
    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);
    const sanitizedInputData = (await this.sanitizeInput(payload, ctx)) as Record<string, unknown>;

    const entity = await strapi.service('api::order.order').create({
      ...sanitizedQuery,
      data: {
        ...sanitizedInputData,
        user: user.id,
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
