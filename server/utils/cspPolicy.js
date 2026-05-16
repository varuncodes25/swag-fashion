/**
 * Shared Content-Security-Policy (enforced — blocks violations).
 * Keep in sync with client/vercel.json Content-Security-Policy header.
 */
const { isProduction } = require("./rateLimitConfig");

const parseOrigin = (url) => {
  if (!url || typeof url !== "string") return null;
  try {
    return new URL(url.trim()).origin;
  } catch {
    return null;
  }
};

const buildConnectSrc = () => {
  const sources = [
    "'self'",
    "https://api.razorpay.com",
    "https://res.cloudinary.com",
    "https://accounts.google.com",
    "https://oauth2.googleapis.com",
    "https://swagfashion.in",
    "https://www.swagfashion.in",
    "https://*.vercel.app",
    "https://*.onrender.com",
    "http://localhost:5000",
    "http://localhost:5173",
  ];

  const apiOrigin =
    parseOrigin(process.env.API_PUBLIC_URL) ||
    parseOrigin(process.env.VITE_API_URL) ||
    parseOrigin(process.env.BACKEND_URL);

  if (apiOrigin && !sources.includes(apiOrigin)) {
    sources.push(apiOrigin);
  }

  return sources;
};

const helmetDirectives = () => ({
  defaultSrc: ["'self'"],
  baseUri: ["'self'"],
  objectSrc: ["'none'"],
  scriptSrc: [
    "'self'",
    "https://checkout.razorpay.com",
    "https://accounts.google.com",
    "https://www.gstatic.com",
  ],
  styleSrc: ["'self'", "https:", "'unsafe-inline'"],
  imgSrc: [
    "'self'",
    "data:",
    "blob:",
    "https://res.cloudinary.com",
    "https://lh3.googleusercontent.com",
    "https://api.dicebear.com",
    "https://images.pexels.com",
    "https://via.placeholder.com",
  ],
  fontSrc: ["'self'", "https:", "data:"],
  connectSrc: buildConnectSrc(),
  frameSrc: [
    "'self'",
    "https://checkout.razorpay.com",
    "https://api.razorpay.com",
    "https://accounts.google.com",
  ],
  workerSrc: ["'self'", "blob:"],
  formAction: ["'self'", "https://accounts.google.com"],
  upgradeInsecureRequests: isProduction ? [] : null,
});

/** Single-line header for Vercel / meta tags */
const toHeaderValue = () => {
  const d = helmetDirectives();
  const parts = [];

  const add = (name, values) => {
    if (values == null) return;
    const list = Array.isArray(values) ? values.filter(Boolean) : [values];
    if (!list.length) return;
    if (list.length === 1 && list[0] === []) return;
    parts.push(`${name} ${list.join(" ")}`);
  };

  add("default-src", d.defaultSrc);
  add("base-uri", d.baseUri);
  add("object-src", d.objectSrc);
  add("script-src", d.scriptSrc);
  add("style-src", d.styleSrc);
  add("img-src", d.imgSrc);
  add("font-src", d.fontSrc);
  add("connect-src", d.connectSrc);
  add("frame-src", d.frameSrc);
  add("worker-src", d.workerSrc);
  add("form-action", d.formAction);
  if (isProduction) {
    parts.push("upgrade-insecure-requests");
  }

  return parts.join("; ");
};

module.exports = {
  helmetDirectives,
  toHeaderValue,
};
