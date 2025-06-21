import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';

describe('Users API Integration Tests', () => {
  beforeAll(async () => {
    // Clean up database before tests
    await prisma.loan.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up database after tests
    await prisma.loan.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up before each test
    await prisma.loan.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('GET /api/v1/users', () => {
    it('should return empty array when no users exist', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all users', async () => {
      const user1 = await prisma.user.create({
        data: {
          name: 'Test User 1',
          email: 'test1@example.com',
          role: 'USER',
          tier: 'TIER_4',
        },
      });

      const user2 = await prisma.user.create({
        data: {
          name: 'Test User 2',
          email: 'test2@example.com',
          role: 'ADMIN',
          tier: 'TIER_1',
        },
      });

      const response = await request(app)
        .get('/api/v1/users')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: user1.id,
        name: 'Test User 1',
        email: 'test1@example.com',
        role: 'USER',
        tier: 'TIER_4',
      });
      expect(response.body[1]).toMatchObject({
        id: user2.id,
        name: 'Test User 2',
        email: 'test2@example.com',
        role: 'ADMIN',
        tier: 'TIER_1',
      });
    });

    it('should filter users by name query', async () => {
      await prisma.user.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      });

      await prisma.user.create({
        data: {
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
      });

      const response = await request(app)
        .get('/api/v1/users?q=John')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('John Doe');
    });

    it('should filter users by role', async () => {
      await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
      });

      await prisma.user.create({
        data: {
          name: 'Regular User',
          email: 'user@example.com',
          role: 'USER',
        },
      });

      const response = await request(app)
        .get('/api/v1/users?role=ADMIN')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].role).toBe('ADMIN');
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return a specific user', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Specific User',
          email: 'specific@example.com',
          role: 'USER',
          tier: 'TIER_2',
        },
      });

      const response = await request(app)
        .get(`/api/v1/users/${user.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: user.id,
        name: 'Specific User',
        email: 'specific@example.com',
        role: 'USER',
        tier: 'TIER_2',
      });
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/v1/users/non-existent-id')
        .expect(404);
    });
  });

  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        role: 'USER',
        tier: 'TIER_3',
      };

      const response = await request(app)
        .post('/api/v1/users')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject(userData);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');

      // Verify user was created in database
      const createdUser = await prisma.user.findUnique({
        where: { id: response.body.id },
      });
      expect(createdUser).toBeTruthy();
    });

    it('should create a user with default values', async () => {
      const userData = {
        name: 'Default User',
        email: 'default@example.com',
      };

      const response = await request(app)
        .post('/api/v1/users')
        .send(userData)
        .expect(201);

      expect(response.body.role).toBe('USER');
      expect(response.body.tier).toBe('TIER_4');
    });

    it('should return 400 for invalid user data', async () => {
      const invalidUserData = {
        name: '', // Empty name should be invalid
        email: 'invalid-email', // Invalid email format
      };

      await request(app)
        .post('/api/v1/users')
        .send(invalidUserData)
        .expect(400);
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        name: 'First User',
        email: 'duplicate@example.com',
      };

      // Create first user
      await request(app)
        .post('/api/v1/users')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      const duplicateUserData = {
        name: 'Second User',
        email: 'duplicate@example.com',
      };

      await request(app)
        .post('/api/v1/users')
        .send(duplicateUserData)
        .expect(400);
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it('should update a user', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Original Name',
          email: 'original@example.com',
          role: 'USER',
          tier: 'TIER_4',
        },
      });

      const updateData = {
        name: 'Updated Name',
        tier: 'TIER_1',
      };

      const response = await request(app)
        .patch(`/api/v1/users/${user.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.tier).toBe('TIER_1');
      expect(response.body.email).toBe('original@example.com'); // Should remain unchanged
      expect(response.body.role).toBe('USER'); // Should remain unchanged

      // Verify update in database
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser?.name).toBe('Updated Name');
      expect(updatedUser?.tier).toBe('TIER_1');
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .patch('/api/v1/users/non-existent-id')
        .send({ name: 'Updated Name' })
        .expect(404);
    });

    it('should return 400 for invalid update data', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
        },
      });

      const invalidUpdateData = {
        email: 'invalid-email-format',
      };

      await request(app)
        .patch(`/api/v1/users/${user.id}`)
        .send(invalidUpdateData)
        .expect(400);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete a user', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'User to Delete',
          email: 'delete@example.com',
        },
      });

      await request(app)
        .delete(`/api/v1/users/${user.id}`)
        .expect(204);

      // Verify user was deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(deletedUser).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .delete('/api/v1/users/non-existent-id')
        .expect(404);
    });

    it('should return 400 when trying to delete user with active loans', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'User with Loans',
          email: 'withloans@example.com',
        },
      });

      const book = await prisma.book.create({
        data: {
          title: 'Test Book',
          author: 'Test Author',
          isbn13: '1234567890123',
        },
      });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // Create an active loan
      await prisma.loan.create({
        data: {
          bookId: book.id,
          borrowerId: user.id,
          dueAt: dueDate,
        },
      });

      await request(app)
        .delete(`/api/v1/users/${user.id}`)
        .expect(400);
    });
  });

  describe('GET /api/v1/users/:id/loans', () => {
    it('should return user loans', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'User with Loans',
          email: 'userloans@example.com',
        },
      });

      const book1 = await prisma.book.create({
        data: {
          title: 'Book 1',
          author: 'Author 1',
          isbn13: '1234567890123',
        },
      });

      const book2 = await prisma.book.create({
        data: {
          title: 'Book 2',
          author: 'Author 2',
          isbn13: '1234567890124',
        },
      });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const loan1 = await prisma.loan.create({
        data: {
          bookId: book1.id,
          borrowerId: user.id,
          dueAt: dueDate,
        },
      });

      const loan2 = await prisma.loan.create({
        data: {
          bookId: book2.id,
          borrowerId: user.id,
          dueAt: dueDate,
        },
      });

      const response = await request(app)
        .get(`/api/v1/users/${user.id}/loans`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.map((loan: any) => loan.id)).toContain(loan1.id);
      expect(response.body.map((loan: any) => loan.id)).toContain(loan2.id);
    });

    it('should return empty array for user with no loans', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'User without Loans',
          email: 'noloans@example.com',
        },
      });

      const response = await request(app)
        .get(`/api/v1/users/${user.id}/loans`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/v1/users/non-existent-id/loans')
        .expect(404);
    });
  });

  describe('GET /api/v1/users/:id/books', () => {
    it('should return user owned books', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Book Owner',
          email: 'owner@example.com',
        },
      });

      const book1 = await prisma.book.create({
        data: {
          title: 'Owned Book 1',
          author: 'Author 1',
          isbn13: '1234567890123',
          ownerId: user.id,
        },
      });

      const book2 = await prisma.book.create({
        data: {
          title: 'Owned Book 2',
          author: 'Author 2',
          isbn13: '1234567890124',
          ownerId: user.id,
        },
      });

      // Create a book owned by someone else
      await prisma.book.create({
        data: {
          title: 'Not Owned Book',
          author: 'Other Author',
          isbn13: '1234567890125',
        },
      });

      const response = await request(app)
        .get(`/api/v1/users/${user.id}/books`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.map((book: any) => book.id)).toContain(book1.id);
      expect(response.body.map((book: any) => book.id)).toContain(book2.id);
    });

    it('should return empty array for user with no owned books', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'User without Books',
          email: 'nobooks@example.com',
        },
      });

      const response = await request(app)
        .get(`/api/v1/users/${user.id}/books`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/v1/users/non-existent-id/books')
        .expect(404);
    });
  });
});
