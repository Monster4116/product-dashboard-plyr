// This module is for browser-safe configuration only.
// Anything stored here should be safe if a user inspects it in DevTools.
// Do not place service_role keys, database passwords, private tokens,
// or any other privileged secrets in this file.

const getPublicValue = (name, fallback) => {
  if (typeof window !== 'undefined' && window.__PUBLIC_CONFIG__ && name in window.__PUBLIC_CONFIG__) {
    return window.__PUBLIC_CONFIG__[name];
  }

  return fallback;
};

export const publicConfig = {
  // Safe default for future local/static usage.
  apiBaseUrl: getPublicValue('apiBaseUrl', '/api'),
  appEnv: getPublicValue('appEnv', 'local'),
};

export default publicConfig;
