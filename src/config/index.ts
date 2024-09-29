import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export const config = {
  jwtSecret: process.env.JWT_SECRET || "yourSecretKey",
  port: process.env.PORT || 3000,
  db: {
    filename: process.env.DB_FILENAME || ":memory:", // ':memory:' for in-memory SQLite DB
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"), // 100 requests
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
    prettyPrint: process.env.NODE_ENV !== "production",
  },
  helmetContentSecurityPolicy:
    process.env.HELMET_CONTENT_SECURITY_POLICY || "false",
  helmetFrameguard: process.env.HELMET_FRAMEGUARD || "false",
  trustedScriptSources: process.env.TRUSTED_SCRIPT_SOURCES || "'self'",
  logFile: process.env.LOG_FILE || "app.log",
};
