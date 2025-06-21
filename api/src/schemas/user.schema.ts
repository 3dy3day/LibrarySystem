import { z } from 'zod';

export const UserRole = z.enum(['USER', 'ADMIN']);
export const UserTier = z.enum(['TIER_1', 'TIER_2', 'TIER_3', 'TIER_4']);

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  role: UserRole.optional().default('USER'),
  tier: UserTier.optional().default('TIER_4'),
  phone: z.string().optional(),
  address: z.string().optional()
});

export const updateUserSchema = createUserSchema.partial();

export const userQuerySchema = z.object({
  q: z.string().optional(),
  email: z.string().email().optional(),
  role: UserRole.optional(),
  tier: UserTier.optional()
});

export const userParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID format')
});

// Helper function to get borrow limit based on tier
export const getBorrowLimit = (tier: string): number => {
  switch (tier) {
    case 'TIER_1': return 3; // 3000 yen
    case 'TIER_2': return 3; // 1000 yen
    case 'TIER_3': return 2; // 500 yen
    case 'TIER_4': return 1; // default
    default: return 1;
  }
};
