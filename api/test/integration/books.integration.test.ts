import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';

describe('Books API Integration Tests', () => {
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
  });

  describe('GET /api/v1/books', () => {
    it('should return empty array when no books exist', async () => {
      const response = await request(app)
        .get('/api/v1/books')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all books', async () => {
      // Create test books
      const book1 = await prisma.book.create({
        data: {
          title: 'Test Book 1',
          author: 'Test Author 1',
          isbn13: '1234567890123',
        },
      });

      const book2 = await prisma.book.create({
        data: {
          title: 'Test Book 2',
          author: 'Test Author 2',
          isbn13: '1234567890124',
        },
      });

      const response = await request(app)
        .get('/api/v1/books')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: book1.id,
        title: 'Test Book 1',
        author: 'Test Author 1',
      });
      expect(response.body[1]).toMatchObject({
        id: book2.id,
        title: 'Test Book 2',
        author: 'Test Author 2',
      });
    });

    it('should filter books by title query', async () => {
      await prisma.book.create({
        data: {
          title: 'JavaScript Guide',
          author: 'John Doe',
          isbn13: '1234567890125',
        },
      });

      await prisma.book.create({
        data: {
          title: 'Python Handbook',
          author: 'Jane Smith',
          isbn13: '1234567890126',
        },
      });

      const response = await request(app)
        .get('/api/v1/books?q=JavaScript')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('JavaScript Guide');
    });
  });

  describe('GET /api/v1/books/:id', () => {
    it('should return a specific book', async () => {
      const book = await prisma.book.create({
        data: {
          title: 'Specific Book',
          author: 'Specific Author',
          isbn13: '1234567890127',
        },
      });

      const response = await request(app)
        .get(`/api/v1/books/${book.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: book.id,
        title: 'Specific Book',
        author: 'Specific Author',
      });
    });

    it('should return 404 for non-existent book', async () => {
      const response = await request(app)
        .get('/api/v1/books/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/v1/books', () => {
    it('should create a new book', async () => {
      const bookData = {
        title: 'New Book',
        author: 'New Author',
        isbn13: '1234567890128',
        description: 'A new book description',
      };

      const response = await request(app)
        .post('/api/v1/books')
        .send(bookData)
        .expect(201);

      expect(response.body).toMatchObject(bookData);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');

      // Verify book was created in database
      const createdBook = await prisma.book.findUnique({
        where: { id: response.body.id },
      });
      expect(createdBook).toBeTruthy();
    });

    it('should return 400 for invalid book data', async () => {
      const invalidBookData = {
        title: '', // Empty title should be invalid
        author: 'Author',
      };

      await request(app)
        .post('/api/v1/books')
        .send(invalidBookData)
        .expect(400);
    });
  });

  describe('PATCH /api/v1/books/:id', () => {
    it('should update a book', async () => {
      const book = await prisma.book.create({
        data: {
          title: 'Original Title',
          author: 'Original Author',
          isbn13: '1234567890129',
        },
      });

      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const response = await request(app)
        .patch(`/api/v1/books/${book.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
      expect(response.body.description).toBe('Updated description');
      expect(response.body.author).toBe('Original Author'); // Should remain unchanged

      // Verify update in database
      const updatedBook = await prisma.book.findUnique({
        where: { id: book.id },
      });
      expect(updatedBook?.title).toBe('Updated Title');
    });

    it('should return 404 for non-existent book', async () => {
      await request(app)
        .patch('/api/v1/books/non-existent-id')
        .send({ title: 'Updated Title' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/books/:id', () => {
    it('should delete a book', async () => {
      const book = await prisma.book.create({
        data: {
          title: 'Book to Delete',
          author: 'Author',
          isbn13: '1234567890130',
        },
      });

      await request(app)
        .delete(`/api/v1/books/${book.id}`)
        .expect(204);

      // Verify book was deleted
      const deletedBook = await prisma.book.findUnique({
        where: { id: book.id },
      });
      expect(deletedBook).toBeNull();
    });

    it('should return 404 for non-existent book', async () => {
      await request(app)
        .delete('/api/v1/books/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /api/v1/books/:id/status', () => {
    it('should update book status', async () => {
      const book = await prisma.book.create({
        data: {
          title: 'Status Test Book',
          author: 'Author',
          isbn13: '1234567890131',
          status: 'AVAILABLE',
        },
      });

      const response = await request(app)
        .patch(`/api/v1/books/${book.id}/status`)
        .send({ status: 'LENT' })
        .expect(200);

      expect(response.body.status).toBe('LENT');

      // Verify status update in database
      const updatedBook = await prisma.book.findUnique({
        where: { id: book.id },
      });
      expect(updatedBook?.status).toBe('LENT');
    });

    it('should return 400 for invalid status', async () => {
      const book = await prisma.book.create({
        data: {
          title: 'Status Test Book',
          author: 'Author',
          isbn13: '1234567890132',
        },
      });

      await request(app)
        .patch(`/api/v1/books/${book.id}/status`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });
  });

  describe('GET /api/v1/books/isbn/:isbn/info', () => {
    beforeEach(() => {
      // Mock fetch for Google Books API
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return book info from external API', async () => {
      const isbn = '9780134685991';
      const mockGoogleBooksResponse = {
        totalItems: 1,
        items: [{
          volumeInfo: {
            title: 'Clean Code',
            authors: ['Robert C. Martin'],
            publisher: 'Prentice Hall',
            publishedDate: '2008-08-01',
            description: 'A handbook of agile software craftsmanship',
            imageLinks: {
              thumbnail: 'http://example.com/thumbnail.jpg',
            },
            industryIdentifiers: [
              {
                type: 'ISBN_13',
                identifier: '9780134685991',
              },
              {
                type: 'ISBN_10',
                identifier: '0134685997',
              },
            ],
          },
        }],
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockGoogleBooksResponse,
      } as Response);

      const response = await request(app)
        .get(`/api/v1/books/isbn/${isbn}/info`)
        .expect(200);

      expect(response.body).toHaveProperty('title', 'Clean Code');
      expect(response.body).toHaveProperty('author', 'Robert C. Martin');
      expect(response.body).toHaveProperty('publisher', 'Prentice Hall');
    });

    it('should return 404 for invalid ISBN', async () => {
      const invalidIsbn = '0000000000000';

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalItems: 0, items: [] }),
      } as Response);

      await request(app)
        .get(`/api/v1/books/isbn/${invalidIsbn}/info`)
        .expect(404);
    });
  });
});
