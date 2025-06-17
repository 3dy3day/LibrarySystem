import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  address: z.string().optional()
});

export const updateUserSchema = createUserSchema.partial();

export const userQuerySchema = z.object({
  q: z.string().optional(),
  email: z.string().email().optional()
});

export const userParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID format')
});
