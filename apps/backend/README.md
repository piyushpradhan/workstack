# Workstack Backend

A modern, scalable Node.js backend built with Fastify, TypeScript, and Prisma following Fastify's recommended patterns.

## 🏗️ Architecture

This backend follows **Fastify's recommended plugin-based architecture** instead of traditional MVC patterns. This approach provides better performance, encapsulation, and follows Fastify's design philosophy.

### 📁 Project Structure

```
src/
├── config/           # Configuration files
│   ├── index.ts      # Environment configuration
│   └── database.ts   # Database configuration
├── routes/           # API routes (Fastify plugins)
│   ├── v1/           # API version 1
│   │   ├── index.ts  # Health check and API info
│   │   └── users.ts  # User routes with business logic
│   └── index.ts      # Route registration
├── middleware/       # Custom middleware (Fastify plugins)
│   ├── error-handler.ts
│   └── request-logger.ts
├── plugins/          # Fastify plugins
│   ├── cors.ts
│   ├── helmet.ts
│   ├── rate-limit.ts
│   └── swagger.ts
├── types/            # TypeScript type definitions
│   ├── api.ts
│   ├── database.ts
│   ├── fastify.ts
│   └── index.ts
├── utils/            # Utility functions
│   ├── response.ts
│   ├── validation.ts
│   ├── logger.ts
│   └── index.ts
├── database/         # Database related files
│   ├── connection.ts
│   └── seeds/
│       └── index.ts
├── app.ts            # Application plugin
└── server.ts         # Server entry point
```

## 🚀 Fastify Best Practices Implementation

### 1. **Plugin-Based Architecture**

- **Everything is a plugin**: Routes, middleware, and utilities are all Fastify plugins
- **Encapsulation**: Each plugin is self-contained and can be easily tested or reused
- **Dependency injection**: Plugins can register dependencies that other plugins can use

### 2. **Route Handlers as Plugins**

```typescript
// Each route file is a Fastify plugin
export default fp(async function (fastify: FastifyInstance) {
  fastify.get('/users', async (request, reply) => {
    // Business logic directly in route handlers
    // No unnecessary abstraction layers
  });
});
```

### 3. **Middleware as Plugins**

```typescript
// Middleware are proper Fastify plugins
export default fp(async function (fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request, reply) => {
    // Middleware logic
  });
});
```

### 4. **Simplified Configuration**

- **Single config file**: No over-engineering with multiple config files
- **Environment-based**: Simple environment variable handling
- **Type-safe**: TypeScript ensures configuration correctness

### 5. **Direct Database Access**

- **No repository pattern**: Direct Prisma usage in route handlers
- **Simpler code**: Less abstraction means easier to understand and maintain
- **Better performance**: Fewer function calls and object instantiations

## 🎯 Why This Architecture?

### ✅ **Advantages of Fastify's Plugin Pattern:**

1. **Performance**: Fastify's plugin system is highly optimized
2. **Encapsulation**: Each plugin is isolated and testable
3. **Reusability**: Plugins can be easily shared between projects
4. **Simplicity**: Less boilerplate than traditional MVC
5. **Fastify-native**: Follows the framework's intended usage patterns

### ❌ **What We Removed (Anti-patterns for Fastify):**

1. **Controllers/Services**: Unnecessary abstraction layers
2. **Repository Pattern**: Over-engineering for simple CRUD operations
3. **Multiple Config Files**: Redundant configuration management
4. **Empty Directories**: Unused folder structure
5. **Complex Inheritance**: Base classes that add complexity without value

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your database URL and other configurations
```

3. Set up the database:

```bash
# Generate Prisma client
pnpm run db:generate

# Run database migrations
pnpm run db:migrate

# Seed the database (optional)
pnpm run db:seed
```

4. Start the development server:

```bash
pnpm run dev
```

## 📚 Available Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build the application
- `pnpm run start` - Start production server
- `pnpm run test` - Run tests
- `pnpm run lint` - Run ESLint
- `pnpm run lint:fix` - Fix ESLint errors
- `pnpm run db:generate` - Generate Prisma client
- `pnpm run db:migrate` - Run database migrations
- `pnpm run db:seed` - Seed the database
- `pnpm run db:studio` - Open Prisma Studio

## 🔧 Configuration

The application uses environment variables for configuration. See `.env.example` for all available options.

### Key Configuration Files

- `src/config/index.ts` - Environment variable validation and defaults
- `src/config/database.ts` - Database connection configuration
- `src/config/server.ts` - Server configuration

## 🛡️ Security Features

- **CORS** - Configurable cross-origin resource sharing
- **Helmet** - Security headers
- **Rate Limiting** - Request rate limiting
- **Input Validation** - Request validation using TypeBox
- **Error Handling** - Centralized error handling

## 📖 API Documentation

Once the server is running, visit `/docs` to view the interactive API documentation powered by Swagger UI.

## 🏛️ Architecture Patterns

### Repository Pattern

- Data access is abstracted through repository classes
- Base repository provides common CRUD operations
- Easy to mock for testing

### Service Layer

- Business logic is separated from controllers
- Services interact with repositories
- Controllers handle HTTP concerns only

### Middleware Pattern

- Reusable middleware for cross-cutting concerns
- Error handling, logging, authentication, etc.

### Plugin Architecture

- Fastify plugins for modular functionality
- Easy to enable/disable features

## 🧪 Testing

The project includes a test setup with:

- Test configuration in `test/tsconfig.json`
- Coverage reporting with c8
- Test runner with tsx

## 📦 Dependencies

### Core Dependencies

- **Fastify** - Fast and low overhead web framework
- **TypeScript** - Type safety and better developer experience
- **Prisma** - Modern database ORM
- **TypeBox** - JSON Schema type builder

### Development Dependencies

- **ESLint** - Code linting
- **tsx** - TypeScript execution
- **c8** - Code coverage

## 🔄 Database

The application uses Prisma as the ORM with PostgreSQL as the database.

### Key Features

- Type-safe database queries
- Automatic migrations
- Database seeding
- Connection pooling
- Query logging in development

## 📈 Performance

- **Fastify** - High-performance web framework
- **Connection Pooling** - Efficient database connections
- **Rate Limiting** - Prevents abuse
- **Request Logging** - Performance monitoring

## 🚀 Deployment

The application is ready for deployment with:

- Production-optimized build
- Environment-based configuration
- Health check endpoints
- Graceful shutdown handling

## 🤝 Contributing

1. Follow the established code structure
2. Add tests for new features
3. Update documentation as needed
4. Follow the existing code style (ESLint configuration)
