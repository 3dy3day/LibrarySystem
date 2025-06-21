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
      where: { id },
      include: {
        loans: {
          where: { returnedAt: null },
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                thumbnail: true
              }
            }
          }
        }
      }
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

  // Check if user can borrow more books based on their tier and overdue status
  async canBorrow(userId: string): Promise<{ 
    canBorrow: boolean; 
    currentLoans: number; 
    maxLoans: number; 
    hasOverdueBooks: boolean;
    overdueCount: number;
    reason?: string;
  }> {
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
    const now = new Date();
    
    // Check for overdue books
    const overdueLoans = user.loans.filter(loan => loan.dueAt < now);
    const hasOverdueBooks = overdueLoans.length > 0;
    const overdueCount = overdueLoans.length;
    
    // Admin users have no borrowing limits but still can't borrow with overdue books
    if ((user as any).role === 'ADMIN') {
      if (hasOverdueBooks) {
        return {
          canBorrow: false,
          currentLoans,
          maxLoans: -1,
          hasOverdueBooks,
          overdueCount,
          reason: `Cannot borrow new books. You have ${overdueCount} overdue book${overdueCount > 1 ? 's' : ''} that must be returned first.`
        };
      }
      
      return {
        canBorrow: true,
        currentLoans,
        maxLoans: -1, // -1 indicates unlimited
        hasOverdueBooks,
        overdueCount
      };
    }

    const maxLoans = getBorrowLimit((user as any).tier);

    // Check if user has overdue books (penalty feature)
    if (hasOverdueBooks) {
      return {
        canBorrow: false,
        currentLoans,
        maxLoans,
        hasOverdueBooks,
        overdueCount,
        reason: `Cannot borrow new books. You have ${overdueCount} overdue book${overdueCount > 1 ? 's' : ''} that must be returned first.`
      };
    }

    // Check if user has reached borrowing limit
    if (currentLoans >= maxLoans) {
      return {
        canBorrow: false,
        currentLoans,
        maxLoans,
        hasOverdueBooks,
        overdueCount,
        reason: `Cannot borrow more books. Current rentals: ${currentLoans}/${maxLoans}`
      };
    }

    return {
      canBorrow: true,
      currentLoans,
      maxLoans,
      hasOverdueBooks,
      overdueCount
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
