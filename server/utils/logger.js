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

if (!isProduction) {
  logger.add(
    new transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        printf(({ timestamp, level, message, ...meta }) => {
          const metaText = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
          return `${timestamp} ${level}: ${message}${metaText}`;
        })
      ),
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
