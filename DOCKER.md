# Docker Deployment Guide

This guide explains how to deploy WorkStack using Docker and Docker Compose.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Building and Running](#building-and-running)
- [Adding Future Services (Redis, RabbitMQ)](#adding-future-services-redis-rabbitmq)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

WorkStack uses a **multi-container architecture** with separate containers for:

- **Frontend**: React app served via Nginx (port 8080)
- **Backend**: Fastify API server (port 3000)
- **PostgreSQL**: Database (port 5432)
- **Future**: Redis (caching), RabbitMQ (pub/sub) - ready to add

### Why Multi-Container?

✅ **Independent Scaling**: Scale frontend and backend separately  
✅ **Resource Efficiency**: Allocate resources per service  
✅ **Security**: Smaller attack surface per container  
✅ **Maintainability**: Deploy services independently  
✅ **Flexibility**: Easy to add new services (Redis, RabbitMQ, workers)

## 📦 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB of available RAM
- At least 5GB of available disk space

## 🚀 Quick Start

### 1. Create Environment File

Create a `.env` file in the project root:

```bash
cp .env.example .env
# Edit .env with your values
```

**Minimum required variables:**

```env
# Database
POSTGRES_USER=workstack
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=workstack

# Security (IMPORTANT: Change these!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
APP_KEYS=YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=

# API Configuration
VITE_API_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:8080
```

### 2. Build and Start Services

```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 3. Run Database Migrations

```bash
# Execute migrations
docker-compose exec backend pnpm run db:migrate:deploy

# (Optional) Seed the database
docker-compose exec backend pnpm run db:seed
```

### 4. Access Services

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/docs
- **Database**: localhost:5432

## 🔧 Environment Variables

### Complete Environment Variable Reference

#### Database Configuration

```env
POSTGRES_USER=workstack                    # PostgreSQL username
POSTGRES_PASSWORD=secure-password          # PostgreSQL password (REQUIRED)
POSTGRES_DB=workstack                      # Database name
POSTGRES_PORT=5432                         # Database port (host)
```

#### Backend Configuration

```env
NODE_ENV=production                        # Node environment
BACKEND_PORT=3000                          # Backend port
LOG_LEVEL=info                            # Logging level: error, warn, info, debug
CORS_ORIGIN=http://localhost:8080         # Allowed CORS origin
```

#### Security Configuration

```env
# Generate secure secrets:
# JWT_SECRET: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# APP_KEYS: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

JWT_SECRET=your-super-secret-jwt-key       # JWT signing secret (REQUIRED)
APP_KEYS=base64-encoded-key               # Session encryption keys (comma-separated)
```

#### Application Configuration

```env
APP_NAME=WorkStack                         # Application name
APP_URL=http://localhost:3000             # Application base URL
APP_ENV=production                         # Application environment

# Rate Limiting
RATE_LIMIT_MAX=100                         # Max requests per window
RATE_LIMIT_TIME_WINDOW=60000              # Time window in milliseconds
```

#### JWT & Session Expiry (milliseconds)

```env
JWT_EXPIRY=2592000000                     # 30 days
JWT_REFRESH_EXPIRY=2592000000             # 30 days
SESSION_EXPIRY=604800000                   # 7 days
REFRESH_TOKEN_EXPIRY=2592000000           # 30 days
RESET_PASSWORD_EXPIRY=900000              # 15 minutes
```

#### Security Settings

```env
BCRYPT_ROUNDS=12                          # Password hashing rounds
MAX_LOGIN_ATTEMPTS=5                      # Max failed login attempts
LOCKOUT_TIME=900000                        # Account lockout duration (ms)
```

#### Email Configuration (Optional)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@workstack.com
```

#### Frontend Configuration

```env
FRONTEND_PORT=8080                        # Frontend port
VITE_API_URL=http://localhost:3000        # Backend API URL for frontend
```

## 🔨 Building and Running

### Build Commands

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Rebuild without cache
docker-compose build --no-cache
```

### Running Commands

```bash
# Start all services in background
docker-compose up -d

# Start specific service
docker-compose up -d backend

# View logs
docker-compose logs -f                    # All services
docker-compose logs -f backend            # Specific service
docker-compose logs --tail=100 backend    # Last 100 lines

# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (⚠️ deletes data!)
docker-compose down -v
```

### Database Operations

```bash
# Run migrations
docker-compose exec backend pnpm run db:migrate:deploy

# Generate Prisma client (if schema changed)
docker-compose exec backend pnpm run db:generate

# Open Prisma Studio (database GUI)
docker-compose exec backend pnpm run db:studio
# Then visit http://localhost:5555

# Seed database
docker-compose exec backend pnpm run db:seed

# Access PostgreSQL CLI
docker-compose exec postgres psql -U workstack -d workstack
```

### Development Mode

For development with hot-reload, you can mount source files:

```yaml
# In docker-compose.yml, add volumes to backend service:
volumes:
  - ./apps/backend/src:/app/apps/backend/src
```

Then restart:
```bash
docker-compose up -d backend
```

## 🔮 Adding Future Services (Redis, RabbitMQ)

The Docker setup is structured to easily add Redis and RabbitMQ later.

### Adding Redis

1. **Uncomment Redis service** in `docker-compose.yml`:

```yaml
redis:
  image: redis:7-alpine
  container_name: workstack-redis
  restart: unless-stopped
  ports:
    - "${REDIS_PORT:-6379}:6379"
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 5s
    retries: 5
  networks:
    - workstack-network
```

2. **Uncomment Redis volume** in volumes section

3. **Update backend environment** in `docker-compose.yml`:

```yaml
environment:
  # ... existing vars ...
  REDIS_URL: redis://redis:6379
  REDIS_HOST: redis
  REDIS_PORT: 6379
```

4. **Add Redis client to backend**:

```bash
pnpm add ioredis
# or
pnpm add redis
```

5. **Restart services**:

```bash
docker-compose up -d redis backend
```

### Adding RabbitMQ

1. **Uncomment RabbitMQ service** in `docker-compose.yml`:

```yaml
rabbitmq:
  image: rabbitmq:3-management-alpine
  container_name: workstack-rabbitmq
  restart: unless-stopped
  environment:
    RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER:-guest}
    RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD:-guest}
  ports:
    - "${RABBITMQ_PORT:-5672}:5672"    # AMQP port
    - "${RABBITMQ_MGMT_PORT:-15672}:15672"  # Management UI
  volumes:
    - rabbitmq_data:/var/lib/rabbitmq
  healthcheck:
    test: ["CMD", "rabbitmq-diagnostics", "ping"]
    interval: 30s
    timeout: 10s
    retries: 5
  networks:
    - workstack-network
