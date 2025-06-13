import phoneAuth from './controllers/phone-auth';

export default (plugin) => {
  plugin.controllers['phone-auth'] = phoneAuth;

  plugin.routes['content-api'].routes.push(
    {
      method: 'POST',
      path: '/auth/phone/send',
      handler: 'phone-auth.send',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/auth/phone/confirm',
      handler: 'phone-auth.confirm',
      config: { auth: false },
    }
  );

  return plugin;
};
