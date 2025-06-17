import { prisma, BookStatus } from '../lib/prisma';

export const LoanService = {

  async lend(bookId: string, borrowerId: string, days = 14) {
    return prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { id: bookId } });
      if (!book || book.status !== BookStatus.AVAILABLE)
        throw new Error('Book not available');

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


  async returnLoan(loanId: string) {
    return prisma.$transaction(async (tx) => {
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
