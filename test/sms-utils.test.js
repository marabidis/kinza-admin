'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');

const smsService = require('../plugins/sms/server/services/sms');

const { normalizePhone } = smsService._private ?? {};

test('normalizePhone: empty input', () => {
  assert.equal(normalizePhone(''), '');
  assert.equal(normalizePhone(null), '');
  assert.equal(normalizePhone(undefined), '');
});

test('normalizePhone: RU numbers -> 7XXXXXXXXXX', () => {
  assert.equal(normalizePhone('+7 927 626-55-66'), '79276265566');
  assert.equal(normalizePhone('8 (927) 626-55-66'), '79276265566');
  assert.equal(normalizePhone('9276265566'), '79276265566');
});

test('normalizePhone: keeps other digit sequences', () => {
  assert.equal(normalizePhone('79991234567'), '79991234567');
  assert.equal(normalizePhone('123'), '123');
});
