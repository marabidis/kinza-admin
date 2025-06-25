/**
 * Address controller
 *
 * «Мягкие» ручки: каждый пользователь может видеть / изменять
 * только свои собственные адреса.
 */
import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';          // ← добавили
const { ForbiddenError } = errors;               // ← вытаскиваем класс ошибки

export default factories.createCoreController(
  'api::address.address',
  ({ strapi }) => ({
    /*──────────────────────────── Helpers ───────────────────────────*/
    /**
     * Проверяем, что запись принадлежит текущему пользователю.
     * Если нет — бросаем ForbiddenError (403).
     */
    async checkOwner(id: number, userId: number) {
      const entity = await strapi.db
        .query('api::address.address')
        .findOne({ where: { id, user: userId } });

      if (!entity) {
        throw new ForbiddenError('Forbidden');
      }
      return entity;
    },

    /*──────────────────────────── LIST ──────────────────────────────*/
    /** GET /addresses — все адреса текущего пользователя */
    async find(ctx) {
      const user = ctx.state.user;

      const entities = await strapi.db
        .query('api::address.address')
        .findMany({
          where: { user: user.id },
          orderBy: { updatedAt: 'desc' },
          populate: '*',
        });

      return this.transformResponse(entities);
    },

    /*────────────────────────── SINGLE GET ─────────────────────────*/
    /** GET /addresses/:id */
    async findOne(ctx) {
      const user = ctx.state.user;
      const id = Number(ctx.params.id);

      const entity = await this.checkOwner(id, user.id);
      return this.transformResponse(entity);
    },

    /*──────────────────────────── CREATE ───────────────────────────*/
    /** POST /addresses */
    async create(ctx) {
      const user = ctx.state.user;
      const data = {
        ...ctx.request.body.data,
        user: user.id, // фиксируем владельца
      };

      const entity = await strapi.entityService.create(
        'api::address.address',
        { data, populate: '*' }
      );

      return this.transformResponse(entity);
    },

    /*──────────────────────────── UPDATE ───────────────────────────*/
    /** PUT /addresses/:id */
    async update(ctx) {
      const user = ctx.state.user;
      const id = Number(ctx.params.id);

      await this.checkOwner(id, user.id);

      const entity = await strapi.entityService.update(
        'api::address.address',
        id,
        { data: ctx.request.body.data, populate: '*' }
      );

      return this.transformResponse(entity);
    },

    /*──────────────────────────── DELETE ───────────────────────────*/
    /** DELETE /addresses/:id */
    async delete(ctx) {
      const user = ctx.state.user;
      const id = Number(ctx.params.id);

      await this.checkOwner(id, user.id);

      const entity = await strapi.entityService.delete(
        'api::address.address',
        id
      );

      return this.transformResponse(entity);
    },
  })
);