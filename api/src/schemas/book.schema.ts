import { z } from 'zod';
import { BookStatus } from '@prisma/client';

const baseBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  publisher: z.string().optional().nullable().or(z.literal('').transform(() => null)),
  publishedAt: z.union([
    z.string().datetime(),
    z.date(),
    z.literal('').transform(() => null),
    z.null(),
    z.undefined()
  ]).optional().nullable(),
  isbn10: z.string().optional().nullable().or(z.literal('').transform(() => null)),
  isbn13: z.string().optional().nullable().or(z.literal('').transform(() => null)),
  comment: z.string().optional().nullable().or(z.literal('').transform(() => null)),
  description: z.string().optional().nullable().or(z.literal('').transform(() => null)),
  thumbnail: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  ownerId: z.string().optional().nullable().or(z.literal('').transform(() => null))
});

export const createBookSchema = baseBookSchema.refine(data => data.isbn10 || data.isbn13, {
  message: 'Either ISBN10 or ISBN13 is required'
});

export const updateBookSchema = baseBookSchema.partial();

export const bookQuerySchema = z.object({
  q: z.string().optional(),
  status: z.nativeEnum(BookStatus).optional(),
  author: z.string().optional()
});

export const bookParamsSchema = z.object({
  id: z.string().uuid('Invalid book ID format')
});

export const setBookStatusSchema = z.object({
  status: z.nativeEnum(BookStatus)
});
