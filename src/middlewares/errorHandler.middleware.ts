import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export interface CustomError extends Error {
  statusCode?: number;
}

/**
 * Centralized error handling middleware for the application.
 * Catches errors and sends a standardized response to the client.
 */
export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error
  logger.error("Error occurred", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : null, // Include stack trace in dev mode
    path: req.path,
    method: req.method,
    statusCode: err.statusCode || 500,
  });

  // Send error response to the client
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }), // Show stack trace in development mode
    statusCode: err.statusCode || 500,
  });
}
