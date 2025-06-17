import { LoanService } from '../../src/services/loan.service';

jest.mock('../../src/lib/prisma');

import { prisma, BookStatus } from '../../src/lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

beforeAll(() => {
  mockPrisma.$transaction = jest.fn();
  mockPrisma.loan = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  } as any;
});

describe('LoanService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('lend', () => {
    it('should successfully lend an available book', async () => {
      const mockBook = { id: 'book1', status: BookStatus.AVAILABLE };
      const mockLoan = { id: 'loan1', bookId: 'book1', borrowerId: 'user1' };
      
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          book: {
            findUnique: jest.fn().mockResolvedValue(mockBook),
            update: jest.fn().mockResolvedValue({ ...mockBook, status: BookStatus.LENT }),
          },
          loan: {
            create: jest.fn().mockResolvedValue(mockLoan),
          },
        };
        return callback(mockTx);
      });
      
      mockPrisma.$transaction.mockImplementation(mockTransaction);

      const result = await LoanService.lend('book1', 'user1', 14);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockLoan);
    });

    it('should throw error when book is not available', async () => {
      const mockBook = { id: 'book1', status: BookStatus.LENT };
      
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          book: {
            findUnique: jest.fn().mockResolvedValue(mockBook),
          },
        };
        return callback(mockTx);
      });
      
      mockPrisma.$transaction.mockImplementation(mockTransaction);

      await expect(LoanService.lend('book1', 'user1')).rejects.toThrow('Book not available');
    });

    it('should throw error when book does not exist', async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          book: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(mockTx);
      });
      
      mockPrisma.$transaction.mockImplementation(mockTransaction);

      await expect(LoanService.lend('nonexistent', 'user1')).rejects.toThrow('Book not available');
    });
  });

  describe('returnLoan', () => {
    it('should successfully return a loan', async () => {
      const mockLoan = { id: 'loan1', bookId: 'book1', returnedAt: new Date() };
      
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          loan: {
            update: jest.fn().mockResolvedValue(mockLoan),
          },
          book: {
            update: jest.fn().mockResolvedValue({ id: 'book1', status: BookStatus.AVAILABLE }),
          },
        };
        return callback(mockTx);
      });
      
      mockPrisma.$transaction.mockImplementation(mockTransaction);

      const result = await LoanService.returnLoan('loan1');

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockLoan);
    });
  });

  describe('list', () => {
    it('should return all loans with book and borrower details', async () => {
      const mockLoans = [
        { id: 'loan1', book: { title: 'Book 1' }, borrower: { name: 'User 1' } },
      ];
      mockPrisma.loan.findMany.mockResolvedValue(mockLoans as any);

      const result = await LoanService.list();

      expect(mockPrisma.loan.findMany).toHaveBeenCalledWith({
        include: { book: true, borrower: true },
      });
      expect(result).toEqual(mockLoans);
    });
  });

  describe('get', () => {
    it('should return a loan by id with book and borrower details', async () => {
      const mockLoan = { id: 'loan1', book: { title: 'Book 1' }, borrower: { name: 'User 1' } };
      mockPrisma.loan.findUnique.mockResolvedValue(mockLoan as any);

      const result = await LoanService.get('loan1');

      expect(mockPrisma.loan.findUnique).toHaveBeenCalledWith({
        where: { id: 'loan1' },
        include: { book: true, borrower: true },
      });
      expect(result).toEqual(mockLoan);
    });
  });
});
