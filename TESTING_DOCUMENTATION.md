# Library System Testing Documentation

## Overview

This document outlines the comprehensive testing strategy for the Library System, covering both the API backend and web frontend components. The testing approach includes unit tests, integration tests, and end-to-end tests to ensure system reliability and functionality.

## Testing Philosophy

### Testing Pyramid

```
    /\
   /  \
  / E2E \
 /______\
/        \
/Integration\
/____________\
/            \
/  Unit Tests  \
/________________\
```

1. **Unit Tests (70%)**: Fast, isolated tests for individual functions and components
2. **Integration Tests (20%)**: Tests for API endpoints and component interactions
3. **End-to-End Tests (10%)**: Full user workflow tests

### Testing Principles

- **Test-Driven Development (TDD)**: Write tests before implementation
- **Behavior-Driven Development (BDD)**: Focus on user behavior and requirements
- **Continuous Testing**: Automated tests run on every commit
- **Test Coverage**: Aim for 80%+ code coverage
- **Fast Feedback**: Tests should run quickly and provide clear feedback

## API Testing (Backend)

### Unit Tests

#### Test Structure

```
api/test/
├── services/
│   ├── book.service.test.ts
│   ├── user.service.test.ts
│   ├── loan.service.test.ts
│   └── googleBooks.service.test.ts
├── integration/
│   ├── books.integration.test.ts
│   ├── users.integration.test.ts
│   └── loans.integration.test.ts
├── setup.ts
└── tsconfig.json
```

#### Service Layer Testing

**Example: Book Service Tests**

```typescript
// api/test/services/book.service.test.ts
import { BookService } from '../../src/services/book.service';
import { prisma } from '../../src/lib/prisma';

jest.mock('../../src/lib/prisma');
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('BookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return all books when no query provided', async () => {
      const mockBooks = [
        { id: '1', title: 'Test Book', author: 'Test Author' },
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
        { id: '1', title: 'JavaScript Guide', author: 'John Doe' },
      ];
      mockPrisma.book.findMany.mockResolvedValue(mockBooks as any);

      const result = await BookService.list('JavaScript');

      expect(mockPrisma.book.findMany).toHaveBeenCalledWith({
        where: { title: { contains: 'JavaScript' } },
      });
      expect(result).toEqual(mockBooks);
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
});
```

#### External Service Testing

**Example: Google Books Service Tests**

```typescript
// api/test/services/googleBooks.service.test.ts
import { GoogleBooksService } from '../../src/services/googleBooks.service';

global.fetch = jest.fn();

describe('GoogleBooksService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchByIsbn', () => {
    it('should return book data for valid ISBN', async () => {
      const mockResponse = {
        totalItems: 1,
        items: [{
          volumeInfo: {
            title: 'Clean Code',
            authors: ['Robert C. Martin'],
            publisher: 'Prentice Hall',
          }
        }]
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await GoogleBooksService.fetchByIsbn('9780134685991');

      expect(fetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes?q=isbn:9780134685991'
      );
      expect(result?.title).toBe('Clean Code');
    });

    it('should handle network errors gracefully', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await GoogleBooksService.fetchByIsbn('9780134685991');

      expect(result).toBeNull();
    });
  });
});
```

### Integration Tests

#### API Endpoint Testing

**Example: Books API Integration Tests**

```typescript
// api/test/integration/books.integration.test.ts
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';

describe('Books API Integration Tests', () => {
  beforeAll(async () => {
    await prisma.loan.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.loan.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
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
      const book = await prisma.book.create({
        data: {
          title: 'Test Book',
          author: 'Test Author',
          isbn13: '1234567890123',
        },
      });

      const response = await request(app)
        .get('/api/v1/books')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        id: book.id,
        title: 'Test Book',
        author: 'Test Author',
      });
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
});
```

### Test Configuration

#### Jest Configuration

