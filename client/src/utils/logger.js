const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDev) console.log("[LOG]", ...args);
  },
  warn: (...args) => {
    if (isDev) console.warn("[WARN]", ...args);
  },
  error: (...args) => {
    console.error("[ERROR]", ...args);
  }
};
