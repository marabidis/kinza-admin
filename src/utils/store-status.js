'use strict';

const { DateTime } = require('luxon');

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function clampInt(value, { min, max, fallback }) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function weekdayKeyFromDateTime(dt) {
  const idx = Number(dt?.weekday) - 1; // 1..7 (Mon..Sun)
  return WEEKDAY_KEYS[idx] ?? null;
}

function normalizeTimeString(value) {
  const time = String(value ?? '').trim();
  if (!time) return null;
  if (/^\d{2}:\d{2}$/.test(time)) return `${time}:00`;
  if (/^\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(time)) return time;
  return null;
}

function parseDateTime({ dateISO, time, zone }) {
  const normalized = normalizeTimeString(time);
  if (!normalized) return null;
  const dt = DateTime.fromISO(`${dateISO}T${normalized}`, { zone });
  return dt.isValid ? dt : null;
}

function pickOverrideForDate(overrides, dateISO) {
  const list = Array.isArray(overrides) ? overrides : [];
  return list.find((o) => String(o?.date ?? '') === dateISO) ?? null;
}

function pickWeeklyForDay(weeklySchedule, dayOfWeek) {
  const list = Array.isArray(weeklySchedule) ? weeklySchedule : [];
  return list.find((d) => String(d?.dayOfWeek ?? '') === dayOfWeek) ?? null;
}

function buildInterval({ settings, dateISO, zone }) {
  const override = pickOverrideForDate(settings?.overrides, dateISO);
  const dayOfWeek = weekdayKeyFromDateTime(DateTime.fromISO(dateISO, { zone }));
  const weekly = pickWeeklyForDay(settings?.weeklySchedule, dayOfWeek);

  const entry = override ?? weekly;
  if (!entry) return null;

  const isClosed = Boolean(entry?.isClosed);
  const opensAtRaw = entry?.opensAt ?? null;
  const closesAtRaw = entry?.closesAt ?? null;

  if (isClosed || !opensAtRaw || !closesAtRaw) {
    return { dateISO, isClosed: true, message: entry?.message ?? null };
  }

  const open = parseDateTime({ dateISO, time: opensAtRaw, zone });
  let close = parseDateTime({ dateISO, time: closesAtRaw, zone });

  if (!open || !close) {
    return { dateISO, isClosed: true, message: entry?.message ?? null };
  }

  if (close <= open) {
    close = close.plus({ days: 1 });
  }

  const cutoffMinutes = clampInt(settings?.orderCutoffMinutes, {
    min: 10,
    max: 60,
    fallback: 30,
  });

  const lastOrder = close.minus({ minutes: cutoffMinutes });

  return {
    dateISO,
    isClosed: false,
    open,
    close,
    lastOrder,
    message: entry?.message ?? null,
  };
}

function formatLocalTime(dt) {
  return dt?.isValid ? dt.toFormat('HH:mm') : '';
}

function computeNextChangeAt({ now, interval }) {
  if (!interval || interval?.isClosed) return null;
  if (now < interval.open) return interval.open;
  if (now < interval.lastOrder) return interval.lastOrder;
  if (now < interval.close) return interval.close;
  return null;
}

function findNextInterval({ settings, now, zone, lookaheadDays = 14 }) {
  for (let i = 0; i <= lookaheadDays; i += 1) {
    const dateISO = now.plus({ days: i }).toISODate();
    const interval = buildInterval({ settings, dateISO, zone });
    if (!interval || interval.isClosed) continue;

    if (i === 0) {
      if (now < interval.open) return interval;
      continue;
    }

    return interval;
  }

  return null;
}

