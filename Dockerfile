# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Receive the key from Cloud Build
ARG API_KEY

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

# Stage 2: Run
FROM node:20-alpine
WORKDIR /app
RUN npm install -g sirv-cli
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["sirv", "dist", "--port", "8080", "--host", "0.0.0.0"]



