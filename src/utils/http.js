// Shared fetch helper for future frontend API calls.
// This helper intentionally does not add Authorization headers,
// tokens, or credentials by default.

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

export const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: options.credentials || 'same-origin',
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

export default requestJson;
