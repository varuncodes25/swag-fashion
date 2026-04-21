const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { readdirSync } = require("fs");
const { connectDb } = require("./db/connection");
const { notFound, errorHandler } = require("./middlewares/error.middleware");
const securityLogger = require("./middlewares/securityLogger");
const { logger, morganStream } = require("./utils/logger");
const { requestMetrics, getMetricsSnapshot } = require("./middlewares/requestMetrics");
const { buildLimiter, toNumber, isProduction } = require("./utils/rateLimitConfig");

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
const cspReportOnly = process.env.CSP_REPORT_ONLY !== "false";
const parseTrustProxy = (value) => {
  if (value == null || value === "") return isProduction ? 1 : false;
  if (value === "true") return true;
  if (value === "false") return false;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};
const trustProxy = parseTrustProxy(process.env.TRUST_PROXY);

if (trustProxy) {
  app.set("trust proxy", trustProxy);
}

const apiLimiter = buildLimiter({
  envPrefix: "API",
  windowMs: toNumber(process.env.API_LIMIT_WINDOW_MS, 60 * 1000),
  max: toNumber(process.env.API_LIMIT_MAX, 120),
  message: { message: "Too many requests. Please try again shortly." },
});

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);
app.use(
  helmet.contentSecurityPolicy({
    reportOnly: cspReportOnly,
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"],
      connectSrc: [
        "'self'",
        "https://api.razorpay.com",
        "https://apiv2.shiprocket.in",
        "https://res.cloudinary.com",
        "https://*.vercel.app",
        "https://accounts.google.com",
        "https://oauth2.googleapis.com",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://res.cloudinary.com",
        "https://lh3.googleusercontent.com",
      ],
      frameSrc: [
        "'self'",
        "https://checkout.razorpay.com",
        "https://api.razorpay.com",
        "https://accounts.google.com",
      ],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      fontSrc: ["'self'", "https:", "data:"],
      upgradeInsecureRequests: isProduction ? [] : null,
      reportUri: ["/api/security/csp-report"],
    },
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));
app.use(requestMetrics);
app.use(securityLogger);
app.use(
  morgan(
    (tokens, req, res) =>
      JSON.stringify({
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        statusCode: Number(tokens.status(req, res)),
        responseTimeMs: Number(tokens["response-time"](req, res)),
        contentLength: tokens.res(req, res, "content-length") || "0",
        ip: req.clientIp || tokens["remote-addr"](req, res),
        forwardedFor: tokens.req(req, res, "x-forwarded-for") || null,
        userAgent: tokens.req(req, res, "user-agent") || "unknown",
        referrer: tokens.referrer(req, res) || null,
        origin: tokens.req(req, res, "origin") || null,
        userId: req.user?._id || req.user?.id || null,
        hasAuthHeader: Boolean(req.headers.authorization),
        requestId: req.requestId || tokens.req(req, res, "x-request-id") || null,
      }),
    {
      stream: morganStream,
      skip: (req) => req.path === "/api/monitoring/health",
    }
  )
);

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://swag-fashion-bcah.vercel.app",
        "https://swagfashion.in",
        "https://www.swagfashion.in",
      ];
      const isVercelPreview = origin && /^https:\/\/swag-fashion.*\.vercel\.app$/.test(origin);

      if (!origin || allowedOrigins.includes(origin) || isVercelPreview) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Connect to MongoDB
connectDb();

// Health check
app.get("/", (req, res) => {
  res.send(`<center><h1>✅ Server Running on PORT: ${port}</h1></center>`);
});

app.get("/api/monitoring/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/monitoring/metrics", (req, res) => {
  res.json({
    success: true,
    data: getMetricsSnapshot(),
  });
});

app.get("/api/monitoring/request-context", (req, res) => {
  res.json({
    success: true,
    data: {
      requestId: req.requestId || null,
      ip: req.clientIp || req.ip || null,
      forwardedFor: req.headers["x-forwarded-for"] || null,
      hasAuthHeader: Boolean(req.headers.authorization),
      userAgent: req.headers["user-agent"] || null,
      origin: req.headers.origin || null,
    },
  });
});

app.post(
  "/api/security/csp-report",
  express.json({
    type: ["application/csp-report", "application/reports+json", "application/json"],
  }),
  (req, res) => {
    if (!cspReportOnly && !isProduction) return res.status(204).end();
    logger.warn({
      type: "csp_violation",
      body: req.body || null,
      requestId: req.requestId || null,
      timestamp: new Date().toISOString(),
    });
    return res.status(204).end();
  }
);

// Load routes dynamically
app.use("/api", apiLimiter);
readdirSync("./routes").forEach((route) => {
  app.use("/api", require(`./routes/${route}`));
});

// Catch-all 404
app.use(notFound);

// ✅ Error Handler (last middleware)
app.use(errorHandler);
// Start server
app.listen(port, () => {
  logger.info({
    type: "server_start",
    message: `Server running on PORT ${port}`,
    timestamp: new Date().toISOString(),
  });
});
