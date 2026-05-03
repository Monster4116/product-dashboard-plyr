import { publicConfig } from '../config/public-config.js';

// Shared fetch helper for future frontend API calls.
// This helper intentionally does not add Authorization headers
// or credentials by default.
// If auth headers are needed later, they should be added here
// in a controlled way after the real auth model is defined.

const buildUrl = (path) => {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${publicConfig.apiBaseUrl}${path}`;
};

const readResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (error) {
      throw new Error('The server returned invalid JSON.');
    }
  }

  const text = await response.text();
  return text ? { message: text } : null;
};

export const requestJson = async (path, options = {}) => {
  const response = await fetch(buildUrl(path), {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    ...(options.credentials ? { credentials: options.credentials } : {}),
    signal: options.signal,
  });

  const payload = await readResponseBody(response);

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && payload.message) ||
      `Request failed with HTTP ${response.status}.`;

    throw new Error(message);
  }

  return payload;
};

export const getJson = async (path, options = {}) => requestJson(path, { ...options, method: 'GET' });

export const postJson = async (path, body, options = {}) =>
  requestJson(path, { ...options, method: 'POST', body });

export default requestJson;
