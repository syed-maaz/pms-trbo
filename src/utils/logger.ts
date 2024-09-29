import fs from "fs";
import path from "path";
import pino from "pino";
import { config } from "../config";

const logDir = path.join(__dirname, "..", "logs");

// Ensure the log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Specify the file path for logging
const logDestination = pino.destination({
  dest: path.join(logDir, config.logFile), // Path for log file
  sync: true,
});

export const logger = pino(
  {
    level: config.logging.level,
    transport:
      config.logging.prettyPrint && false
        ? {
            target: "pino-pretty",
            options: {
              colorize: true, // Colorize the output for development
              translateTime: true, // Human-readable time
              sync: true, // Synchronous logging for pretty-printing
            },
          }
        : undefined, // No transport in production for JSON logs
  },
  logDestination
);
