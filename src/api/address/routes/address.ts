export default {
  routes: [
    // ───────── LIST ─────────
    {
      method: 'GET',
      path: '/api/addresses',          // ← полный путь
      handler: 'address.find'
    },
    // ───────── SINGLE ───────
    {
      method: 'GET',
      path: '/addresses/:id',
      handler: 'address.findOne'
    },
    // ───────── CREATE ───────
    {
      method: 'POST',
      path: '/addresses',
      handler: 'address.create'
    },
    // ───────── UPDATE ───────
    {
      method: 'PUT',
      path: '/addresses/:id',
      handler: 'address.update'
    },
    // ───────── DELETE ───────
    {
      method: 'DELETE',
      path: '/addresses/:id',
      handler: 'address.delete'
    },
  ],
};