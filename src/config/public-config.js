// This module is for browser-safe configuration only.
// Anything stored here should be safe if a user inspects it in DevTools.
// Safe examples: environment labels, API base paths, non-sensitive feature flags.
// Unsafe examples: service_role keys, database passwords, private tokens,
// or any other privileged secrets.

const getPublicValue = (name, fallback) => {
  if (typeof window !== 'undefined' && window.__PUBLIC_CONFIG__ && name in window.__PUBLIC_CONFIG__) {
    return window.__PUBLIC_CONFIG__[name];
  }

  return fallback;
};

export const publicConfig = {
  appEnv: getPublicValue('appEnv', 'local'),
  // The frontend should call a safe API boundary, not the database directly.
  apiBaseUrl: getPublicValue('apiBaseUrl', '/api'),
};

export default publicConfig;
