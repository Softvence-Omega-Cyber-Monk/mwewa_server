# ====== BUILD STAGE ======
FROM node:24-slim AS builder

# Enable corepack and activate pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Install system dependencies for build
RUN apt update && apt install -y openssl

# Copy package, lock file & prisma folder
COPY package.json pnpm-lock.yaml ./
COPY prisma.config.ts ./
COPY prisma ./prisma

# Allow pnpm to build packages
RUN pnpm config set allowed-builds '*' -g

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client (dummy DATABASE_URL is sufficient for code generation)
RUN DATABASE_URL="postgresql://user:password@localhost:5432/db" pnpm prisma generate

# Copy rest of the project files
COPY . .

# Build the app (NestJS -> dist/)
RUN pnpm build

# ====== PRODUCTION STAGE ======
FROM node:24-slim AS production

# Enable corepack and activate pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Install system dependencies needed at runtime
RUN apt update && apt install -y openssl curl

# Copy necessary files from builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# Expose port and run via entrypoint
EXPOSE 3000

# Create entrypoint script (run as root, then switch to nestjs)
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo 'echo "Running database migrations..."' >> /app/entrypoint.sh && \
    echo 'pnpm exec prisma migrate deploy' >> /app/entrypoint.sh && \
    echo 'echo "Starting application..."' >> /app/entrypoint.sh && \
    echo 'exec su -s /bin/sh nestjs -c "node dist/main.js"' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Create a non-root user with home directory
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --home /home/nestjs nestjs && \
    mkdir -p /home/nestjs && \
    chown -R nestjs:nodejs /home/nestjs

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app

# Expose the port
EXPOSE 3000

# Run entrypoint script (as root, which will then su to nestjs for the app)
CMD ["/app/entrypoint.sh"]