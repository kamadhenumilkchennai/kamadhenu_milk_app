// Small logger wrapper to centralize logging and gate logs in production.
const isDebug = process.env.NODE_ENV !== "production";

export const log = (...args: unknown[]) => {
  if (!isDebug) return;
  // eslint-disable-next-line no-console
  console.log(...args);
};

export const warn = (...args: unknown[]) => {
  // Always show warnings to help diagnose missing envs, but limit noise in prod
  // eslint-disable-next-line no-console
  console.warn(...args);
};

export const error = (...args: unknown[]) => {
  // eslint-disable-next-line no-console
  console.error(...args);
};

export default { log, warn, error };
