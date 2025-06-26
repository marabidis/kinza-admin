// plugins/sms/strapi-server.js

'use strict';

module.exports = ({ strapi }) => ({
  register() {},
  bootstrap() {},
  services: {
    sms: {
      async send({ to, text }) {
        return true;Í
      },
    },
  },
});