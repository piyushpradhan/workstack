# Deployment Structure & Design Decisions

This document explains the Docker deployment structure and the reasoning behind each design decision.

## 📐 Architecture Decisions

### 1. Multi-Container vs Single Container

**Decision**: Multi-container architecture with separate containers for each service.

**Why**:
- **Independent Scaling**: Frontend (static) and backend (dynamic) have different scaling needs
- **Resource Efficiency**: Can allocate CPU/memory per service based on requirements
- **Security**: Smaller attack surface - each container has minimal dependencies
- **Deployment Flexibility**: Update frontend without redeploying backend
- **Future-Proof**: Easy to add new services (Redis, RabbitMQ, workers)

**Alternative Considered**: Single container with all services
- ❌ Cannot scale services independently
- ❌ Resource allocation is inefficient
- ❌ Deployment coupling (frontend changes trigger backend redeploy)
- ❌ Larger attack surface

### 2. Multi-Stage Dockerfiles

**Decision**: Multi-stage builds for both frontend and backend.

**Why**:
- **Smaller Images**: Final images exclude build tools and dev dependencies
- **Better Caching**: Dependencies cached separately from source code changes
- **Security**: Minimal runtime dependencies reduce vulnerabilities
- **Faster Builds**: Cache layers effectively between builds

**Stages**:
- **Backend**: `deps` → `builder` → `runtime`
- **Frontend**: `builder` → `production`

### 3. Frontend Build-Time vs Runtime Configuration

**Decision**: Build-time environment variables for Vite (embedded in bundle).

**Why**:
- Vite embeds `VITE_` prefixed env vars at build time
- Static bundle is served by Nginx (no Node.js runtime)
- Secure: API URL is embedded, no runtime injection needed

**Trade-off**: 
- Must rebuild frontend if API URL changes
- For production, this is acceptable as URLs are stable

**Alternative Considered**: Runtime configuration via JavaScript
- Would require Node.js runtime or injection script
- Adds complexity and runtime overhead

### 4. Database Migration Strategy

**Decision**: Manual migration execution via `docker-compose exec`.

**Why**:
- **Explicit Control**: Migrations run as separate step, not on every container start
- **Production Safe**: Prevents accidental migrations on restart
- **Audit Trail**: Clear separation between app deployment and schema changes
- **Rollback Safety**: Can inspect migrations before applying

**Process**:
```bash
docker-compose exec backend pnpm run db:migrate:deploy
```

**Alternative Considered**: Auto-migrate on container start
- ❌ Could cause issues if multiple containers start simultaneously
- ❌ No control over migration timing
- ❌ Risk of applying migrations during deployments

### 5. Network Architecture

**Decision**: Single bridge network (`workstack-network`) for all services.

**Why**:
- **Service Discovery**: Services can communicate by name (e.g., `postgres`, `backend`)
- **Isolation**: Services not exposed to host network unnecessarily
- **Security**: Only expose necessary ports to host
- **Simplicity**: One network for all internal communication

**Port Mapping Strategy**:
- Database: Exposed only if needed for external tools (e.g., pgAdmin)
- Backend: Exposed for API access
- Frontend: Exposed for web access
- Future services (Redis, RabbitMQ): Exposed only if needed

### 6. Environment Variable Management

**Decision**: `.env` file with Docker Compose variable substitution.

**Why**:
- **Flexibility**: Different configs for dev/staging/prod
- **Security**: Sensitive values not in code
- **Simplicity**: Single file for all configuration
- **Version Control Safe**: `.env.example` in repo, `.env` gitignored

**Structure**:
- Root `.env` file for Docker Compose
- Services read from environment (passed from compose)
- Default values for optional configs

### 7. Health Checks

**Decision**: Health checks on all services.

**Why**:
- **Reliability**: Docker can restart unhealthy containers
- **Orchestration**: Services wait for dependencies to be healthy
- **Monitoring**: External tools can check service health
- **Dependency Management**: `depends_on` with health condition

**Implementation**:
- Database: `pg_isready`
- Backend: HTTP GET to `/health`
- Frontend: HTTP GET to `/health`

### 8. Volume Management

**Decision**: Named volumes for persistent data, no source mounts in production.

**Why**:
- **Data Persistence**: Database data survives container recreation
- **Performance**: Named volumes are faster than bind mounts
- **Isolation**: Container filesystem is isolated
- **Clean Deployments**: Source code changes don't affect running containers

**Volumes Used**:
- `postgres_data`: Database files
- Future: `redis_data`, `rabbitmq_data` (commented for now)

**Development Option**: Can mount source for hot-reload (commented out)

### 9. Future Services Structure

**Decision**: Commented placeholders for Redis and RabbitMQ in `docker-compose.yml`.

