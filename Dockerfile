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

# Set EVERY common variation. One of these WILL be the right one.
ENV API_KEY=$API_KEY
ENV GOOGLE_API_KEY=$API_KEY
ENV GEMINI_API_KEY=$API_KEY
ENV VITE_API_KEY=$API_KEY
ENV VITE_GOOGLE_API_KEY=$API_KEY
ENV VITE_GEMINI_API_KEY=$API_KEY
ENV REACT_APP_API_KEY=$API_KEY
ENV NEXT_PUBLIC_API_KEY=$API_KEY

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






