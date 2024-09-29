# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install both production and development dependencies (for TypeScript)
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript files
RUN npm run build

# Stage 2: Run the application with only production dependencies
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only the production dependencies from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy the build output (compiled JavaScript files)
COPY --from=builder /usr/src/app/dist ./dist

# Copy other necessary files like package.json, etc.
COPY package*.json ./

# Expose the port that your application runs on
EXPOSE 3300

# Dynamically copy the correct environment file based on NODE_ENV
ARG NODE_ENV=prod
COPY ./.env.${NODE_ENV} ./.env


# Command to run the application
CMD ["node", "dist/app.js"]
