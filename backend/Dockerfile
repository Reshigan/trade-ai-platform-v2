# Build stage
FROM node:16-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Use a custom script to install dependencies with retries
RUN echo '#!/bin/sh\n\
for i in 1 2 3 4 5; do\n\
  echo "Attempt $i to install dependencies..."\n\
  npm config set fetch-retry-mintimeout 20000\n\
  npm config set fetch-retry-maxtimeout 120000\n\
  npm config set fetch-retries 5\n\
  npm config set network-timeout 300000\n\
  npm config set registry https://registry.npmjs.org/\n\
  npm install --omit=dev && exit 0\n\
  echo "Attempt $i failed, waiting before retry..."\n\
  sleep 5\n\
done\n\
echo "All attempts failed"\n\
exit 1' > /tmp/install.sh && chmod +x /tmp/install.sh && /tmp/install.sh

# Copy source code
COPY . .

# Production stage
FROM node:16-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Create necessary directories
RUN mkdir -p uploads logs && \
    chown -R nodejs:nodejs uploads logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]