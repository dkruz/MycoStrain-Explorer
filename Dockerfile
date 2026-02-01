# Stage 1: Build Stage
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your app's source code
COPY . .

# --- CRITICAL PART ---
# These arguments are passed from Cloud Build during the build process
ARG VITE_API_KEY
# This command will fail the build if the key is empty, 
# but succeed if any text exists. It won't print the key!
RUN if [ -z "$API_KEY" ]; then echo "ERROR: API_KEY is empty"; exit 1; else echo "API_KEY is present"; fi
# Vite requires variables to start with VITE_ to expose them to the client
ENV VITE_API_KEY=$API_KEY
ENV VITE_API_KEY=$VITE_API_KEY

# Build the app (this "bakes" the key into the files in /dist)
RUN npm run build

# Stage 2: Run Stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install sirv-cli to serve the static files
RUN npm install -g sirv-cli

# Copy only the compiled "dist" folder from the build stage
COPY --from=build /app/dist ./dist

# Cloud Run listens on port 8080 by default
EXPOSE 8080

# Start the server
CMD ["sirv", "dist", "--port", "8080", "--host"]