```

2. **Uncomment RabbitMQ volume**

3. **Update backend environment**:

```yaml
environment:
  # ... existing vars ...
  RABBITMQ_URL: amqp://${RABBITMQ_USER:-guest}:${RABBITMQ_PASSWORD:-guest}@rabbitmq:5672
  RABBITMQ_HOST: rabbitmq
  RABBITMQ_PORT: 5672
```

4. **Add RabbitMQ client**:

```bash
pnpm add amqplib
```

5. **Restart services**:

```bash
docker-compose up -d rabbitmq backend
```

6. **Access Management UI**: http://localhost:15672 (guest/guest)

## 🚢 Production Deployment

### Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong `JWT_SECRET` (32+ bytes)
- [ ] Generate strong `APP_KEYS` (base64, 32+ bytes)
- [ ] Use strong `POSTGRES_PASSWORD`
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `CORS_ORIGIN` (not `*`)
- [ ] Use HTTPS (configure reverse proxy)
- [ ] Set up firewall rules
- [ ] Enable database backups
- [ ] Configure log aggregation
- [ ] Set up monitoring and alerts

### Production Environment Variables

```env
NODE_ENV=production
APP_ENV=production

# Use your domain
APP_URL=https://api.yourdomain.com
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com

# Strong secrets
JWT_SECRET=<generate-strong-secret>
APP_KEYS=<generate-strong-keys>

# Production database
DATABASE_URL=postgresql://user:pass@postgres:5432/workstack
```

### Using Docker Compose in Production

For production, consider:

1. **Use Docker Swarm or Kubernetes** for orchestration
2. **Use secrets management** (Docker secrets, Vault, etc.)
3. **Set up reverse proxy** (Nginx, Traefik, Caddy)
4. **Enable SSL/TLS** (Let's Encrypt)
5. **Set resource limits** in docker-compose.yml:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Separate Deployments (Recommended for Production)

Instead of Docker Compose, consider:

- **Frontend**: Deploy to CDN (Vercel, Netlify, Cloudflare Pages)
- **Backend**: Deploy to container service (AWS ECS, Google Cloud Run, Railway)
- **Database**: Managed PostgreSQL (AWS RDS, Supabase, Neon)

## 🔍 Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Check service status
docker-compose ps

# Restart services
docker-compose restart
```

### Database Connection Issues

```bash
# Check if database is healthy
docker-compose exec postgres pg_isready -U workstack

# Test connection from backend
docker-compose exec backend node -e "console.log(process.env.DATABASE_URL)"
```

### Frontend Can't Connect to Backend

1. Check `VITE_API_URL` matches backend URL
2. Check `CORS_ORIGIN` includes frontend URL
3. Check both services are on same network:
   ```bash
   docker network inspect workstack_workstack-network
   ```

### Port Already in Use

Change ports in `.env`:

```env
BACKEND_PORT=3001
FRONTEND_PORT=8081
POSTGRES_PORT=5433
```

### Build Fails

```bash
# Clear build cache
docker-compose build --no-cache

# Remove old images
docker image prune -a

# Check disk space
df -h
```

### Prisma Migration Issues

```bash
# Reset database (⚠️ deletes all data)
docker-compose exec backend pnpm run db:reset

# Or manually reset
docker-compose exec postgres psql -U workstack -d workstack -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker-compose exec backend pnpm run db:migrate:deploy
```

### View Container Resources

```bash
# Resource usage
docker stats

# Container details
docker inspect workstack-backend
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Fastify Documentation](https://www.fastify.io/)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🤝 Contributing

When adding new services or features:

1. Update `docker-compose.yml` with commented placeholders
2. Update this documentation
3. Add environment variable examples
4. Test locally before deployment

---

**Need Help?** Check the logs first: `docker-compose logs -f`


