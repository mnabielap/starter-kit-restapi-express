import { z } from 'zod';
import { password } from './custom.validation';

export const register = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: password,
  }),
});

export const login = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const logout = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export const refreshTokens = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export const forgotPassword = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPassword = z.object({
  query: z.object({
    token: z.string(),
  }),
  body: z.object({
    password: password,
  }),
});

export const verifyEmail = z.object({
  query: z.object({
    token: z.string(),
  }),
});