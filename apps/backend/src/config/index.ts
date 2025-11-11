export enum TokenTypes {
  ACCESS = "access",
  VERIFY_EMAIL = "verify_email",
  RESET_PASSWORD = "reset_password",
}

export const config = {
  DATABASE_URL: process.env.DATABASE_URL!,
  PORT: parseInt(process.env.PORT ?? "3000"),
  HOST: process.env.HOST ?? "0.0.0.0",
  NODE_ENV: process.env.NODE_ENV ?? "development",
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX ?? "100"),
  RATE_LIMIT_TIME_WINDOW: parseInt(
    process.env.RATE_LIMIT_TIME_WINDOW ?? "60000",
  ),

  KEYS: (process.env.APP_KEYS ?? "YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=")
    .split(",")
    .map((key) => Buffer.from(key, "base64")),

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET ?? "super-secret-key-change-in-production",
  JWT_EXPIRY: parseInt(process.env.JWT_EXPIRY ?? "2592000000"), // 30 days
  JWT_REFRESH_EXPIRY: parseInt(process.env.JWT_REFRESH_EXPIRY ?? "2592000000"),

  RESET_PASSWORD_EXPIRY: parseInt(
    process.env.RESET_PASSWORD_EXPIRY ?? "900000",
  ),

  // Session Configuration
  SESSION_EXPIRY: parseInt(process.env.SESSION_EXPIRY ?? "604800000"), // 7 days in ms
  REFRESH_TOKEN_EXPIRY: parseInt(
    process.env.REFRESH_TOKEN_EXPIRY ?? "2592000000",
  ), // 30 days 

  // Security Configuration
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS ?? "12"),
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS ?? "5"),
  LOCKOUT_TIME: parseInt(process.env.LOCKOUT_TIME ?? "900000"), // 15 minutes in ms

  // Email Configuration (for password reset)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT ?? "587"),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  FROM_EMAIL: process.env.FROM_EMAIL ?? "noreply@workstack.com",

  // App Configuration
  APP_ENV: process.env.APP_ENV ?? "development",
  APP_NAME: process.env.APP_NAME ?? "WorkStack",
  APP_URL: process.env.APP_URL ?? "http://localhost:3000",

  REDIS_URL: process.env.REDIS_URL ?? "127.0.0.1",
  REDIS_PORT: process.env.REDIS_PORT ?? "6379",
  REDIS_USERNAME: process.env.REDIS_USERNAME ?? "redis-user",
  REDIS_PASSWORD: process.env.REDIS_PASSWORD ?? "password",
};

export const COOKIES = {
  PAYLOAD: `${config.APP_NAME}_user`,
  HEADER_SIGNATURE: `${config.APP_NAME}_token`,
  SESSION: `${config.APP_NAME}_session`,
};
