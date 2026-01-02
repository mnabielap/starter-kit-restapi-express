import { z } from 'zod';
import { password } from './custom.validation';

const userIdParam = z.object({
  userId: z.coerce.number().int().positive(),
});

export const createUser = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: password,
    role: z.enum(['user', 'admin']),
  }),
});

export const getUsers = z.object({
  query: z.object({
    name: z.string().optional(),
    role: z.enum(['user', 'admin']).optional(),
    sortBy: z.string().optional(),
    limit: z.coerce.number().int().min(1).optional(),
    page: z.coerce.number().int().min(1).optional(),
    search: z.string().optional(),
    scope: z.enum(['all', 'name', 'email', 'id']).optional(),
  }),
});

export const getUser = z.object({
  params: userIdParam,
});

export const updateUser = z.object({
  params: userIdParam,
  body: z.object({
    email: z.string().email().optional(),
    password: password.optional(),
    name: z.string().optional(),
    role: z.enum(['user', 'admin']).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Update body must have at least one field',
  }),
});

export const deleteUser = z.object({
  params: userIdParam,
});