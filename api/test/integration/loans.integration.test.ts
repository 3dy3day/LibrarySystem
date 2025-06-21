import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';

describe('Loans API Integration Tests', () => {
  let testUser: any;
  let testBook: any;

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

    // Create test user and book for each test
    testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
        tier: 'TIER_4',
      },
    });

    testBook = await prisma.book.create({
      data: {
        title: 'Test Book',
        author: 'Test Author',
        isbn13: '1234567890123',
        status: 'AVAILABLE',
      },
    });
  });

  describe('GET /api/v1/loans', () => {
    it('should return empty array when no loans exist', async () => {
      const response = await request(app)
        .get('/api/v1/loans')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all loans', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 2 weeks from now

      const loan = await prisma.loan.create({
        data: {
          bookId: testBook.id,
          borrowerId: testUser.id,
          dueAt: dueDate,
        },
      });

      const response = await request(app)
        .get('/api/v1/loans')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        id: loan.id,
        bookId: testBook.id,
        borrowerId: testUser.id,
      });
    });

    it('should filter loans by borrower', async () => {
      const anotherUser = await prisma.user.create({
        data: {
          name: 'Another User',
          email: 'another@example.com',
        },
      });

      const anotherBook = await prisma.book.create({
        data: {
          title: 'Another Book',
          author: 'Another Author',
          isbn13: '1234567890124',
        },
      });

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // Create loans for both users
      await prisma.loan.create({
        data: {
          bookId: testBook.id,
          borrowerId: testUser.id,
          dueAt: dueDate,
        },
      });

      await prisma.loan.create({
        data: {
          bookId: anotherBook.id,
          borrowerId: anotherUser.id,
          dueAt: dueDate,
        },
      });

      const response = await request(app)
        .get(`/api/v1/loans?borrowerId=${testUser.id}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].borrowerId).toBe(testUser.id);
    });
  });

  describe('GET /api/v1/loans/:id', () => {
    it('should return a specific loan', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const loan = await prisma.loan.create({
        data: {
          bookId: testBook.id,
          borrowerId: testUser.id,
          dueAt: dueDate,
        },
      });

      const response = await request(app)
        .get(`/api/v1/loans/${loan.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: loan.id,
        bookId: testBook.id,
        borrowerId: testUser.id,
      });
    });

    it('should return 404 for non-existent loan', async () => {
      await request(app)
        .get('/api/v1/loans/non-existent-id')
        .expect(404);
    });
  });

  describe('POST /api/v1/loans', () => {
    it('should create a new loan', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const loanData = {
        bookId: testBook.id,
        borrowerId: testUser.id,
        dueAt: dueDate.toISOString(),
      };

      const response = await request(app)
        .post('/api/v1/loans')
        .send(loanData)
        .expect(201);

      expect(response.body).toMatchObject({
        bookId: testBook.id,
        borrowerId: testUser.id,
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('lentAt');

      // Verify loan was created in database
      const createdLoan = await prisma.loan.findUnique({
        where: { id: response.body.id },
      });
      expect(createdLoan).toBeTruthy();

      // Verify book status was updated to LENT
      const updatedBook = await prisma.book.findUnique({
        where: { id: testBook.id },
      });
      expect(updatedBook?.status).toBe('LENT');
    });

    it('should return 400 for invalid loan data', async () => {
      const invalidLoanData = {
        bookId: 'invalid-book-id',
        borrowerId: testUser.id,
        dueAt: new Date().toISOString(),
      };

      await request(app)
        .post('/api/v1/loans')
        .send(invalidLoanData)
        .expect(400);
    });

    it('should return 400 when trying to loan an already lent book', async () => {
      // First, create a loan
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      await prisma.loan.create({
        data: {
          bookId: testBook.id,
          borrowerId: testUser.id,
          dueAt: dueDate,
        },
      });

      // Update book status to LENT
      await prisma.book.update({
        where: { id: testBook.id },
        data: { status: 'LENT' },
      });

      // Try to create another loan for the same book
      const loanData = {
        bookId: testBook.id,
        borrowerId: testUser.id,
        dueAt: dueDate.toISOString(),
      };

      await request(app)
        .post('/api/v1/loans')
        .send(loanData)
        .expect(400);
    });
  });

  describe('PATCH /api/v1/loans/:id/return', () => {
    it('should return a book', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const loan = await prisma.loan.create({
        data: {
          bookId: testBook.id,
          borrowerId: testUser.id,
          dueAt: dueDate,
        },
      });

      // Update book status to LENT
      await prisma.book.update({
        where: { id: testBook.id },
        data: { status: 'LENT' },
      });

      const response = await request(app)
        .patch(`/api/v1/loans/${loan.id}/return`)
        .expect(200);

      expect(response.body).toHaveProperty('returnedAt');
      expect(new Date(response.body.returnedAt)).toBeInstanceOf(Date);

      // Verify loan was updated in database
      const updatedLoan = await prisma.loan.findUnique({
        where: { id: loan.id },
      });
      expect(updatedLoan?.returnedAt).toBeTruthy();

      // Verify book status was updated back to AVAILABLE
      const updatedBook = await prisma.book.findUnique({
        where: { id: testBook.id },
      });
      expect(updatedBook?.status).toBe('AVAILABLE');
    });

    it('should return 404 for non-existent loan', async () => {
      await request(app)
        .patch('/api/v1/loans/non-existent-id/return')
        .expect(404);
    });

    it('should return 400 when trying to return an already returned book', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const loan = await prisma.loan.create({
        data: {
          bookId: testBook.id,
          borrowerId: testUser.id,
          dueAt: dueDate,
          returnedAt: new Date(), // Already returned
        },
      });

      await request(app)
        .patch(`/api/v1/loans/${loan.id}/return`)
        .expect(400);
    });
  });

  describe('GET /api/v1/loans/overdue', () => {
    it('should return overdue loans', async () => {
      const pastDueDate = new Date();
      pastDueDate.setDate(pastDueDate.getDate() - 7); // 1 week ago

      const futureDueDate = new Date();
      futureDueDate.setDate(futureDueDate.getDate() + 7); // 1 week from now

      const anotherBook = await prisma.book.create({
        data: {
          title: 'Another Book',
          author: 'Another Author',
          isbn13: '1234567890124',
        },
      });

      // Create overdue loan
      const overdueLoan = await prisma.loan.create({
        data: {
          bookId: testBook.id,
          borrowerId: testUser.id,
          dueAt: pastDueDate,
        },
      });

      // Create non-overdue loan
      await prisma.loan.create({
        data: {
          bookId: anotherBook.id,
          borrowerId: testUser.id,
          dueAt: futureDueDate,
        },
      });

      const response = await request(app)
        .get('/api/v1/loans/overdue')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(overdueLoan.id);
    });

    it('should return empty array when no overdue loans exist', async () => {
      const futureDueDate = new Date();
      futureDueDate.setDate(futureDueDate.getDate() + 7);

      await prisma.loan.create({
        data: {
          bookId: testBook.id,
          borrowerId: testUser.id,
          dueAt: futureDueDate,
        },
      });

      const response = await request(app)
        .get('/api/v1/loans/overdue')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('DELETE /api/v1/loans/:id', () => {
    it('should delete a loan', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const loan = await prisma.loan.create({
        data: {
          bookId: testBook.id,
          borrowerId: testUser.id,
          dueAt: dueDate,
        },
      });

      await request(app)
        .delete(`/api/v1/loans/${loan.id}`)
        .expect(204);

      // Verify loan was deleted
      const deletedLoan = await prisma.loan.findUnique({
        where: { id: loan.id },
      });
      expect(deletedLoan).toBeNull();
    });

    it('should return 404 for non-existent loan', async () => {
      await request(app)
        .delete('/api/v1/loans/non-existent-id')
        .expect(404);
    });
  });
});
