import { LoanService } from '../../src/services/loan.service';

// Mock the entire prisma module
jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    loan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    book: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
  BookStatus: {
    AVAILABLE: 'AVAILABLE',
    LENT: 'LENT',
    LOST: 'LOST',
  },
}));

// Mock UserService
jest.mock('../../src/services/user.service', () => ({
  UserService: {
    canBorrow: jest.fn(),
  },
}));

// Import after mocking
import { prisma, BookStatus } from '../../src/lib/prisma';
import { UserService } from '../../src/services/user.service';

// Create typed mock functions
const mockTransaction = prisma.$transaction as jest.MockedFunction<typeof prisma.$transaction>;
const mockFindMany = prisma.loan.findMany as jest.MockedFunction<typeof prisma.loan.findMany>;
const mockFindUnique = prisma.loan.findUnique as jest.MockedFunction<typeof prisma.loan.findUnique>;
const mockCanBorrow = UserService.canBorrow as jest.MockedFunction<typeof UserService.canBorrow>;

describe('LoanService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return all loans when no filters provided', async () => {
      const mockLoans = [
        { 
          id: '1', 
          bookId: 'book1', 
          borrowerId: 'user1',
          lentAt: new Date(),
          dueAt: new Date(),
          returnedAt: null
        },
        { 
          id: '2', 
          bookId: 'book2', 
          borrowerId: 'user2',
          lentAt: new Date(),
          dueAt: new Date(),
          returnedAt: null
        },
      ];
      mockFindMany.mockResolvedValue(mockLoans as any);

      const result = await LoanService.list();

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {},
        include: { book: true, borrower: true },
      });
      expect(result).toEqual(mockLoans);
    });

    it('should filter loans by borrower when borrowerId provided', async () => {
      const mockLoans = [
        { 
          id: '1', 
          bookId: 'book1', 
          borrowerId: 'user1',
          lentAt: new Date(),
          dueAt: new Date(),
          returnedAt: null
        },
      ];
      mockFindMany.mockResolvedValue(mockLoans as any);

      const result = await LoanService.list(undefined, 'user1');

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { borrowerId: 'user1' },
        include: { book: true, borrower: true },
      });
      expect(result).toEqual(mockLoans);
    });

    it('should filter overdue loans when overdue flag is true', async () => {
      const mockLoans = [
        { 
          id: '1', 
          bookId: 'book1', 
          borrowerId: 'user1',
          lentAt: new Date('2023-01-01'),
          dueAt: new Date('2023-01-15'),
          returnedAt: null
        },
      ];
      mockFindMany.mockResolvedValue(mockLoans as any);

      const result = await LoanService.list(undefined, undefined, true);

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { 
          dueAt: { lt: expect.any(Date) },
          returnedAt: null 
        },
        include: { book: true, borrower: true },
      });
      expect(result).toEqual(mockLoans);
    });
  });

  describe('get', () => {
    it('should return a loan by id', async () => {
      const mockLoan = { 
        id: '1', 
        bookId: 'book1', 
        borrowerId: 'user1',
        lentAt: new Date(),
        dueAt: new Date(),
        returnedAt: null
      };
      mockFindUnique.mockResolvedValue(mockLoan as any);

      const result = await LoanService.get('1');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { book: true, borrower: true },
      });
      expect(result).toEqual(mockLoan);
    });
  });

  describe('lend', () => {
    it('should create a new loan when book is available and user can borrow', async () => {
      const mockBook = { id: 'book1', status: BookStatus.AVAILABLE };
      const mockLoan = { 
        id: '1', 
        bookId: 'book1', 
        borrowerId: 'user1',
        lentAt: new Date(),
        dueAt: new Date(),
        returnedAt: null
      };

      mockCanBorrow.mockResolvedValue({ 
        canBorrow: true,
        currentLoans: 0,
        maxLoans: 1,
        hasOverdueBooks: false,
        overdueCount: 0
      });
      
      // Mock the transaction callback
      mockTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          book: {
            findUnique: jest.fn().mockResolvedValue(mockBook),
            update: jest.fn().mockResolvedValue(mockBook),
          },
          loan: {
            create: jest.fn().mockResolvedValue(mockLoan),
          },
        };
        return callback(mockTx as any);
      });

      const result = await LoanService.lend('book1', 'user1', 14);

      expect(mockCanBorrow).toHaveBeenCalledWith('user1');
      expect(result).toEqual(mockLoan);
    });

    it('should throw error when book is not available', async () => {
      const mockBook = { id: 'book1', status: BookStatus.LENT };

      mockCanBorrow.mockResolvedValue({ 
        canBorrow: true,
        currentLoans: 0,
        maxLoans: 1,
        hasOverdueBooks: false,
        overdueCount: 0
      });
      
      mockTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          book: {
            findUnique: jest.fn().mockResolvedValue(mockBook),
          },
        };
        return callback(mockTx as any);
      });

      await expect(LoanService.lend('book1', 'user1')).rejects.toThrow('Book not available');
    });

    it('should throw error when user cannot borrow more books', async () => {
      const mockBook = { id: 'book1', status: BookStatus.AVAILABLE }; // Book is available
      
      mockCanBorrow.mockResolvedValue({ 
        canBorrow: false,
        currentLoans: 1,
        maxLoans: 1,
        hasOverdueBooks: false,
        overdueCount: 0,
        reason: 'User has reached borrowing limit' 
      });
      
      mockTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          book: {
            findUnique: jest.fn().mockResolvedValue(mockBook), // Book exists and is available
          },
        };
        return callback(mockTx as any);
      });

      await expect(LoanService.lend('book1', 'user1')).rejects.toThrow('User has reached borrowing limit');
    });
  });

  describe('returnLoan', () => {
    it('should return a loan successfully', async () => {
      const mockLoan = { 
        id: '1', 
        bookId: 'book1', 
        borrowerId: 'user1',
        lentAt: new Date(),
        dueAt: new Date(),
        returnedAt: new Date(),
        borrower: { id: 'user1', name: 'Test User' },
        book: { id: 'book1', title: 'Test Book', ownerId: null, owner: null }
      };

      const mockUpdatedLoan = { 
        id: '1', 
        bookId: 'book1', 
        borrowerId: 'user1',
        returnedAt: new Date()
      };

      mockTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          loan: {
            findUnique: jest.fn().mockResolvedValue(mockLoan),
            update: jest.fn().mockResolvedValue(mockUpdatedLoan),
          },
          book: {
            update: jest.fn().mockResolvedValue({ id: 'book1', status: BookStatus.AVAILABLE }),
          },
          user: {
            findUnique: jest.fn().mockResolvedValue({ id: 'user1', role: 'USER' }),
          },
        };
        return callback(mockTx as any);
      });

      const result = await LoanService.returnLoan('1', 'user1');

      expect(result).toEqual(mockUpdatedLoan);
    });

    it('should throw error when loan is not found', async () => {
      mockTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          loan: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(mockTx as any);
      });

      await expect(LoanService.returnLoan('nonexistent')).rejects.toThrow('Rental not found');
    });

    it('should throw error when user does not have permission', async () => {
      const mockLoan = { 
        id: '1', 
        bookId: 'book1', 
        borrowerId: 'user1',
        borrower: { id: 'user1', name: 'Test User' },
        book: { id: 'book1', title: 'Test Book', ownerId: 'user2', owner: { id: 'user2' } }
      };

      mockTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          loan: {
            findUnique: jest.fn().mockResolvedValue(mockLoan),
          },
          user: {
            findUnique: jest.fn().mockResolvedValue({ id: 'user3', role: 'USER' }),
          },
        };
        return callback(mockTx as any);
      });

      await expect(LoanService.returnLoan('1', 'user3')).rejects.toThrow('You do not have permission to return this book');
    });
  });
});
