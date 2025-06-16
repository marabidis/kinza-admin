'use strict';

// ВАЖНО: получаем ОДИН аргумент plugin, без деструктуризации
module.exports = (plugin) => {
  // подключаем контроллер
  plugin.controllers['phone-auth'] = require('./controllers/phone-auth');

  // добавляем два публичных маршрута
  plugin.routes['content-api'].routes.push(
    {
      method: 'POST',
      path:   '/auth/phone/send',
      handler:'phone-auth.send',
      config: { auth: false },
    },
    {
      method: 'POST',
      path:   '/auth/phone/confirm',
      handler:'phone-auth.confirm',
      config: { auth: false },
    },
  );

  return plugin;
};