```javascript
// api/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### Test Setup

```typescript
// api/test/setup.ts
import { jest } from '@jest/globals';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'file:./test.db';
});

global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
jest.setTimeout(30000);
```

### Running API Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm test -- --testPathPattern="services"

# Run only integration tests
npm test -- --testPathPattern="integration"

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- book.service.test.ts
```

## Web Testing (Frontend)

### Unit Tests

#### Component Testing

**Example: Vue Component Tests**

```typescript
// web/tests/unit/components/BookCard.test.ts
import { mount } from '@vue/test-utils';
import BookCard from '@/components/BookCard.vue';

describe('BookCard.vue', () => {
  const mockBook = {
    id: '1',
    title: 'Test Book',
    author: 'Test Author',
    status: 'AVAILABLE',
    thumbnail: 'http://example.com/image.jpg'
  };

  it('renders book information correctly', () => {
    const wrapper = mount(BookCard, {
      props: { book: mockBook }
    });

    expect(wrapper.find('.book-title').text()).toBe('Test Book');
    expect(wrapper.find('.book-author').text()).toBe('Test Author');
    expect(wrapper.find('.book-status').text()).toBe('AVAILABLE');
  });

  it('emits book-selected event when clicked', async () => {
    const wrapper = mount(BookCard, {
      props: { book: mockBook }
    });

    await wrapper.find('.book-card').trigger('click');

    expect(wrapper.emitted('book-selected')).toBeTruthy();
    expect(wrapper.emitted('book-selected')?.[0]).toEqual([mockBook]);
  });

  it('displays placeholder image when thumbnail is not available', () => {
    const bookWithoutThumbnail = { ...mockBook, thumbnail: undefined };
    const wrapper = mount(BookCard, {
      props: { book: bookWithoutThumbnail }
    });

    expect(wrapper.find('.book-image').attributes('src')).toBe('/placeholder.jpg');
  });
});
```

#### Store Testing

**Example: Pinia Store Tests**

```typescript
// web/tests/unit/stores/book.test.ts
import { setActivePinia, createPinia } from 'pinia';
import { useBookStore } from '@/stores/book';
import { api } from '@/lib/api';

jest.mock('@/lib/api');
const mockApi = api as jest.Mocked<typeof api>;

describe('Book Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
  });

  it('fetches books successfully', async () => {
    const mockBooks = [
      { id: '1', title: 'Book 1', author: 'Author 1' },
      { id: '2', title: 'Book 2', author: 'Author 2' },
    ];
    mockApi.get.mockResolvedValue(mockBooks);

    const store = useBookStore();
    await store.fetchBooks();

    expect(mockApi.get).toHaveBeenCalledWith('/books');
    expect(store.books).toEqual(mockBooks);
    expect(store.loading).toBe(false);
  });

  it('handles fetch books error', async () => {
    const errorMessage = 'Failed to fetch books';
    mockApi.get.mockRejectedValue(new Error(errorMessage));

    const store = useBookStore();
    await store.fetchBooks();

    expect(store.books).toEqual([]);
    expect(store.error).toBe(errorMessage);
    expect(store.loading).toBe(false);
  });

  it('creates a new book', async () => {
    const newBook = { title: 'New Book', author: 'New Author' };
    const createdBook = { id: '3', ...newBook };
    mockApi.post.mockResolvedValue(createdBook);

    const store = useBookStore();
    const result = await store.createBook(newBook);

    expect(mockApi.post).toHaveBeenCalledWith('/books', newBook);
    expect(result).toEqual(createdBook);
    expect(store.books).toContain(createdBook);
  });
});
```

### Integration Tests

#### Page Component Tests

