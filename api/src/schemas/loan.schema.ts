import { z } from 'zod';

export const createLoanSchema = z.object({
  bookId: z.string().uuid('Invalid book ID format'),
  borrowerId: z.string().uuid('Invalid borrower ID format'),
  days: z.number().int().min(1).max(365).optional().default(14)
});

export const loanQuerySchema = z.object({
  bookId: z.string().uuid().optional(),
  borrowerId: z.string().uuid().optional(),
  overdue: z.boolean().optional()
});

export const loanParamsSchema = z.object({
  id: z.string().uuid('Invalid loan ID format')
});
