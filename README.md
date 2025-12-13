# WorkStack

**Project Management Made Simple**

![WorkStack Dashboard](./demo.png)

WorkStack is a modern, full-stack project management application that helps teams organize projects, manage tasks, and collaborate effectively. Built with performance and developer experience in mind.

## ✨ Features

- 📋 **Project Management** - Create, organize, and track projects with multiple statuses
- ✅ **Task Management** - Comprehensive task system with priorities, dependencies, and status tracking
- 👥 **Team Collaboration** - Multi-user support with role-based access control (Admin, Manager, Member, Viewer)
- 🔐 **Secure Authentication** - JWT-based auth with refresh tokens, multiple session support, and password reset
- 🎨 **Modern UI** - Beautiful, responsive interface built with React and Tailwind CSS
- 🚀 **High Performance** - Fastify backend optimized for speed and scalability
- 📱 **Real-time Updates** - React Query for efficient data fetching and caching
- 🎯 **Task Dependencies** - Link tasks with blocking, dependency, and related relationships

## 🏗️ Tech Stack

### Backend
- **Framework**: [Fastify](https://www.fastify.io/) - High-performance Node.js web framework
- **Language**: TypeScript
- **Database**: PostgreSQL with [Prisma](https://www.prisma.io/) ORM
- **Authentication**: JWT with secure session management
- **Caching**: Redis
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v7
- **Animations**: Motion (Framer Motion)
- **Drag & Drop**: React DnD

### Infrastructure
- **Package Manager**: pnpm with workspaces (monorepo)
- **Containerization**: Docker & Docker Compose
- **Deployment**: Fly.io configuration included
- **Code Quality**: ESLint, Prettier, TypeScript

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** database
- **Redis** (optional, for caching)
- **pnpm** (recommended) or npm

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/piyushpradhan/workstack.git
cd workstack
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create `.env` files in both `apps/backend` and `apps/frontend` directories:

**Backend** (`apps/backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/workstack"
DIRECT_URL="postgresql://user:password@localhost:5432/workstack"
NODE_ENV="development"
PORT=3000
HOST=0.0.0.0
JWT_SECRET="your-secret-key-change-in-production"
CORS_ORIGIN="http://localhost:8080"
REDIS_URL="127.0.0.1"
REDIS_PORT=6379
```

**Frontend** (`apps/frontend/.env`):
```env
VITE_API_URL="http://localhost:3000"
```

4. **Set up the database**

```bash
# Generate Prisma client
pnpm --filter backend db:generate

# Run database migrations
pnpm --filter backend db:migrate

# Seed the database (optional)
pnpm --filter backend db:seed
```

5. **Start the development servers**

```bash
# Start both backend and frontend
pnpm dev

# Or start them separately:
pnpm dev:backend   # Backend only (port 3000)
pnpm dev:frontend  # Frontend only (port 8080)
```

The application will be available at:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/docs

## 🐳 Docker Deployment

### Using Docker Compose

1. **Set up environment variables**

Create a `.env` file in the root directory with all required variables (see Installation section).

2. **Build and start containers**

```bash
docker-compose up -d
```

3. **Run database migrations**

```bash
docker-compose exec backend pnpm db:migrate:deploy
```

4. **Access the application**

- Frontend: http://localhost:8080
- Backend: http://localhost:3000

### Individual Docker Builds

See the Dockerfiles in `apps/backend/Dockerfile` and `apps/frontend/Dockerfile` for containerization details.

## 🔧 Configuration

### Backend Configuration

The backend uses environment variables for configuration. Key settings include:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CORS_ORIGIN` - Allowed CORS origins
- `REDIS_URL` - Redis connection URL
- `RATE_LIMIT_MAX` - Maximum requests per time window
- `LOG_LEVEL` - Logging level (info, debug, error, etc.)

### Frontend Configuration

- `VITE_API_URL` - Backend API URL

## 🏛️ Architecture

### Backend Architecture

The backend follows **Fastify's recommended plugin-based architecture**:

- **Plugin-based**: Routes, middleware, and utilities are all Fastify plugins
- **Encapsulation**: Each plugin is self-contained and testable
- **Type Safety**: Full TypeScript support with TypeBox validation
- **Performance**: Optimized for high throughput and low latency

### Frontend Architecture

- **Feature-based**: Organized by features rather than file types
- **Component-driven**: Reusable UI components with Radix UI
- **State Management**: TanStack Query for server state
- **Type Safety**: Full TypeScript coverage

## 🛡️ Security Features

- ✅ JWT-based authentication with refresh tokens
- ✅ Multiple session support with session management
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting on API endpoints
- ✅ CORS protection
- ✅ Security headers (Helmet)
- ✅ Input validation and sanitization
- ✅ SQL injection protection (Prisma)
- ✅ Password strength validation
- ✅ CSRF protection

## 📚 API Documentation

Once the backend server is running, visit `/docs` to view the interactive API documentation powered by Swagger UI.

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific app
pnpm --filter backend test
pnpm --filter frontend test
```

## 🚢 Deployment

### Fly.io

The project includes a `fly.toml` configuration file for deployment to Fly.io:

```bash
# Install Fly CLI and login
fly auth login

# Deploy
fly deploy
```

### Other Platforms

The Docker setup can be adapted for deployment to:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Railway
- Render

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Piyush Pradhan**

- Email: piyushpradhan3.14@gmail.com
- GitHub: [@piyushpradhan](https://github.com/piyushpradhan)

## 🙏 Acknowledgments

- Fastify team for the excellent framework
- Prisma for the amazing ORM
- React team for the powerful UI library
- All the open-source contributors whose packages made this possible

---

**Made with ❤️ for better project management**

