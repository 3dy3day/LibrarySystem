import { BookService } from '../../src/services/book.service';

// Mock the entire prisma module
jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    book: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
  BookStatus: {
    AVAILABLE: 'AVAILABLE',
    LENT: 'LENT',
    LOST: 'LOST',
  },
}));

// Import after mocking
import { prisma, BookStatus } from '../../src/lib/prisma';

// Create typed mock functions
const mockFindMany = prisma.book.findMany as jest.MockedFunction<typeof prisma.book.findMany>;
const mockFindUnique = prisma.book.findUnique as jest.MockedFunction<typeof prisma.book.findUnique>;
const mockCreate = prisma.book.create as jest.MockedFunction<typeof prisma.book.create>;
const mockUpdate = prisma.book.update as jest.MockedFunction<typeof prisma.book.update>;
const mockDelete = prisma.book.delete as jest.MockedFunction<typeof prisma.book.delete>;

describe('BookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return all books when no query provided', async () => {
      const mockBooks = [
        { id: '1', title: 'Test Book', author: 'Test Author' },
        { id: '2', title: 'Another Book', author: 'Another Author' },
      ];
      mockFindMany.mockResolvedValue(mockBooks as any);

      const result = await BookService.list();

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {},
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
      });
      expect(result).toEqual(mockBooks);
    });

    it('should filter books by title when query provided', async () => {
      const mockBooks = [
        { id: '1', title: 'Test Book', author: 'Test Author' },
      ];
      mockFindMany.mockResolvedValue(mockBooks as any);

      const result = await BookService.list('Test');

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'Test' } },
            { isbn10: { equals: 'Test' } },
            { isbn13: { equals: 'Test' } }
          ]
        },
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
      });
      expect(result).toEqual(mockBooks);
    });
  });

  describe('get', () => {
    it('should return a book by id', async () => {
      const mockBook = { id: '1', title: 'Test Book', author: 'Test Author' };
      mockFindUnique.mockResolvedValue(mockBook as any);

      const result = await BookService.get('1');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
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
      });
      expect(result).toEqual(mockBook);
    });
  });

  describe('create', () => {
    it('should create a new book', async () => {
      const bookData = { title: 'New Book', author: 'New Author' };
      const mockBook = { id: '1', ...bookData };
      mockCreate.mockResolvedValue(mockBook as any);

      const result = await BookService.create(bookData);

      expect(mockCreate).toHaveBeenCalledWith({
        data: bookData,
      });
      expect(result).toEqual(mockBook);
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const updateData = { title: 'Updated Book' };
      const mockBook = { id: '1', title: 'Updated Book', author: 'Test Author' };
      mockUpdate.mockResolvedValue(mockBook as any);

      const result = await BookService.update('1', updateData);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
      expect(result).toEqual(mockBook);
    });
  });

  describe('remove', () => {
    it('should delete a book with no loans', async () => {
      const mockBookWithLoans = { 
        id: '1', 
        title: 'Test Book', 
        author: 'Test Author',
        loans: [] // No loans
      };
      const mockBook = { id: '1', title: 'Test Book', author: 'Test Author' };
      
      mockFindUnique.mockResolvedValue(mockBookWithLoans as any);
      mockDelete.mockResolvedValue(mockBook as any);

      const result = await BookService.remove('1');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { loans: true }
      });
      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockBook);
    });

    it('should throw error when book has active loans', async () => {
      const mockBookWithActiveLoans = { 
        id: '1', 
        title: 'Test Book', 
        author: 'Test Author',
        loans: [{ id: 'loan1', returnedAt: null }] // Active loan
      };
      
      mockFindUnique.mockResolvedValue(mockBookWithActiveLoans as any);

      await expect(BookService.remove('1')).rejects.toThrow('Cannot delete book with active rentals. Please return the book first.');
    });

    it('should throw error when book not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(BookService.remove('1')).rejects.toThrow('Book not found');
    });
  });

  describe('setStatus', () => {
    it('should update book status', async () => {
      const mockBook = { id: '1', title: 'Test Book', status: BookStatus.LENT };
      mockUpdate.mockResolvedValue(mockBook as any);

      const result = await BookService.setStatus('1', BookStatus.LENT);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: BookStatus.LENT },
      });
      expect(result).toEqual(mockBook);
    });
  });
});
