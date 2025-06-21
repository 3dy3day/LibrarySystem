import { UserService } from '../../src/services/user.service';

// Mock the entire prisma module
jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Import after mocking
import { prisma } from '../../src/lib/prisma';

// Create typed mock functions
const mockFindMany = prisma.user.findMany as jest.MockedFunction<typeof prisma.user.findMany>;
const mockFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;
const mockCreate = prisma.user.create as jest.MockedFunction<typeof prisma.user.create>;
const mockUpdate = prisma.user.update as jest.MockedFunction<typeof prisma.user.update>;
const mockDelete = prisma.user.delete as jest.MockedFunction<typeof prisma.user.delete>;

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return all users when no query provided', async () => {
      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      ];
      mockFindMany.mockResolvedValue(mockUsers as any);

      const result = await UserService.list();

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toEqual(mockUsers);
    });

    it('should filter users by name or email when query provided', async () => {
      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
      ];
      mockFindMany.mockResolvedValue(mockUsers as any);

      const result = await UserService.list('John');

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'John' } },
            { email: { contains: 'John' } }
          ]
        },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('get', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
      mockFindUnique.mockResolvedValue(mockUser as any);

      const result = await UserService.get('1');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: '1' },
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
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const mockUser = { id: '1', ...userData };
      mockCreate.mockResolvedValue(mockUser as any);

      const result = await UserService.create(userData);

      expect(mockCreate).toHaveBeenCalledWith({
        data: userData,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateData = { name: 'John Updated' };
      const mockUser = { id: '1', name: 'John Updated', email: 'john@example.com' };
      mockUpdate.mockResolvedValue(mockUser as any);

      const result = await UserService.update('1', updateData);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
      mockDelete.mockResolvedValue(mockUser as any);

      const result = await UserService.remove('1');

      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
