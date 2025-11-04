# Build stage
FROM node:20-alpine AS builder

# Install build dependencies for native modules (sodium-native, bcrypt, etc.)
RUN apk add --no-cache python3 make g++

RUN npm install -g pnpm@latest

WORKDIR /app

# Copy workspace files for pnpm workspace support
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies (including devDependencies needed for build)
RUN pnpm install --frozen-lockfile

# Copy backend source (including Prisma schema)
COPY apps/backend ./apps/backend

# Generate Prisma Client (required before TypeScript compilation)
WORKDIR /app/apps/backend
RUN pnpm run db:generate

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

# Install build dependencies for native modules (needed for compilation)
RUN apk add --no-cache python3 make g++ libc6-compat

RUN npm install -g pnpm@latest

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies (need devDependencies temporarily for Prisma generation)
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile

# Copy Prisma schema from builder stage
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

# Generate Prisma Client for production (needed at runtime)
WORKDIR /app/apps/backend
RUN pnpm run db:generate

# Copy built application from builder stage
COPY --from=builder /app/apps/backend/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]