```typescript
// web/tests/integration/pages/BooksPage.test.ts
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { setActivePinia, createPinia } from 'pinia';
import BooksPage from '@/pages/BooksPage.vue';
import { useBookStore } from '@/stores/book';

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/books', component: BooksPage }]
});

describe('BooksPage.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('displays books when loaded', async () => {
    const store = useBookStore();
    store.books = [
      { id: '1', title: 'Book 1', author: 'Author 1', status: 'AVAILABLE' },
      { id: '2', title: 'Book 2', author: 'Author 2', status: 'LENT' },
    ];

    const wrapper = mount(BooksPage, {
      global: {
        plugins: [router]
      }
    });

    expect(wrapper.findAll('.book-card')).toHaveLength(2);
    expect(wrapper.text()).toContain('Book 1');
    expect(wrapper.text()).toContain('Book 2');
  });

  it('filters books by search query', async () => {
    const store = useBookStore();
    store.books = [
      { id: '1', title: 'JavaScript Guide', author: 'John Doe', status: 'AVAILABLE' },
      { id: '2', title: 'Python Handbook', author: 'Jane Smith', status: 'AVAILABLE' },
    ];

    const wrapper = mount(BooksPage, {
      global: {
        plugins: [router]
      }
    });

    const searchInput = wrapper.find('input[type="search"]');
    await searchInput.setValue('JavaScript');
    await searchInput.trigger('input');

    expect(wrapper.findAll('.book-card')).toHaveLength(1);
    expect(wrapper.text()).toContain('JavaScript Guide');
    expect(wrapper.text()).not.toContain('Python Handbook');
  });
});
```

### End-to-End Tests

#### Cypress Configuration

```typescript
// web/cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshot: false,
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
  },
});
```

#### E2E Test Examples

```typescript
// web/cypress/e2e/book-management.cy.ts
describe('Book Management', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.intercept('GET', '/api/v1/books', { fixture: 'books.json' }).as('getBooks');
  });

  it('should display books list', () => {
    cy.get('[data-cy=books-link]').click();
    cy.wait('@getBooks');
    
    cy.url().should('include', '/books');
    cy.get('[data-cy=book-card]').should('have.length.greaterThan', 0);
    cy.get('[data-cy=book-title]').first().should('be.visible');
  });

  it('should search for books', () => {
    cy.visit('/books');
    cy.wait('@getBooks');

    cy.get('[data-cy=search-input]').type('JavaScript');
    cy.get('[data-cy=book-card]').should('contain.text', 'JavaScript');
  });

  it('should add a new book', () => {
    cy.intercept('POST', '/api/v1/books', {
      statusCode: 201,
      body: { id: '123', title: 'New Book', author: 'New Author' }
    }).as('createBook');

    cy.visit('/books/new');
    
    cy.get('[data-cy=title-input]').type('New Book');
    cy.get('[data-cy=author-input]').type('New Author');
    cy.get('[data-cy=submit-button]').click();

    cy.wait('@createBook');
    cy.url().should('include', '/books');
    cy.get('[data-cy=success-message]').should('be.visible');
  });

  it('should view book details', () => {
    cy.intercept('GET', '/api/v1/books/1', { fixture: 'book-detail.json' }).as('getBook');

    cy.visit('/books');
    cy.wait('@getBooks');
    
    cy.get('[data-cy=book-card]').first().click();
    cy.wait('@getBook');

    cy.url().should('match', /\/books\/\d+$/);
    cy.get('[data-cy=book-title]').should('be.visible');
    cy.get('[data-cy=book-author]').should('be.visible');
    cy.get('[data-cy=book-description]').should('be.visible');
  });
});
```

#### Test Fixtures

```json
// web/cypress/fixtures/books.json
[
  {
    "id": "1",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "status": "AVAILABLE",
    "thumbnail": "http://example.com/clean-code.jpg"
  },
  {
    "id": "2",
    "title": "JavaScript: The Good Parts",
    "author": "Douglas Crockford",
    "status": "LENT",
    "thumbnail": "http://example.com/js-good-parts.jpg"
  }
]
```

### Test Configuration

#### Vitest Configuration

