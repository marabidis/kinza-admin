export default {
  routes: [
    { method: 'GET',    path: '/addresses',       handler: 'address.find'     },
    { method: 'GET',    path: '/addresses/:id',   handler: 'address.findOne'  },
    { method: 'POST',   path: '/addresses',       handler: 'address.create'   },
    { method: 'PUT',    path: '/addresses/:id',   handler: 'address.update'   },
    { method: 'DELETE', path: '/addresses/:id',   handler: 'address.delete'   },
  ],
};