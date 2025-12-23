'use strict';

module.exports = (plugin) => {
  /* 1. Подключаем контроллер */
  plugin.controllers['phone-auth'] = require('./controllers/phone-auth');

  /* 2. Гарантируем секцию content-api */
  if (!plugin.routes['content-api']) {
    plugin.routes['content-api'] = { routes: [] };
  }

  /* 3. Регистрируем маршруты — prefix и auth кладём внутрь config */
  plugin.routes['content-api'].routes.push(
    {
      method:  'POST',
      path:    '/phone-auth/send',
      handler: 'plugin::users-permissions.phone-auth.send',
      config:  { auth: false, prefix: '' },   // ← prefix в config
    },
    {
      method:  'POST',
      path:    '/phone-auth/confirm',
      handler: 'plugin::users-permissions.phone-auth.confirm',
      config:  { auth: false, prefix: '' },
    },
    {
      method:  'POST',
      path:    '/phone-auth/refresh',
      handler: 'plugin::users-permissions.phone-auth.refresh',
      config:  { auth: false, prefix: '' },
    },
  );

  /* 4. Логируем для проверки */
  console.log(
    '⇢ phone-auth routes:',
    plugin.routes['content-api'].routes.filter(r => r.path.includes('phone-auth'))
  );

  return plugin;
};
