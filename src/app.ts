import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config";
import { initDB } from "./db";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { requestLogger } from "./middlewares/logging.middleware";
import v1ProductRoutes from "./routes/v1/product.routes";

const app = express();

// Middleware
app.use(
  helmet({
    contentSecurityPolicy:
      config.helmetContentSecurityPolicy === "true"
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: config.trustedScriptSources.split(" "), // Customize based on your app's requirements from .env file
            },
          }
        : false,
    frameguard: config.helmetFrameguard === "true" ? { action: "deny" } : false,
  })
);
app.use(express.json());
app.use(requestLogger);

// Rate Limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // Read from config
  max: config.rateLimit.max, // Read from config
});
app.use(limiter);

// Initialize the Database
initDB().then(() => {
  console.log("Database initialized successfully");
});

// API Routes
app.use("/v1/products", v1ProductRoutes); // v1 products API

// Error Handling Middleware
app.use(errorHandler);

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
