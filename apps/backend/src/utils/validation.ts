import { type FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';

export class ValidationHelper {
  static validateQuery<T>(request: FastifyRequest): T {
    return request.query as T;
  }

  static validateBody<T>(request: FastifyRequest): T {
    return request.body as T;
  }

  static validateParams<T>(request: FastifyRequest): T {
    return request.params as T;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation with comprehensive rules
export const validatePassword = (
  password: string,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common weak patterns
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters
    /123|abc|qwe|asd|zxc/i, // Sequential patterns
    /password|admin|user|test/i, // Common words
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common patterns and is not secure');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Name validation
export const validateName = (name: string): boolean => {
  if (!name || name.trim().length === 0) return false;
  if (name.length > 100) return false;

  // Allow letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(name);
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

// Email sanitization
export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Password strength scoring
export const getPasswordStrength = (
  password: string,
): { score: number; label: string } => {
  let score = 0;

  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

  // Bonus for uncommon characters
  if (/[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    score += 1;

  let label: string;
  if (score <= 2) label = 'Very Weak';
  else if (score <= 4) label = 'Weak';
  else if (score <= 6) label = 'Medium';
  else if (score <= 8) label = 'Strong';
  else label = 'Very Strong';

  return { score, label };
};

// Validation schemas using TypeBox
export const AuthSchemas = {
  Signup: Type.Object({
    email: Type.String({
      format: 'email',
      minLength: 5,
      maxLength: 255,
      description: 'Valid email address',
    }),
    password: Type.String({
      minLength: 8,
      maxLength: 128,
      description: 'Password with at least 8 characters',
    }),
    name: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'User display name',
      }),
    ),
  }),

  Signin: Type.Object({
    email: Type.String({
      format: 'email',
      description: 'Valid email address',
    }),
    password: Type.String({
      minLength: 1,
      description: 'User password',
    }),
  }),

  RefreshToken: Type.Object({
    refreshToken: Type.String({
      minLength: 1,
      description: 'Valid refresh token',
    }),
  }),

  PasswordResetRequest: Type.Object({
    email: Type.String({
      format: 'email',
      description: 'Valid email address',
    }),
  }),

  PasswordReset: Type.Object({
    token: Type.String({
      minLength: 1,
      description: 'Password reset token',
    }),
    password: Type.String({
      minLength: 8,
      maxLength: 128,
      description: 'New password',
    }),
  }),

  ChangePassword: Type.Object({
    currentPassword: Type.String({
      minLength: 1,
      description: 'Current password',
    }),
    newPassword: Type.String({
      minLength: 8,
      maxLength: 128,
      description: 'New password',
    }),
  }),

  SessionId: Type.Object({
    sessionId: Type.String({
      minLength: 1,
      description: 'Session ID',
    }),
  }),
};

// Response schemas
export const AuthResponseSchemas = {
  User: Type.Object({
    id: Type.String(),
    email: Type.String(),
    name: Type.String(),
    role: Type.String(),
    avatar: Type.Union([Type.String(), Type.Null()]),
    createdAt: Type.String(),
    lastLoginAt: Type.Union([Type.String(), Type.Null()]),
  }),

  Session: Type.Object({
    id: Type.String(),
    userAgent: Type.String(),
    ipAddress: Type.String(),
    createdAt: Type.String(),
    lastActiveAt: Type.String(),
    isCurrent: Type.Boolean(),
  }),

  AuthSuccess: Type.Object({
    user: Type.Object({
      id: Type.String(),
      email: Type.String(),
      name: Type.String(),
      role: Type.String(),
    }),
    accessToken: Type.String(),
    refreshToken: Type.String(),
  }),

  MessageResponse: Type.Object({
    message: Type.String(),
  }),

  ErrorResponse: Type.Object({
    error: Type.String(),
    retryAfter: Type.Optional(Type.String()),
  }),
};
