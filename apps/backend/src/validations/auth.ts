/* eslint-disable @typescript-eslint/no-unused-vars */
import z from 'zod';

export const register = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
      },
      email: {
        type: 'string',
        format: 'email',
      },
      password: {
        type: 'string',
        minLength: 8,
      },
    },
    additionalProperties: false,
  },
} as const;

export const login = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
      },
      password: {
        type: 'string',
        minLength: 8,
      },
    },
    additionalProperties: false,
  },
} as const;

const RegisterSchema = z.object({
  email: z.string().email({ message: 'Please enter valid email' }),
  password: z
    .string({ message: 'Password must be at least 8 characters' })
    .min(8),
  name: z.string(),
});

const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter valid email' }),
  password: z.string().min(8),
});

export type Register = z.infer<typeof RegisterSchema>;
export type Login = z.infer<typeof LoginSchema>;