```typescript
// web/vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

#### Test Setup

```typescript
// web/tests/setup.ts
import { config } from '@vue/test-utils';
import { createPinia } from 'pinia';

// Global test configuration
config.global.plugins = [createPinia()];

// Mock API
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useRoute: () => ({
    params: {},
    query: {},
  }),
}));
```

### Running Web Tests

```bash
# Run unit tests
npm run test:unit

# Run unit tests with coverage
npm run test:unit -- --coverage

# Run unit tests in watch mode
npm run test:unit -- --watch

# Run E2E tests
npm run test:e2e

# Run E2E tests in headless mode
npm run test:e2e:headless

# Run component tests
npm run test:component
```

## Test Data Management

### Database Seeding for Tests

```typescript
// api/test/helpers/seed.ts
import { prisma } from '../../src/lib/prisma';

export const seedTestData = async () => {
  // Create test users
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
      name: 'Test Admin',
      email: 'admin@example.com',
      role: 'ADMIN',
      tier: 'TIER_1',
    },
  });

  // Create test books
  const book1 = await prisma.book.create({
    data: {
      title: 'Test Book 1',
      author: 'Test Author 1',
      isbn13: '9781234567890',
      status: 'AVAILABLE',
    },
  });

  const book2 = await prisma.book.create({
    data: {
      title: 'Test Book 2',
      author: 'Test Author 2',
      isbn13: '9781234567891',
      status: 'LENT',
      ownerId: user1.id,
    },
  });

  // Create test loans
  const loan1 = await prisma.loan.create({
    data: {
      bookId: book2.id,
      borrowerId: user1.id,
      dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
  });

  return { users: [user1, user2], books: [book1, book2], loans: [loan1] };
};

export const cleanupTestData = async () => {
  await prisma.loan.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();
};
```

### Test Factories

```typescript
// api/test/factories/book.factory.ts
import { faker } from '@faker-js/faker';

export const createBookData = (overrides = {}) => ({
  title: faker.lorem.words(3),
  author: faker.person.fullName(),
  publisher: faker.company.name(),
  isbn13: faker.string.numeric(13),
  description: faker.lorem.paragraph(),
  status: 'AVAILABLE' as const,
  ...overrides,
});

export const createUserData = (overrides = {}) => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  role: 'USER' as const,
  tier: 'TIER_4' as const,
  ...overrides,
});

export const createLoanData = (bookId: string, borrowerId: string, overrides = {}) => ({
  bookId,
  borrowerId,
  dueAt: faker.date.future(),
  ...overrides,
});
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: api/package-lock.json
      
      - name: Install API dependencies
        working-directory: ./api
        run: npm ci
      
      - name: Run API tests
        working-directory: ./api
        run: npm test -- --coverage
      
      - name: Upload API coverage
        uses: codecov/codecov-action@v3
        with:
          directory: ./api/coverage

  web-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json
      
      - name: Install web dependencies
        working-directory: ./web
        run: npm ci
      
      - name: Run unit tests
        working-directory: ./web
        run: npm run test:unit -- --coverage
      
      - name: Run E2E tests
        working-directory: ./web
        run: npm run test:e2e:headless
      
      - name: Upload web coverage
        uses: codecov/codecov-action@v3
        with:
          directory: ./web/coverage

  integration-tests:
    runs-on: ubuntu-latest
    needs: [api-tests, web-tests]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Start API server
        working-directory: ./api
        run: |
          npm ci
          npm run build
          npm start &
          sleep 10
      
      - name: Run integration tests
        working-directory: ./web
        run: |
          npm ci
          npm run test:e2e:ci
