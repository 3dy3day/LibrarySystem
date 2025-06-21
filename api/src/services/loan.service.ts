import { prisma, BookStatus } from '../lib/prisma';
import { UserService } from './user.service';

export const LoanService = {

  async lend(bookId: string, borrowerId: string, days = 14) {
    return prisma.$transaction(async (tx) => {
      // Check if book is available
      const book = await tx.book.findUnique({ where: { id: bookId } });
      if (!book || book.status !== BookStatus.AVAILABLE)
        throw new Error('Book not available');

      // Check if user can borrow more books based on their tier and overdue status
      const borrowLimit = await UserService.canBorrow(borrowerId);
      if (!borrowLimit.canBorrow) {
        throw new Error(borrowLimit.reason || 'Cannot borrow more books');
      }

      const dueAt = new Date(Date.now() + days * 86400_000);
      const loan = await tx.loan.create({
        data: { bookId, borrowerId, dueAt }
      });
      await tx.book.update({
        where: { id: bookId },
        data: { status: BookStatus.LENT }
      });
      return loan;
    });
  },


  async returnLoan(loanId: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      // First get the loan with borrower and book owner info
      const existingLoan = await tx.loan.findUnique({
        where: { id: loanId },
        include: {
          borrower: true,
          book: {
            include: {
              owner: true
            }
          }
        }
      });

      if (!existingLoan) {
        throw new Error('Rental not found');
      }

      // Check permissions: only admin, book owner, or borrower can return
      if (userId) {
        const user = await tx.user.findUnique({ where: { id: userId } });
        const isAdmin = user?.role === 'ADMIN';
        const isBorrower = existingLoan.borrowerId === userId;
        const isOwner = existingLoan.book.ownerId === userId;

        if (!isAdmin && !isBorrower && !isOwner) {
          throw new Error('You do not have permission to return this book');
        }
      }

      const loan = await tx.loan.update({
        where: { id: loanId },
        data: { returnedAt: new Date() }
      });
      await tx.book.update({
        where: { id: loan.bookId },
        data: { status: BookStatus.AVAILABLE }
      });
      return loan;
    });
  },

  list: (bookId?: string, borrowerId?: string, overdue?: boolean) =>
    prisma.loan.findMany({
      where: {
        ...(bookId && { bookId }),
        ...(borrowerId && { borrowerId }),
        ...(overdue && { 
          dueAt: { lt: new Date() },
          returnedAt: null 
        })
      },
      include: { book: true, borrower: true }
    }),
  get: (id: string) =>
    prisma.loan.findUnique({ where: { id }, include: { book: true, borrower: true } })
};
