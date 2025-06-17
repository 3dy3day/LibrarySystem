import { BookService } from '../../src/services/book.service';

jest.mock('../../src/lib/prisma');

import { prisma, BookStatus } from '../../src/lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

beforeAll(() => {
  mockPrisma.book = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as any;
});

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
      mockPrisma.book.findMany.mockResolvedValue(mockBooks as any);

      const result = await BookService.list();

      expect(mockPrisma.book.findMany).toHaveBeenCalledWith({
        where: undefined,
      });
      expect(result).toEqual(mockBooks);
    });

    it('should filter books by title when query provided', async () => {
      const mockBooks = [
        { id: '1', title: 'Test Book', author: 'Test Author' },
      ];
      mockPrisma.book.findMany.mockResolvedValue(mockBooks as any);

      const result = await BookService.list('Test');

      expect(mockPrisma.book.findMany).toHaveBeenCalledWith({
        where: {
          title: { contains: 'Test' },
        },
      });
      expect(result).toEqual(mockBooks);
    });
  });

  describe('get', () => {
    it('should return a book by id', async () => {
      const mockBook = { id: '1', title: 'Test Book', author: 'Test Author' };
      mockPrisma.book.findUnique.mockResolvedValue(mockBook as any);

      const result = await BookService.get('1');

      expect(mockPrisma.book.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockBook);
    });
  });

  describe('create', () => {
    it('should create a new book', async () => {
      const bookData = { title: 'New Book', author: 'New Author' };
      const mockBook = { id: '1', ...bookData };
      mockPrisma.book.create.mockResolvedValue(mockBook as any);

      const result = await BookService.create(bookData);

      expect(mockPrisma.book.create).toHaveBeenCalledWith({
        data: bookData,
      });
      expect(result).toEqual(mockBook);
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const updateData = { title: 'Updated Book' };
      const mockBook = { id: '1', title: 'Updated Book', author: 'Test Author' };
      mockPrisma.book.update.mockResolvedValue(mockBook as any);

      const result = await BookService.update('1', updateData);

      expect(mockPrisma.book.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
      expect(result).toEqual(mockBook);
    });
  });

  describe('remove', () => {
    it('should delete a book', async () => {
      const mockBook = { id: '1', title: 'Test Book', author: 'Test Author' };
      mockPrisma.book.delete.mockResolvedValue(mockBook as any);

      const result = await BookService.remove('1');

      expect(mockPrisma.book.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockBook);
    });
  });

  describe('setStatus', () => {
    it('should update book status', async () => {
      const mockBook = { id: '1', title: 'Test Book', status: BookStatus.LENT };
      mockPrisma.book.update.mockResolvedValue(mockBook as any);

      const result = await BookService.setStatus('1', BookStatus.LENT);

      expect(mockPrisma.book.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: BookStatus.LENT },
      });
      expect(result).toEqual(mockBook);
    });
  });
});
