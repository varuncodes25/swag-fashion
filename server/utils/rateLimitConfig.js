const rateLimit = require("express-rate-limit");

const isProduction = process.env.NODE_ENV === "production";

const toNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/**
 * Build rate limiter with optional env override:
 * envPrefix examples: LOGIN, SIGNUP, API, CART_READ
 * - ${envPrefix}_LIMIT_MAX
 * - ${envPrefix}_LIMIT_WINDOW_MS
 */
const buildLimiter = ({ envPrefix, windowMs, max, message }) => {
  const devMultiplier = toNumber(process.env.DEV_RATE_LIMIT_MULTIPLIER, 4);
  const computedMax = isProduction ? max : Math.ceil(max * devMultiplier);

  const finalMax = toNumber(
    envPrefix ? process.env[`${envPrefix}_LIMIT_MAX`] : undefined,
    computedMax
  );
  const finalWindowMs = toNumber(
    envPrefix ? process.env[`${envPrefix}_LIMIT_WINDOW_MS`] : undefined,
    windowMs
  );

  return rateLimit({
    windowMs: finalWindowMs,
    max: finalMax,
    standardHeaders: true,
    legacyHeaders: false,
    message,
  });
};

module.exports = { buildLimiter, toNumber, isProduction };
