# Production-Grade Authentication System

This document describes the comprehensive authentication system implemented for the WorkStack backend, supporting multiple session logins with enterprise-level security features.

## Features

### 🔐 Core Authentication
- **JWT-based authentication** with configurable expiration
- **Refresh token system** for seamless token renewal
- **Multiple session support** - users can be logged in from multiple devices
- **Session management** - view, revoke, and manage active sessions
- **Password reset** with secure token-based flow
- **Role-based access control** (RBAC) with Admin, Manager, Member, Viewer roles

### 🛡️ Security Features
- **Rate limiting** on all authentication endpoints
- **Input validation and sanitization** to prevent injection attacks
- **CSRF protection** for web-based requests
- **Security headers** (CSP, HSTS, XSS protection, etc.)
- **SQL injection protection**
- **Password strength validation** with comprehensive rules
- **Session invalidation** on password changes
- **Audit logging** for security events

### 📊 Session Management
- **Multiple concurrent sessions** per user
- **Session tracking** with IP address and User-Agent
- **Session expiration** with automatic cleanup
- **Remote session revocation**
- **Sign out from all devices** functionality

## Database Schema

### User Model
```prisma
model User {
  id                    String   @id @default(uuid())
  name                  String
  email                 String   @unique
  avatar                String?
  role                  UserRole @default(MEMBER)
  isActive              Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  password              String
  lastLoginAt           DateTime?
  emailVerifiedAt       DateTime?
  passwordResetToken    String?
  passwordResetExpires  DateTime?
  
  sessions      Session[]
  refreshTokens RefreshToken[]
}
```

### Session Model
```prisma
model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  userAgent String?
  ipAddress String?
  isActive  Boolean  @default(true)
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### RefreshToken Model
```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  userAgent String?
  ipAddress String?
  isActive  Boolean  @default(true)
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## API Endpoints

### Authentication Endpoints

#### POST `/api/v1/auth/signup`
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe" // optional
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "MEMBER"
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### POST `/api/v1/auth/signin`
Sign in with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "MEMBER"
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### POST `/api/v1/auth/refresh`
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

#### POST `/api/v1/auth/signout`
Sign out from current session.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "message": "Successfully signed out"
}
```

#### POST `/api/v1/auth/signout-all`
Sign out from all devices.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "message": "Successfully signed out from all devices"
}
```

### Session Management

#### GET `/api/v1/auth/sessions`
Get all active sessions for the current user.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "sessions": [
    {
      "id": "session_id",
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastActiveAt": "2024-01-01T12:00:00Z",
      "isCurrent": true
    }
  ]
}
```

#### DELETE `/api/v1/auth/sessions/:sessionId`
Revoke a specific session.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "message": "Session revoked successfully"
}
```

### Password Management

#### POST `/api/v1/auth/forgot-password`
Request password reset.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If the email exists, a password reset link has been sent."
}
```

#### POST `/api/v1/auth/reset-password`
Reset password with token.

**Request:**
```json
{
  "token": "reset_token",
  "password": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "message": "Password reset successfully. Please sign in with your new password."
}
```

#### POST `/api/v1/auth/change-password`
Change password (authenticated user).

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "message": "Password changed successfully. Please sign in again."
}
```

### User Profile

#### GET `/api/v1/auth/me`
Get current user profile.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "MEMBER",
    "avatar": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLoginAt": "2024-01-01T12:00:00Z"
  }
}
```

## Middleware Usage

### Authentication Middleware

```typescript
// Require authentication
fastify.get('/protected', {
  preHandler: [fastify.authenticate]
}, async (request, reply) => {
  // request.user is available here
});

// Optional authentication
fastify.get('/optional', {
  preHandler: [fastify.optionalAuth]
}, async (request, reply) => {
  // request.user may or may not be available
});

// Admin only
fastify.get('/admin', {
  preHandler: [fastify.authenticate, fastify.adminOnly]
}, async (request, reply) => {
  // Only admins can access
});

// Manager or Admin
fastify.get('/management', {
  preHandler: [fastify.authenticate, fastify.managerOrAdmin]
}, async (request, reply) => {
  // Managers and admins can access
});

// Resource ownership
fastify.get('/users/:userId/profile', {
  preHandler: [fastify.authenticate, fastify.requireOwnership('userId')]
}, async (request, reply) => {
  // User can only access their own profile
});
```

### Security Middleware

```typescript
// CSRF protection
fastify.post('/form', {
  preHandler: [fastify.csrfProtection]
}, async (request, reply) => {
  // CSRF protected endpoint
});

// Input validation
fastify.post('/data', {
  preHandler: [fastify.validateInput(schema)]
}, async (request, reply) => {
  // Input validated and sanitized
});

// SQL injection protection
fastify.post('/search', {
  preHandler: [fastify.sqlInjectionProtection]
}, async (request, reply) => {
  // Protected against SQL injection
});

// Audit logging
fastify.post('/sensitive-action', {
  preHandler: [fastify.authenticate, fastify.auditLog('sensitive_action')]
}, async (request, reply) => {
  // Action will be logged
});
```

## Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Session Configuration
SESSION_EXPIRY=604800000  # 7 days in ms
REFRESH_TOKEN_EXPIRY=2592000000  # 30 days in ms

# Security Configuration
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=900000  # 15 minutes in ms

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@workstack.com

# App Configuration
APP_NAME=WorkStack
APP_URL=http://localhost:3000
```

## Security Best Practices

### 1. Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- No common patterns or words

### 2. Rate Limiting
- Signup/Signin: 5 attempts per 15 minutes per IP
- Password reset: 3 requests per 15 minutes per IP
- Refresh token: 10 requests per 15 minutes per IP

### 3. Session Security
- Sessions expire after 7 days
- Refresh tokens expire after 30 days
- Automatic cleanup of expired sessions
- Session invalidation on password change

### 4. Input Validation
- All inputs are validated and sanitized
- SQL injection protection
- XSS prevention
- CSRF protection for web requests

### 5. Security Headers
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block

## Usage Examples

### Frontend Integration

```typescript
// Sign up
const response = await fetch('/api/v1/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    name: 'John Doe'
  })
});

const { user, accessToken, refreshToken } = await response.json();

// Store tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Make authenticated requests
const apiResponse = await fetch('/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Refresh token when access token expires
const refreshResponse = await fetch('/api/v1/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});

const { accessToken: newAccessToken } = await refreshResponse.json();
localStorage.setItem('accessToken', newAccessToken);
```

### Backend Route Protection

```typescript
// Admin-only route
fastify.get('/admin/users', {
  preHandler: [fastify.authenticate, fastify.adminOnly]
}, async (request, reply) => {
  const users = await fastify.prisma.user.findMany();
  reply.send({ users });
});

// User can only access their own data
fastify.get('/users/:userId/tasks', {
  preHandler: [fastify.authenticate, fastify.requireOwnership('userId')]
}, async (request, reply) => {
  const tasks = await fastify.prisma.task.findMany({
    where: { assigneeId: request.params.userId }
  });
  reply.send({ tasks });
});
```

## Migration

To apply the database changes:

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed
```

## Testing

The authentication system includes comprehensive validation and error handling. Test the endpoints using tools like Postman or curl:

```bash
# Test signup
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","name":"Test User"}'

# Test signin
curl -X POST http://localhost:3000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# Test protected endpoint
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

This authentication system provides enterprise-grade security with multiple session support, comprehensive validation, and robust session management capabilities.
