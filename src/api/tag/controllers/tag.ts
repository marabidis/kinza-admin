/**
 * tag controller
 */

import { factories } from '@strapi/strapi';

const defaultPopulate = {
  tagEmoji: true,
};

const applyDefaultPopulate = (ctx: { query?: Record<string, unknown> }) => {
  if (ctx.query?.populate == null) {
    ctx.query = {
      ...ctx.query,
      populate: defaultPopulate,
    };
  }
};

export default factories.createCoreController('api::tag.tag', () => ({
  async find(ctx) {
    applyDefaultPopulate(ctx);
    const { data, meta } = await super.find(ctx);

    return { data, meta };
  },

  async findOne(ctx) {
    applyDefaultPopulate(ctx);
    const { data } = await super.findOne(ctx);

    return { data };
  },

  async create(ctx) {
    applyDefaultPopulate(ctx);
    const { data } = await super.create(ctx);

    return { data };
  },

  async update(ctx) {
    applyDefaultPopulate(ctx);
    const { data } = await super.update(ctx);

    return { data };
  },
}));
