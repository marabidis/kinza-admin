'use strict';

const toInteger = (value) => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeTier = (tier) => {
  const minOrder = toInteger(tier?.minOrder);
  const fee = toInteger(tier?.fee);

  if (minOrder === null || fee === null) {
    return null;
  }

  const order = toInteger(tier?.order);

  return {
    label: tier?.label ? String(tier.label) : null,
    minOrder,
    fee,
    order,
  };
};

const normalizeTiers = (tiers) => {
  if (!Array.isArray(tiers)) return [];

  return tiers
    .map(normalizeTier)
    .filter(Boolean)
    .sort((a, b) => {
      if (a.minOrder !== b.minOrder) return a.minOrder - b.minOrder;
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderA - orderB;
    });
};

const buildDeliveryRules = (settings) => ({
  courier: normalizeTiers(settings?.courierTiers),
  pickup: normalizeTiers(settings?.pickupTiers),
});

const resolveDeliveryFee = ({ deliveryType, totalPrice, rules }) => {
  const deliveryKey = deliveryType === 'pickup' ? 'pickup' : 'courier';
  const tiers = rules?.[deliveryKey] || [];

  if (!tiers.length) {
    return { ok: false, code: 'rules_missing', deliveryType: deliveryKey };
  }

  const price = toInteger(totalPrice);
  if (price === null || price < 0) {
    return { ok: false, code: 'invalid_total' };
  }

  let matched = null;
  for (const tier of tiers) {
    if (price >= tier.minOrder) {
      matched = tier;
    }
  }

  if (!matched) {
    return {
      ok: false,
      code: 'min_order_not_met',
      requiredMin: tiers[0].minOrder,
      deliveryType: deliveryKey,
    };
  }

  return {
    ok: true,
    fee: matched.fee,
    appliedMin: matched.minOrder,
    deliveryType: deliveryKey,
  };
};

module.exports = {
  buildDeliveryRules,
  resolveDeliveryFee,
};
