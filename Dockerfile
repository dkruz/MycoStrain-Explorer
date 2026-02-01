# Stage 1: Build environment
FROM node:20-slim AS build

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Injected at build time by Cloud Build
ARG API_KEY
ENV API_KEY=$API_KEY

# Build the static production assets
RUN npm run build

# Stage 2: Production environment
FROM node:20-slim

WORKDIR /app

# Install a lightweight static file server
RUN npm install -g sirv-cli

# Copy only the compiled assets from the build stage
COPY --from=build /app/dist ./dist

# Cloud Run listens on port 8080 by default
EXPOSE 8080

# Serve the 'dist' folder as a Single Page Application (SPA)
CMD ["sirv", "dist", "--host", "0.0.0.0", "--port", "8080", "--single"]
