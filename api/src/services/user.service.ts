import { prisma } from '../lib/prisma';
import { getBorrowLimit } from '../schemas/user.schema';

export const UserService = {
  list: (q?: string, role?: string, tier?: string) =>
    prisma.user.findMany({
      where: {
        ...(q && {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } }
          ]
        }),
        ...(role && { role: role as any }),
        ...(tier && { tier: tier as any })
      }
    }),
  
  get: (id: string) => 
    prisma.user.findUnique({ 
      where: { id }
    }),
  
  create: (data: { 
    name: string; 
    email: string; 
    role?: string; 
    tier?: string; 
    phone?: string; 
    address?: string 
  }) => 
    prisma.user.create({ data: data as any }),
  
  update: (id: string, data: Partial<{ 
    name: string; 
    email: string; 
    role: string; 
    tier: string; 
    phone?: string; 
    address?: string 
  }>) =>
    prisma.user.update({ where: { id }, data: data as any }),
  
  remove: (id: string) => prisma.user.delete({ where: { id } }),

  // Check if user can borrow more books based on their tier
  async canBorrow(userId: string): Promise<{ canBorrow: boolean; currentLoans: number; maxLoans: number }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        loans: {
          where: { returnedAt: null }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const currentLoans = user.loans.length;
    
    // Admin users have no borrowing limits
    if ((user as any).role === 'ADMIN') {
      return {
        canBorrow: true,
        currentLoans,
        maxLoans: -1 // -1 indicates unlimited
      };
    }

    const maxLoans = getBorrowLimit((user as any).tier);

    return {
      canBorrow: currentLoans < maxLoans,
      currentLoans,
      maxLoans
    };
  },

  // Get books owned by a specific user
  getOwnedBooks: (userId: string) =>
    prisma.book.findMany({
      where: { ownerId: userId },
      include: {
        loans: {
          where: { returnedAt: null },
          include: {
            borrower: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })
};
