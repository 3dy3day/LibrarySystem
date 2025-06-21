import { GoogleBooksService } from '../../src/services/googleBooks.service';

// Mock fetch globally
global.fetch = jest.fn();

describe('GoogleBooksService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchByIsbn', () => {
    it('should return book data for valid ISBN', async () => {
      const mockResponse = {
        totalItems: 1,
        items: [
          {
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
          },
        ],
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await GoogleBooksService.fetchByIsbn('9780134685991');

      expect(fetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes?q=isbn:9780134685991'
      );
      expect(result).toEqual({
        title: 'Clean Code',
        author: 'Robert C. Martin',
        publisher: 'Prentice Hall',
        publishedAt: new Date('2008-08-01'),
        description: 'A handbook of agile software craftsmanship',
        thumbnail: 'http://example.com/thumbnail.jpg',
        isbn10: '0134685997',
        isbn13: '9780134685991',
      });
    });

    it('should return null for ISBN with no results', async () => {
      const mockResponse = {
        totalItems: 0,
        items: [],
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await GoogleBooksService.fetchByIsbn('0000000000000');

      expect(result).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await GoogleBooksService.fetchByIsbn('9780134685991');

      expect(result).toBeNull();
    });

    it('should handle partial book data', async () => {
      const mockResponse = {
        totalItems: 1,
        items: [
          {
            volumeInfo: {
              title: 'Partial Book Data',
              // Missing authors, publisher, etc.
            },
          },
        ],
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await GoogleBooksService.fetchByIsbn('9780134685991');

      expect(result).toEqual({
        title: 'Partial Book Data',
        author: 'Unknown',
        publisher: undefined,
        publishedAt: undefined,
        description: undefined,
        thumbnail: undefined,
        isbn10: undefined,
        isbn13: '9780134685991',
      });
    });

    it('should extract ISBN identifiers correctly', async () => {
      const mockResponse = {
        totalItems: 1,
        items: [
          {
            volumeInfo: {
              title: 'Test Book',
              authors: ['Test Author'],
              industryIdentifiers: [
                {
                  type: 'ISBN_10',
                  identifier: '1234567890',
                },
                {
                  type: 'ISBN_13',
                  identifier: '9781234567890',
                },
                {
                  type: 'OTHER',
                  identifier: 'other-identifier',
                },
              ],
            },
          },
        ],
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await GoogleBooksService.fetchByIsbn('9781234567890');

      expect(result?.isbn10).toBe('1234567890');
      expect(result?.isbn13).toBe('9781234567890');
    });

    it('should handle empty authors array', async () => {
      const mockResponse = {
        totalItems: 1,
        items: [
          {
            volumeInfo: {
              title: 'Book without Authors',
              authors: [],
            },
          },
        ],
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await GoogleBooksService.fetchByIsbn('9780134685991');

      expect(result?.author).toBe(''); // Empty array joins to empty string
    });

    it('should join multiple authors correctly', async () => {
      const mockResponse = {
        totalItems: 1,
        items: [
          {
            volumeInfo: {
              title: 'Multi-Author Book',
              authors: ['Author One', 'Author Two', 'Author Three'],
            },
          },
        ],
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await GoogleBooksService.fetchByIsbn('9780134685991');

      expect(result?.author).toBe('Author One, Author Two, Author Three');
    });

    it('should handle missing items array', async () => {
      const mockResponse = {
        totalItems: 0,
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await GoogleBooksService.fetchByIsbn('9780134685991');

      expect(result).toBeNull();
    });

    it('should use fallback ISBN when no ISBN_13 found', async () => {
      const mockResponse = {
        totalItems: 1,
        items: [
          {
            volumeInfo: {
              title: 'Test Book',
              authors: ['Test Author'],
              industryIdentifiers: [
                {
                  type: 'ISBN_10',
                  identifier: '1234567890',
                },
              ],
            },
          },
        ],
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await GoogleBooksService.fetchByIsbn('9781234567890');

      expect(result?.isbn13).toBe('9781234567890'); // Should use the input ISBN as fallback
    });
  });
});