function computeStoreStatus(settings, { now: nowInput } = {}) {
  if (!settings) {
    return {
      ok: false,
      reasonCode: 'not_configured',
      message: 'Store settings are not configured',
      serverTime: DateTime.utc().toISO(),
    };
  }

  const timezone = String(settings?.timezone || 'Europe/Saratov');
  const now = (
    nowInput instanceof DateTime
      ? nowInput
      : DateTime.fromJSDate(nowInput ? new Date(nowInput) : new Date())
  ).setZone(timezone);

  const isPaused = Boolean(settings?.isPaused);
  const deliveryEnabled = settings?.deliveryEnabled !== false;
  const pickupEnabled = Boolean(settings?.pickupEnabled);
  const orderCutoffMinutes = clampInt(settings?.orderCutoffMinutes, {
    min: 10,
    max: 60,
    fallback: 30,
  });

  const today = now.toISODate();
  const yesterday = now.minus({ days: 1 }).toISODate();

  const intervalYesterday = buildInterval({ settings, dateISO: yesterday, zone: timezone });
  const intervalToday = buildInterval({ settings, dateISO: today, zone: timezone });

  const isIn = (interval) =>
    interval && !interval.isClosed && now >= interval.open && now < interval.close;

  const currentInterval = isIn(intervalYesterday)
    ? intervalYesterday
    : isIn(intervalToday)
    ? intervalToday
    : null;

  const serverTime = DateTime.utc().toISO();

  if (!currentInterval) {
    const nextInterval = findNextInterval({ settings, now, zone: timezone });
    const opensAt = nextInterval?.open ?? null;
    const closesAt = nextInterval?.close ?? null;
    const lastOrderAt = nextInterval?.lastOrder ?? null;
    const nextChangeAt = opensAt;

    const message = isPaused
      ? String(settings?.pauseMessage || 'Приём заказов временно остановлен')
      : opensAt
      ? `Сейчас закрыто. Откроемся в ${formatLocalTime(opensAt)}`
      : 'Сейчас закрыто';

    return {
      ok: true,
      timezone,
      serverTime,
      orderCutoffMinutes,
      deliveryEnabled,
      pickupEnabled,
      isPaused,
      isOpen: false,
      canOrderNow: false,
      canOrderDeliveryNow: false,
      canOrderPickupNow: false,
      opensAt: opensAt ? opensAt.toUTC().toISO() : null,
      closesAt: closesAt ? closesAt.toUTC().toISO() : null,
      lastOrderAt: lastOrderAt ? lastOrderAt.toUTC().toISO() : null,
      nextChangeAt: nextChangeAt ? nextChangeAt.toUTC().toISO() : null,
      minutesToLastOrder: null,
      reasonCode: isPaused ? 'paused' : 'closed',
      message,
    };
  }

  const minutesToLastOrderRaw = currentInterval.lastOrder.diff(now, 'minutes').minutes;
  const minutesToLastOrder = Math.max(0, Math.ceil(minutesToLastOrderRaw));

  const scheduleNextChangeAt = computeNextChangeAt({ now, interval: currentInterval });

  const scheduleAllowsOrders = now < currentInterval.lastOrder;
  const canOrderDeliveryNow = !isPaused && deliveryEnabled && scheduleAllowsOrders;
  const canOrderPickupNow = !isPaused && pickupEnabled && scheduleAllowsOrders;
  const canOrderNow = canOrderDeliveryNow || canOrderPickupNow;

  let reasonCode = 'open';
  if (isPaused) {
    reasonCode = 'paused';
  } else if (!scheduleAllowsOrders) {
    reasonCode = 'last_order_passed';
  } else if (!canOrderNow) {
    reasonCode = 'service_disabled';
  } else if (minutesToLastOrder <= 60) {
    reasonCode = 'closing_soon';
  }

  const message =
    currentInterval?.message ||
    (reasonCode === 'paused'
      ? String(settings?.pauseMessage || 'Приём заказов временно остановлен')
      : reasonCode === 'service_disabled'
      ? 'Сейчас мы не принимаем заказы'
      : reasonCode === 'closing_soon'
      ? `Принимаем заказы ещё ${minutesToLastOrder} мин. До закрытия ${formatLocalTime(
          currentInterval.close
        )}`
      : reasonCode === 'last_order_passed'
      ? `Приём заказов завершён. Закрываемся в ${formatLocalTime(currentInterval.close)}`
      : '');

  return {
    ok: true,
    timezone,
    serverTime,
    orderCutoffMinutes,
    deliveryEnabled,
    pickupEnabled,
    isPaused,
    isOpen: true,
    canOrderNow,
    canOrderDeliveryNow,
    canOrderPickupNow,
    opensAt: currentInterval.open.toUTC().toISO(),
    closesAt: currentInterval.close.toUTC().toISO(),
    lastOrderAt: currentInterval.lastOrder.toUTC().toISO(),
    nextChangeAt: scheduleNextChangeAt ? scheduleNextChangeAt.toUTC().toISO() : null,
    minutesToLastOrder,
    reasonCode,
    message,
  };
}

module.exports = {
  computeStoreStatus,
  _private: {
    buildInterval,
    parseDateTime,
    weekdayKeyFromDateTime,
  },
};