**Why**:
- **Ready to Enable**: Just uncomment when needed
- **Documentation**: Shows exactly what's needed
- **Consistency**: Same pattern for all services
- **No Breaking Changes**: Can add without restructuring

**Adding Process**:
1. Uncomment service definition
2. Uncomment volume
3. Uncomment environment variables in backend
4. Install client library in backend
5. Restart services

### 10. Build Context Strategy

**Decision**: Root directory as build context for all services.

**Why**:
- **Monorepo Support**: Access to workspace configuration files
- **Shared Dependencies**: Can leverage pnpm workspace features
- **Consistency**: Same context for all builds
- **Future Packages**: Easy to add shared packages later

**Optimization**: `.dockerignore` excludes unnecessary files

## 📁 File Structure

```
workstack/
├── docker-compose.yml           # Service orchestration
├── .env.example                 # Environment template (gitignored)
├── .dockerignore                # Build context exclusions
├── DOCKER.md                    # Comprehensive Docker guide
├── DEPLOYMENT_STRUCTURE.md      # This file
├── scripts/
│   └── docker-setup.sh         # Helper script for common operations
├── apps/
│   ├── backend/
│   │   ├── Dockerfile          # Multi-stage backend build
│   │   └── .dockerignore       # Backend-specific exclusions
│   └── frontend/
│       ├── Dockerfile          # Multi-stage frontend build
│       ├── nginx.conf          # Nginx configuration
│       └── .dockerignore       # Frontend-specific exclusions
```

## 🔄 Adding New Services

### Pattern for New Services

1. **Add service to docker-compose.yml**:
   - Commented initially
   - Include health check
   - Add to network
   - Define volume if needed

2. **Add environment variables**:
   - Commented in backend environment
   - Documented in `.env.example`

3. **Update documentation**:
   - Add to DOCKER.md
   - Include setup instructions

4. **Install client library**:
   - Add to backend package.json
   - Update Dockerfile if needed

### Example: Adding Redis

```yaml
# 1. Uncomment in docker-compose.yml
redis:
  image: redis:7-alpine
  # ... configuration

# 2. Uncomment in backend environment
REDIS_URL: redis://redis:6379

# 3. Install client
pnpm add ioredis

# 4. Restart
docker-compose up -d redis backend
```

## 🚀 Deployment Paths

### Development
- Use `docker-compose up` with volume mounts for hot-reload
- Local database with persistent volume

### Staging
- Use `docker-compose` with production images
- Environment variables from CI/CD secrets
- Test database with migrations

### Production (Recommended Options)

**Option 1: Container Orchestration**
- Docker Swarm or Kubernetes
- Managed database (AWS RDS, etc.)
- Container registry for images

**Option 2: Separate Deployments**
- Frontend: CDN/static hosting (Vercel, Netlify)
- Backend: Container service (Cloud Run, ECS, Railway)
- Database: Managed service (Supabase, Neon, RDS)

**Option 3: Docker Compose (Small Scale)**
- Single server with Docker Compose
- Reverse proxy (Nginx, Traefik)
- SSL via Let's Encrypt

## 🔒 Security Considerations

### Implemented
- ✅ Non-root user in containers
- ✅ Minimal base images (Alpine)
- ✅ Health checks for monitoring
- ✅ Network isolation
- ✅ Environment variable injection
- ✅ Build-time dependency scanning (via pnpm)

### Recommended for Production
- 🔐 Secrets management (Docker secrets, Vault)
- 🔐 Image scanning (Trivy, Snyk)
- 🔐 Reverse proxy with SSL/TLS
- 🔐 Resource limits
- 🔐 Log aggregation
- 🔐 Regular security updates

## 📊 Performance Optimizations

### Image Size
- Multi-stage builds reduce final image size by ~60%
- Alpine base images (~5MB vs ~150MB for full Node)
- Excluded dev dependencies

### Build Speed
- Layer caching: dependencies cached separately
- Parallel builds: services build independently
- `.dockerignore`: smaller build context

### Runtime
- Nginx for static files (lightweight)
- Health checks for quick failure detection
- Resource limits prevent resource exhaustion

## 🧪 Testing Strategy

### Local Testing
```bash
# Full stack
docker-compose up

# Specific service
docker-compose up backend

# With rebuild
docker-compose up --build
```

### Integration Testing
- Services communicate via Docker network
- Test real database connections
- Verify health checks

### Production Testing
- Test in staging environment first
- Verify migrations work
- Test rollback procedures

## 📝 Maintenance

### Regular Tasks
- Update base images (security patches)
- Review and update dependencies
- Monitor resource usage
- Review and rotate secrets

### Monitoring
- Container logs: `docker-compose logs -f`
- Resource usage: `docker stats`
- Health check endpoints
- Application metrics

---

**Summary**: The structure prioritizes flexibility, security, and ease of maintenance while remaining simple enough for small teams and scalable for growth.


