# Stage 1: Build Stage (The "Kitchen")
FROM node:20-slim AS build

# Create app directory
WORKDIR /app

# Install build dependencies
# We copy package files first to leverage Docker's cache
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# --- API KEY INJECTION ---
# This matches your cloudbuild.yaml variable
ARG API_KEY

# We set both names to ensure Vite "sees" it during the build
ENV API_KEY=$API_KEY
ENV VITE_API_KEY=$API_KEY
ENV VITE_GEMINI_API_KEY=$API_KEY

# Build the production assets (this creates the /dist folder)
RUN npm run build

# Stage 2: Runtime Stage (The "Waiter")
FROM node:20-slim

WORKDIR /app

# Install the lightweight server
# We do this in the second stage to keep the final image tiny
RUN npm install -g sirv-cli

# Only copy the compiled "dist" folder from the build stage
COPY --from=build /app/dist ./dist

# Cloud Run's standard port
EXPOSE 8080

# Serve the app
# --single ensures that if a user refreshes a sub-page, it doesn't 404
CMD ["sirv", "dist", "--host", "0.0.0.0", "--port", "8080", "--single"]