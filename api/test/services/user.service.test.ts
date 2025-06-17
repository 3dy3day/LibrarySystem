import { UserService } from '../../src/services/user.service';

jest.mock('../../src/lib/prisma');

import { prisma } from '../../src/lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

beforeAll(() => {
  mockPrisma.user = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as any;
});

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
      mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);

      const result = await UserService.list();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: undefined,
      });
      expect(result).toEqual(mockUsers);
    });

    it('should return all users without filtering', async () => {
      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      ];
      mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);

      const result = await UserService.list();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: undefined,
      });
      expect(result).toEqual(mockUsers);
    });

    it('should filter users by name or email when query provided', async () => {
      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
      ];
      mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);

      const result = await UserService.list('John');

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
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
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await UserService.get('1');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const mockUser = { id: '1', ...userData };
      mockPrisma.user.create.mockResolvedValue(mockUser as any);

      const result = await UserService.create(userData);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateData = { name: 'John Updated' };
      const mockUser = { id: '1', name: 'John Updated', email: 'john@example.com' };
      mockPrisma.user.update.mockResolvedValue(mockUser as any);

      const result = await UserService.update('1', updateData);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
      mockPrisma.user.delete.mockResolvedValue(mockUser as any);

      const result = await UserService.remove('1');

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
