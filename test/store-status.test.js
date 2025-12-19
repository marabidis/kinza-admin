'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');

const { DateTime } = require('luxon');

const { computeStoreStatus } = require('../src/utils/store-status');

test('computeStoreStatus: not configured', () => {
  const res = computeStoreStatus(null);
  assert.equal(res.ok, false);
  assert.equal(res.reasonCode, 'not_configured');
});

test('computeStoreStatus: open and can order', () => {
  const settings = {
    timezone: 'UTC',
    orderCutoffMinutes: 30,
    deliveryEnabled: true,
    pickupEnabled: false,
    isPaused: false,
    weeklySchedule: [{ dayOfWeek: 'mon', isClosed: false, opensAt: '10:00', closesAt: '23:00' }],
    overrides: [],
  };

  const now = DateTime.fromISO('2025-01-06T12:00:00', { zone: 'UTC' }); // Mon
  const res = computeStoreStatus(settings, { now });
  assert.equal(res.ok, true);
  assert.equal(res.isOpen, true);
  assert.equal(res.canOrderNow, true);
  assert.equal(res.reasonCode, 'open');
});

test('computeStoreStatus: closing soon', () => {
  const settings = {
    timezone: 'UTC',
    orderCutoffMinutes: 30,
    deliveryEnabled: true,
    isPaused: false,
    weeklySchedule: [{ dayOfWeek: 'mon', isClosed: false, opensAt: '10:00', closesAt: '23:00' }],
  };

  const now = DateTime.fromISO('2025-01-06T22:10:00', { zone: 'UTC' }); // lastOrderAt 22:30
  const res = computeStoreStatus(settings, { now });
  assert.equal(res.isOpen, true);
  assert.equal(res.canOrderNow, true);
  assert.equal(res.reasonCode, 'closing_soon');
  assert.equal(res.minutesToLastOrder, 20);
});

test('computeStoreStatus: last order passed but still open', () => {
  const settings = {
    timezone: 'UTC',
    orderCutoffMinutes: 30,
    deliveryEnabled: true,
    isPaused: false,
    weeklySchedule: [{ dayOfWeek: 'mon', isClosed: false, opensAt: '10:00', closesAt: '23:00' }],
  };

  const now = DateTime.fromISO('2025-01-06T22:40:00', { zone: 'UTC' }); // after lastOrderAt 22:30
  const res = computeStoreStatus(settings, { now });
  assert.equal(res.isOpen, true);
  assert.equal(res.canOrderNow, false);
  assert.equal(res.reasonCode, 'last_order_passed');
});

test('computeStoreStatus: closed before open', () => {
  const settings = {
    timezone: 'UTC',
    orderCutoffMinutes: 30,
    weeklySchedule: [{ dayOfWeek: 'mon', isClosed: false, opensAt: '10:00', closesAt: '23:00' }],
  };

  const now = DateTime.fromISO('2025-01-06T09:00:00', { zone: 'UTC' });
  const res = computeStoreStatus(settings, { now });
  assert.equal(res.isOpen, false);
  assert.equal(res.canOrderNow, false);
  assert.equal(res.reasonCode, 'closed');
  assert.equal(res.nextChangeAt, '2025-01-06T10:00:00.000Z');
});

test('computeStoreStatus: override closed', () => {
  const settings = {
    timezone: 'UTC',
    orderCutoffMinutes: 30,
    weeklySchedule: [{ dayOfWeek: 'mon', isClosed: false, opensAt: '10:00', closesAt: '23:00' }],
    overrides: [{ date: '2025-01-06', isClosed: true }],
  };

  const now = DateTime.fromISO('2025-01-06T12:00:00', { zone: 'UTC' });
  const res = computeStoreStatus(settings, { now });
  assert.equal(res.isOpen, false);
  assert.equal(res.reasonCode, 'closed');
});

test('computeStoreStatus: overnight interval from previous day', () => {
  const settings = {
    timezone: 'UTC',
    orderCutoffMinutes: 30,
    weeklySchedule: [{ dayOfWeek: 'mon', isClosed: false, opensAt: '18:00', closesAt: '02:00' }],
  };

  const now = DateTime.fromISO('2025-01-07T00:00:00', { zone: 'UTC' }); // Tue 00:00, still open from Mon
  const res = computeStoreStatus(settings, { now });
  assert.equal(res.isOpen, true);
  assert.equal(res.reasonCode, 'open');
});
