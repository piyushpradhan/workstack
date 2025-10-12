# Authentication System Usage Examples

## Quick Start

### 1. Sign Up a New User

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "MEMBER"
  },
  "accessToken": "jwt-token-here",
  "refreshToken": "refresh-token-here"
}
```

### 2. Sign In

```bash
curl -X POST http://localhost:3000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Access Protected Route

```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. View Active Sessions

```bash
curl -X GET http://localhost:3000/api/v1/auth/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Refresh Access Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 6. Sign Out

```bash
curl -X POST http://localhost:3000/api/v1/auth/signout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Frontend Integration (React/TypeScript)

```typescript
// auth.service.ts
class AuthService {
  private baseURL = 'http://localhost:3000/api/v1/auth';
  
  async signup(email: string, password: string, name?: string) {
    const response = await fetch(`${this.baseURL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    
    if (!response.ok) throw new Error('Signup failed');
    
    const data = await response.json();
    this.storeTokens(data.accessToken, data.refreshToken);
    return data.user;
  }
  
  async signin(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Signin failed');
    
    const data = await response.json();
    this.storeTokens(data.accessToken, data.refreshToken);
    return data.user;
  }
  
  async getCurrentUser() {
    const token = this.getAccessToken();
    if (!token) return null;
    
    const response = await fetch(`${this.baseURL}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        await this.refreshToken();
        return this.getCurrentUser();
      }
      throw new Error('Failed to get user');
    }
    
    return response.json();
  }
  
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await fetch(`${this.baseURL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (!response.ok) throw new Error('Token refresh failed');
    
    const data = await response.json();
    this.storeTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  }
  
  async signout() {
    const token = this.getAccessToken();
    if (token) {
      await fetch(`${this.baseURL}/signout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    
    this.clearTokens();
  }
  
  private storeTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
  
  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
  
  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
  
  private clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export const authService = new AuthService();
```

## Backend Route Protection Examples

```typescript
// Example: Admin-only route
fastify.get('/admin/dashboard', {
  preHandler: [fastify.authenticate, fastify.adminOnly]
}, async (request, reply) => {
  // Only admins can access this
  reply.send({ message: 'Admin dashboard data' });
});

// Example: User can only access their own data
fastify.get('/users/:userId/profile', {
  preHandler: [fastify.authenticate, fastify.requireOwnership('userId')]
}, async (request, reply) => {
  // User can only access their own profile
  const user = await fastify.db.user.findUnique({
    where: { id: request.params.userId }
  });
  reply.send({ user });
});

// Example: Manager or Admin access
fastify.get('/management/reports', {
  preHandler: [fastify.authenticate, fastify.managerOrAdmin]
}, async (request, reply) => {
  // Managers and admins can access
  reply.send({ reports: [] });
});

// Example: Optional authentication
fastify.get('/public/content', {
  preHandler: [fastify.optionalAuth]
}, async (request, reply) => {
  // Works for both authenticated and anonymous users
  const isAuthenticated = !!request.user;
  reply.send({ 
    content: 'Public content',
    isAuthenticated,
    user: request.user 
  });
});
```

## Environment Variables Setup

Create a `.env` file in your backend directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/workstack"
DIRECT_URL="postgresql://username:password@localhost:5432/workstack"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Security
BCRYPT_ROUNDS="12"
MAX_LOGIN_ATTEMPTS="5"
LOCKOUT_TIME="900000"

# App Configuration
APP_NAME="WorkStack"
APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (when database is available)
npm run db:migrate

# Start the server
npm run dev
```

## Testing the System

1. **Start the server**: `npm run dev`
2. **Sign up a user** using the curl command above
3. **Sign in** and get your tokens
4. **Test protected routes** using the access token
5. **View sessions** to see your active logins
6. **Test refresh token** when access token expires
7. **Sign out** to invalidate the session

## Security Features

- ✅ **Rate limiting** on all auth endpoints
- ✅ **Password strength validation**
- ✅ **Session management** with multiple device support
- ✅ **JWT with refresh tokens**
- ✅ **Role-based access control**
- ✅ **Input validation and sanitization**
- ✅ **CSRF protection**
- ✅ **Security headers**
- ✅ **SQL injection protection**
- ✅ **Audit logging**

This authentication system provides enterprise-grade security with comprehensive session management for production use.
