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
const Product = require("./models/Product");
const Category = require("./models/Category");

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
/** Enforce CSP by default. Set CSP_REPORT_ONLY=true only to test without blocking. */
const cspReportOnly = process.env.CSP_REPORT_ONLY === "true";
const { helmetDirectives } = require("./utils/cspPolicy");
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
    useDefaults: false,
    directives: helmetDirectives(),
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

/** No secrets — use to verify Brevo env on Render (key set? MAIL_FROM resolved?). */
app.get("/api/monitoring/mail-debug", (req, res) => {
  try {
    const mailer = require("./utils/mailer");
    res.json({
      success: true,
      data: mailer.getMailDebugInfo ? mailer.getMailDebugInfo() : {},
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
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

app.get("/sitemap.xml", async (req, res) => {
  try {
    const siteUrl = (process.env.SITE_URL || "https://www.swagfashion.in").replace(
      /\/$/,
      ""
    );
    const staticRoutes = ["/", "/about", "/contact", "/faq", "/category/men", "/category/women", "/category/kids"];

    const [categories, products] = await Promise.all([
      Category.find({}, "slug updatedAt").lean(),
      Product.find(
        { status: "published", blacklisted: false, isVisible: { $ne: false } },
        "_id updatedAt"
      ).lean(),
    ]);

    const buildUrlNode = (path, lastmod, priority = "0.7", changefreq = "weekly") => `
  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${new Date(lastmod || Date.now()).toISOString()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

    const categoryNodes = categories
      .filter((c) => c?.slug)
      .map((c) => buildUrlNode(`/category/${c.slug}`, c.updatedAt, "0.8", "daily"))
      .join("");

    const productNodes = products
      .filter((p) => p?._id)
      .map((p) => buildUrlNode(`/product/${p._id}`, p.updatedAt, "0.7", "weekly"))
      .join("");

    const staticNodes = staticRoutes
      .map((path) => buildUrlNode(path, Date.now(), path === "/" ? "1.0" : "0.6", path === "/" ? "daily" : "monthly"))
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticNodes}${categoryNodes}${productNodes}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (error) {
    logger.error({
      type: "sitemap_generation_error",
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ success: false, message: "Failed to generate sitemap" });
  }
});

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
  try {
    require("./utils/mailer").logMailStartupHint?.();
  } catch (_) {
    /* ignore */
  }
  logger.info({
    type: "server_start",
    message: `Server running on PORT ${port}`,
    timestamp: new Date().toISOString(),
  });
});