```

## Test Coverage and Quality

### Coverage Requirements

- **Unit Tests**: 90%+ coverage for services and utilities
- **Integration Tests**: 80%+ coverage for API endpoints
- **E2E Tests**: Cover critical user journeys

### Quality Metrics

```typescript
// jest.config.js coverage thresholds
coverageThreshold: {
  global: {
    branches: 80,
    functions: 85,
    lines: 85,
    statements: 85
  },
  './src/services/': {
    branches: 90,
    functions: 95,
    lines: 95,
    statements: 95
  }
}
```

### Test Quality Checklist

- [ ] Tests are independent and can run in any order
- [ ] Tests have descriptive names that explain what they test
- [ ] Tests follow the AAA pattern (Arrange, Act, Assert)
- [ ] Mocks are used appropriately and reset between tests
- [ ] Edge cases and error conditions are tested
- [ ] Tests are fast and don't rely on external services
- [ ] Integration tests use real database transactions
- [ ] E2E tests cover complete user workflows

## Best Practices

### Writing Good Tests

1. **Test Behavior, Not Implementation**
   ```typescript
   // Good: Tests the behavior
   it('should display error message when login fails', async () => {
     await loginWithInvalidCredentials();
     expect(screen.getByText('Invalid credentials')).toBeVisible();
   });

   // Bad: Tests implementation details
   it('should call setError with correct message', async () => {
     expect(setError).toHaveBeenCalledWith('Invalid credentials');
   });
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('should return 404 when book does not exist')
   it('should prevent loan creation when book is already lent')

   // Bad
   it('should work')
   it('test book creation')
   ```

3. **Keep Tests Simple and Focused**
   ```typescript
   // Good: One assertion per test
   it('should create book with valid data', async () => {
     const book = await createBook(validBookData);
     expect(book.id).toBeDefined();
   });

   it('should set book status to AVAILABLE by default', async () => {
     const book = await createBook(validBookData);
     expect(book.status).toBe('AVAILABLE');
   });

   // Bad: Multiple unrelated assertions
   it('should create book', async () => {
     const book = await createBook(validBookData);
     expect(book.id).toBeDefined();
     expect(book.status).toBe('AVAILABLE');
     expect(book.createdAt).toBeInstanceOf(Date);
   });
   ```

### Test Organization

1. **Group Related Tests**
   ```typescript
   describe('BookService', () => {
     describe('create', () => {
       it('should create book with valid data');
       it('should throw error with invalid data');
     });

     describe('update', () => {
       it('should update existing book');
       it('should throw error for non-existent book');
     });
   });
   ```

2. **Use Setup and Teardown Appropriately**
   ```typescript
   describe('Database operations', () => {
     beforeEach(async () => {
       await seedTestData();
     });

     afterEach(async () => {
       await cleanupTestData();
     });
   });
   ```

### Performance Considerations

1. **Parallel Test Execution**
   ```bash
   # Run tests in parallel
   npm test -- --maxWorkers=4
   ```

2. **Test Isolation**
   ```typescript
   // Use separate test databases
   const testDb = `test_${process.env.JEST_WORKER_ID || 0}.db`;
   ```

3. **Mock External Dependencies**
   ```typescript
   // Mock slow external services
   jest.mock('@/services/external-api');
   ```

## Debugging Tests

### Common Issues and Solutions

1. **Async Test Issues**
   ```typescript
   // Use async/await properly
   it('should handle async operations', async () => {
     const result = await asyncOperation();
     expect(result).toBeDefined();
   });
   ```

2. **Mock Issues**
   ```typescript
   // Clear mocks between tests
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

3. **Database State Issues**
   ```typescript
   // Ensure clean state
   beforeEach(async () => {
     await cleanupTestData();
     await seedTestData();
   });
   ```

### Debug Commands

```bash
# Run tests with debug output
npm test -- --verbose

# Run specific test file
npm test -- book.service.test.ts

# Run tests in watch mode
npm test -- --watch

# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Conclusion

This comprehensive testing strategy ensures the Library System maintains high quality and reliability through:

- **Comprehensive Coverage**: Unit, integration, and E2E tests
- **Automated Testing**: CI/CD pipeline with automated test execution
- **Quality Assurance**: Coverage thresholds and quality metrics
