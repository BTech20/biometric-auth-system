# Frontend Dockerfile
FROM node:18-alpine AS build
ENV CACHE_BUST=2026-01-13-fresh

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build /app/build ./build

# Expose port
EXPOSE 3000

# Start the app - Fixed Railway deployment Jan 2026
CMD sh -c "serve -s build -p ${PORT:-3000}"
