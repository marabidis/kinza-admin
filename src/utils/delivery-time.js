'use strict';

const { DateTime } = require('luxon');

const DEFAULTS = {
  windowMinutes: 30,
  stepMinutes: 15,
  minLeadMinutes: 45,
  prepTimeMinutes: 25,
};

const clampInt = (value, { min, max, fallback }) => {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
};

const resolveDeliveryTimeSettings = (settings) => {
  const windowMinutes = clampInt(settings?.deliveryWindowMinutes, {
    min: 10,
    max: 120,
    fallback: DEFAULTS.windowMinutes,
  });
  const stepMinutes = clampInt(settings?.slotStepMinutes, {
    min: 5,
    max: 60,
    fallback: DEFAULTS.stepMinutes,
  });
  const minLeadMinutes = clampInt(settings?.minLeadMinutes, {
    min: 0,
    max: 240,
    fallback: DEFAULTS.minLeadMinutes,
  });
  const prepTimeMinutes = clampInt(settings?.prepTimeMinutes, {
    min: 0,
    max: 240,
    fallback: DEFAULTS.prepTimeMinutes,
  });

  return {
    windowMinutes,
    stepMinutes,
    minLeadMinutes,
    prepTimeMinutes,
  };
};

const roundUpToStep = (dt, stepMinutes) => {
  if (!dt?.isValid || !stepMinutes) return dt;
  const stepMs = stepMinutes * 60 * 1000;
  const roundedMs = Math.ceil(dt.toMillis() / stepMs) * stepMs;
  return DateTime.fromMillis(roundedMs, { zone: dt.zoneName });
};

const parseISOToZone = (value, zone) => {
  if (!value) return null;
  const dt = DateTime.fromISO(String(value), { zone: 'utc' }).setZone(zone);
  return dt.isValid ? dt : null;
};

const getStatusDateTimes = (status) => {
  const zone = status?.timezone || 'Europe/Saratov';
  const now = parseISOToZone(status?.serverTime, zone) || DateTime.utc().setZone(zone);
  const open = parseISOToZone(status?.opensAt, zone);
  const close = parseISOToZone(status?.closesAt, zone);
  return { zone, now, open, close };
};

const isAlignedToStep = (dt, stepMinutes) => {
  if (!dt?.isValid || !stepMinutes) return false;
  return dt.second === 0 && dt.millisecond === 0 && dt.minute % stepMinutes === 0;
};

const buildSlots = ({ status, windowMinutes, stepMinutes, minLeadMinutes, prepTimeMinutes }) => {
  if (!status?.ok || !status.canOrderDeliveryNow) {
    return [];
  }

  const { now, open, close } = getStatusDateTimes(status);
  if (!open || !close || !now.isValid || close <= open) {
    return [];
  }

  const effectiveLeadMinutes = Math.max(minLeadMinutes, prepTimeMinutes);
  let start = roundUpToStep(now.plus({ minutes: effectiveLeadMinutes }), stepMinutes);
  if (start < open) {
    start = roundUpToStep(open, stepMinutes);
  }

  const lastStart = close.minus({ minutes: windowMinutes });
  if (!lastStart.isValid || start > lastStart) {
    return [];
  }

  const slots = [];
  for (let cursor = start; cursor <= lastStart; cursor = cursor.plus({ minutes: stepMinutes })) {
    const end = cursor.plus({ minutes: windowMinutes });
    slots.push({
      start: cursor.toUTC().toISO(),
      end: end.toUTC().toISO(),
    });
  }

  return slots;
};

const buildDeliveryTime = ({ status, settings }) => {
  if (!status?.ok) {
    return null;
  }

  const normalized = resolveDeliveryTimeSettings(settings);
  const slots = buildSlots({
    status,
    ...normalized,
  });

  return {
    ...normalized,
    slots,
  };
};

const validateDeliveryTimeSelection = ({ status, deliveryTime, mode, scheduledAtISO }) => {
  if (!status?.ok || !deliveryTime) {
    return { ok: false, errorType: 'invalid' };
  }

  const hasMode = mode !== undefined && mode !== null;
  if (hasMode && typeof mode !== 'string') {
    return { ok: false, errorType: 'invalid' };
  }
  const rawMode = typeof mode === 'string' ? mode.trim() : '';
  const normalizedMode = rawMode === '' ? 'asap' : rawMode;
  if (normalizedMode !== 'asap' && normalizedMode !== 'slot') {
    return { ok: false, errorType: 'invalid' };
  }
  const { windowMinutes, stepMinutes, minLeadMinutes, prepTimeMinutes } = deliveryTime;

  const { now, open, close } = getStatusDateTimes(status);
  if (!open || !close || !now.isValid || close <= open) {
    return { ok: false, errorType: 'invalid' };
  }

  const effectiveLeadMinutes = Math.max(minLeadMinutes, prepTimeMinutes);
  const earliest = roundUpToStep(now.plus({ minutes: effectiveLeadMinutes }), stepMinutes);
  const lastStart = close.minus({ minutes: windowMinutes });
  if (!earliest?.isValid || !lastStart?.isValid || earliest > lastStart) {
    return { ok: false, errorType: 'unavailable' };
  }

  if (normalizedMode === 'asap') {
    return {
      ok: true,
      mode: normalizedMode,
      scheduledAt: earliest.toUTC().toISO(),
      windowMinutes,
    };
  }

  if (!scheduledAtISO) {
    return { ok: false, errorType: 'invalid' };
  }

  const scheduledAt = parseISOToZone(scheduledAtISO, status?.timezone || 'Europe/Saratov');
  if (!scheduledAt?.isValid || !isAlignedToStep(scheduledAt, stepMinutes)) {
    return { ok: false, errorType: 'invalid' };
  }

  if (scheduledAt < earliest) {
    return { ok: false, errorType: 'unavailable' };
  }

  if (scheduledAt > lastStart) {
    return { ok: false, errorType: 'unavailable' };
  }

  return {
    ok: true,
    mode: normalizedMode,
    scheduledAt: scheduledAt.toUTC().toISO(),
    windowMinutes,
  };
};

module.exports = {
  buildDeliveryTime,
  resolveDeliveryTimeSettings,
  validateDeliveryTimeSelection,
};
