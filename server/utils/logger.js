const fs = require("fs");
const path = require("path");
const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const { combine, timestamp, json, colorize, printf, errors } = format;
const isProduction = process.env.NODE_ENV === "production";
const onRender = process.env.RENDER === "true";
const loggerLevel = process.env.LOG_LEVEL || (isProduction ? "info" : "http");

const jsonFormat = combine(timestamp(), errors({ stack: true }), json());

const dailyRotateTransport = new transports.DailyRotateFile({
  filename: path.join(logDir, "application-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  auditFile: path.join(logDir, "application-audit.json"),
});

const errorRotateTransport = new transports.DailyRotateFile({
  filename: path.join(logDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "20m",
  maxFiles: "30d",
  auditFile: path.join(logDir, "error-audit.json"),
});

const logger = createLogger({
  level: loggerLevel,
  format: jsonFormat,
  defaultMeta: { service: "swag-fashion-api" },
  transports: [dailyRotateTransport, errorRotateTransport],
});

const formatConsoleLine = (info) => {
  const { timestamp, level, message, service, ...meta } = info;
  const { type, ...rest } = meta;

  if (type === "http_access") {
    const ms =
      rest.responseTimeMs != null ? ` ${Math.round(rest.responseTimeMs)}ms` : "";
    return `${timestamp} ${level}: ${rest.method} ${rest.url} → ${rest.statusCode}${ms}`;
  }

  if (type === "security_event") {
    return `${timestamp} ${level}: Security ${rest.method} ${rest.path} → ${rest.statusCode} (${rest.durationMs}ms)`;
  }

  if (type === "route_loaded") {
    return `${timestamp} ${level}: Route loaded → ${rest.file}`;
  }

  if (type === "route_load_failed") {
    return `${timestamp} ${level}: Route failed → ${rest.file}: ${rest.message}`;
  }

  if (type === "server_start") {
    return `${timestamp} ${level}: ${message}`;
  }

  if (type === "db_connected") {
    return `${timestamp} ${level}: ${message}`;
  }

  if (type === "db_connect_error") {
    return `${timestamp} ${level}: ${message}${rest.stack ? `\n  ${rest.stack}` : ""}`;
  }

  if (type === "unhandled_error" || type === "sitemap_generation_error") {
    const detail = [rest.path && `${rest.method} ${rest.path}`, rest.message]
      .filter(Boolean)
      .join(" — ");
    return `${timestamp} ${level}: ${detail || message}${rest.stack ? `\n  ${rest.stack}` : ""}`;
  }

  const extras = Object.entries(rest)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`)
    .join(", ");

  const label = type ? `[${type}] ` : "";
  return `${timestamp} ${level}: ${label}${message}${extras ? ` (${extras})` : ""}`;
};

if (!isProduction) {
  logger.add(
    new transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        printf(formatConsoleLine)
      ),
    })
  );
} else if (onRender) {
  // Production file-only by default — Render log stream needs stdout
  logger.add(
    new transports.Console({
      format: combine(errors({ stack: true }), timestamp(), json()),
    })
  );
}

const morganStream = {
  write: (message) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    try {
      const parsed = JSON.parse(trimmed);
      logger.http("HTTP access", { type: "http_access", ...parsed });
    } catch {
      logger.http(trimmed);
    }
  },
};

module.exports = { logger, morganStream };
