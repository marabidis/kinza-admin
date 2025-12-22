const ACTIVE_ORDER_STATUSES = ['new', 'cooking', 'on_way'];

export default {
  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    const activeOrder = await strapi.db.query('api::order.order').findOne({
      where: { user: user.id, status: { $in: ACTIVE_ORDER_STATUSES } },
      select: ['id'],
    });

    if (activeOrder) {
      ctx.status = 409;
      ctx.body = { ok: false, error: 'active_orders' };
      return;
    }

    const anonymizedEmail = `deleted_${user.id}@example.invalid`;
    const anonymizedUsername = `deleted_${user.id}`;
    const deletedAt = user.deletedAt ? new Date(user.deletedAt) : new Date();

    const addresses = await strapi.db.query('api::address.address').findMany({
      where: { user: user.id },
      select: ['id'],
    });

    if (addresses.length > 0) {
      await strapi.db.query('api::address.address').deleteMany({
        where: { id: { $in: addresses.map((address) => address.id) } },
      });
    }

    const orderLinks = await strapi.db
      .connection('orders_user_links')
      .select('order_id')
      .where('user_id', user.id);

    const orderIds = orderLinks
      .map((row) => row.order_id)
      .filter((orderId) => typeof orderId === 'number');

    if (orderIds.length > 0) {
      await strapi.db.query('api::order.order').updateMany({
        where: { id: { $in: orderIds } },
        data: {
          phone: null,
          shipping_address: null,
          comment: null,
          details: null,
        },
      });

      await strapi.db.connection('orders_address_links').whereIn('order_id', orderIds).del();
      await strapi.db.connection('orders_user_links').whereIn('order_id', orderIds).del();
    }

    await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: user.id },
      data: {
        blocked: true,
        deletedAt,
        phone: null,
        email: anonymizedEmail,
        username: anonymizedUsername,
        resetPasswordToken: null,
        confirmationToken: null,
        provider: null,
      },
    });

    ctx.send({ ok: true });
  },
};
