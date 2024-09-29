import jwt from "jsonwebtoken";
import { config } from "../../src/config"; // Import your config where JWT_SECRET is set

// Helper function to generate a JWT token
export const generateToken = (role: string = "user"): string => {
  const payload = {
    id: 1,
    role: role,
  };

  // Sign the token using the secret from the config
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });

  return token;
};

// You can create specific helpers for admin/user tokens if needed
export const generateAdminToken = (): string => generateToken("admin");
export const generateUserToken = (): string => generateToken("user");
