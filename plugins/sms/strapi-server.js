// plugins/sms/strapi-server.js

'use strict';

const smsService = require('./server/services/sms');

module.exports = ({ strapi }) => ({
  register() {},
  bootstrap() {},
  services: {
    sms: smsService({ strapi }),
  },
});
