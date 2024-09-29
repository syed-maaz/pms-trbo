import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger"; // Now logger implements ILogger

/**
 * Middleware to log each incoming request and its response details.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startHrTime = process.hrtime();

  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(startHrTime);
    const responseTimeInMs = (seconds * 1e3 + nanoseconds * 1e-6).toFixed(2);

    logger.info("Request completed", {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTimeInMs} ms`,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });
  });

  next();
}
