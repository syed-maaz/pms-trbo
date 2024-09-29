import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";

// Import the Express module

// Extend the Express Request interface to include a `user` field
declare module "express" {
  export interface Request {
    user?: string | JwtPayload; // `JwtPayload` is the type returned from `jwt.verify()`
  }
}

/**
 * Authentication middleware for verifying the JWT token.
 * For testing purposes, this only checks the presence and validity of the JWT.
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Get the authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ message: "Authorization header missing or malformed" });
    return;
  }

  const token = authHeader.split(" ")[1]; // Extract the JWT from the 'Bearer <token>' format

  try {
    // Verify the JWT using the secret key
    const decoded = jwt.verify(token, config.jwtSecret);

    // Attach the decoded payload to the request object (optional)
    req.user = decoded; // This can be used later if needed

    // If everything is fine, proceed to the next middleware/controller
    next();
  } catch (err) {
    // If JWT verification fails, return a 401 Unauthorized response
    res.status(401).json({ message: "Invalid token" });
  }
}

/**
 * Authorization middleware for checking the user's role.
 * The middleware takes the required role(s) as arguments and checks if the authenticated user has the appropriate role.
 * @param roles - Allowed roles for the route.
 */
export function authorizeRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Make sure the user is authenticated and has a role
    if (!req.user || typeof req.user === "string" || !("role" in req.user)) {
      res.status(403).json({ message: "Access denied" });
    }

    // Check if the user's role is in the allowed roles
    const userRole = (req.user as JwtPayload).role;

    if (!roles.includes(userRole)) {
      res.status(403).json({ message: "Forbidden: Insufficient role" });
    }

    // Proceed to the next middleware or route handler
    next();
  };
}
