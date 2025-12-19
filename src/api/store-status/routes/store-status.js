'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/store-status',
      handler: 'store-status.get',
      config: {
        auth: false,
      },
    },
  ],
};
