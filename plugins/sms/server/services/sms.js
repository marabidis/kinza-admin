'use strict';

const http = require('http');
const https = require('https');
const { URL, URLSearchParams } = require('url');

function getEnv(name, fallback = undefined) {
  const value = process.env[name];
  if (value === undefined || value === '') return fallback;
  return value;
}

function getEnvInt(name, fallback) {
  const raw = getEnv(name, undefined);
  if (raw === undefined) return fallback;
  const value = Number.parseInt(String(raw), 10);
  return Number.isFinite(value) ? value : fallback;
}

function isTruthy(value) {
  return /^(1|true|yes|y|on)$/i.test(String(value ?? '').trim());
}

function normalizePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 11 && digits.startsWith('8')) return `7${digits.slice(1)}`;
  if (digits.length === 10) return `7${digits}`;
  return digits;
}

function redactPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '');
  if (digits.length < 4) return digits;
  return `${digits.slice(0, 2)}***${digits.slice(-2)}`;
}

async function requestForm({ baseUrl, params, timeoutMs }) {
  const url = new URL(baseUrl);
  const body = new URLSearchParams(params).toString();
  const isHttps = url.protocol === 'https:';
  const transport = isHttps ? https : http;

  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    method: 'POST',
    path: `${url.pathname || '/'}${url.search || ''}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  return await new Promise((resolve, reject) => {
    const req = transport.request(options, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode ?? 0, body: data });
      });
    });

    req.on('error', reject);

    if (timeoutMs) {
      req.setTimeout(timeoutMs, () => {
        req.destroy(new Error(`SMS-PROSTO request timeout after ${timeoutMs}ms`));
      });
    }

    req.write(body);
    req.end();
  });
}

function parseSmsProstoJson(body) {
  return JSON.parse(String(body ?? '').trim());
}

module.exports = ({ strapi }) => ({
  async send({ to, text, priority, externalId } = {}) {
    const mode = String(getEnv('SMS_MODE', 'mock')).toLowerCase();
    const phone = normalizePhone(to);

    if (!phone) {
      throw new Error('SMS: "to" is required');
    }

    if (mode !== 'real') {
      const logText = isTruthy(getEnv('SMS_MOCK_LOG_TEXT', false));
      const safeText = logText ? ` text="${String(text ?? '')}"` : '';
      strapi?.log?.info?.(`[sms] MOCK to=${redactPhone(phone)}${safeText}`);
      return { ok: true, mode: 'mock' };
    }

    const baseUrl = getEnv('SMS_PROSTO_BASE_URL', 'https://ssl.bs00.ru/');
    const senderName = getEnv('SMS_PROSTO_SENDER_NAME', getEnv('SMS_PROSTO_SENDER', ''));
    const apiKey = getEnv('SMS_PROSTO_KEY', '');
    const email = getEnv('SMS_PROSTO_EMAIL', '');
    const password = getEnv('SMS_PROSTO_PASSWORD', '');
    const timeoutMs = getEnvInt('SMS_HTTP_TIMEOUT_MS', 10000);
    const defaultPriority = getEnvInt('SMS_PROSTO_PRIORITY', 1);

    if (!senderName) {
      throw new Error('SMS-PROSTO: SMS_PROSTO_SENDER_NAME is required');
    }

    if (!apiKey && !(email && password)) {
      throw new Error('SMS-PROSTO: provide SMS_PROSTO_KEY or SMS_PROSTO_EMAIL+SMS_PROSTO_PASSWORD');
    }

    if (!text) {
      throw new Error('SMS-PROSTO: "text" is required');
    }

    const params = {
      method: 'push_msg',
      format: 'json',
      phone,
      text: String(text),
      sender_name: senderName,
      priority: String(priority ?? defaultPriority),
    };

    if (externalId !== undefined && externalId !== null && externalId !== '') {
      params.external_id = String(externalId);
    }

    if (apiKey) {
      params.key = apiKey;
    } else {
      params.email = email;
      params.password = password;
    }

    const { statusCode, body } = await requestForm({ baseUrl, params, timeoutMs });

    if (statusCode < 200 || statusCode >= 300) {
      const bodyPreview = String(body ?? '').slice(0, 200);
      throw new Error(`SMS-PROSTO HTTP ${statusCode}: ${bodyPreview}`);
    }

    let payload;
    try {
      payload = parseSmsProstoJson(body);
    } catch (error) {
      const bodyPreview = String(body ?? '').slice(0, 200);
      const wrapped = new Error(`SMS-PROSTO invalid JSON response: ${bodyPreview}`);
      wrapped.cause = error;
      throw wrapped;
    }

    const msg = payload?.response?.msg;
    const errCodeRaw = msg?.err_code;
    const errCode = Number(errCodeRaw);

    if (!Number.isFinite(errCode)) {
      throw new Error('SMS-PROSTO: missing err_code in response');
    }

    if (errCode !== 0) {
      const errText = msg?.text || 'Unknown error';
      const error = new Error(`SMS-PROSTO error ${errCodeRaw}: ${errText}`);
      error.code = errCode;
      throw error;
    }

    const data = payload?.response?.data ?? null;
    strapi?.log?.info?.(`[sms] SMS-PROSTO ok to=${redactPhone(phone)} id=${data?.id ?? 'n/a'}`);

    return {
      ok: true,
      mode: 'real',
      provider: 'sms-prosto',
      id: data?.id,
      credits: data?.credits,
      n_raw_sms: data?.n_raw_sms,
      sender_name: data?.sender_name,
    };
  },
});

module.exports._private = {
  normalizePhone,
};
