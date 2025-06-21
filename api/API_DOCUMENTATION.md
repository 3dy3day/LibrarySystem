# Library System API Documentation

## Overview

The Library System API is a RESTful API built with Express.js, TypeScript, and Prisma ORM. It provides endpoints for managing books, users, and loans in a library management system.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Currently, the API does not implement authentication. All endpoints are publicly accessible.

## Data Models

### Book

```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  publishedAt?: Date;
  isbn10?: string;
  isbn13?: string;
  status: 'AVAILABLE' | 'LENT' | 'LOST';
  comment?: string;
  description?: string;
  thumbnail?: string;
  ownerId?: string;
  createdAt: Date;
}
```

### User

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4';
  createdAt: Date;
}
```

### Loan

```typescript
interface Loan {
  id: string;
  bookId: string;
  borrowerId: string;
  lentAt: Date;
  dueAt: Date;
  returnedAt?: Date;
}
```

## API Endpoints

### Books

#### GET /books

Retrieve all books with optional filtering.

**Query Parameters:**
- `q` (string, optional): Search query for book title
- `status` (string, optional): Filter by book status (`AVAILABLE`, `LENT`, `LOST`)
- `author` (string, optional): Filter by author name
- `ownerId` (string, optional): Filter by owner ID

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "publisher": "Prentice Hall",
    "publishedAt": "2008-08-01T00:00:00.000Z",
    "isbn10": "0134685997",
    "isbn13": "9780134685991",
    "status": "AVAILABLE",
    "comment": null,
    "description": "A handbook of agile software craftsmanship",
    "thumbnail": "http://example.com/thumbnail.jpg",
    "ownerId": null,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### GET /books/:id

Retrieve a specific book by ID.

**Parameters:**
- `id` (string): Book ID

**Response:**
```json
{
  "id": "uuid",
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "status": "AVAILABLE",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: Book not found

#### POST /books

Create a new book.

**Request Body:**
```json
{
  "title": "New Book",
  "author": "Author Name",
  "publisher": "Publisher Name",
  "isbn13": "9781234567890",
  "description": "Book description"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "New Book",
  "author": "Author Name",
  "publisher": "Publisher Name",
  "isbn13": "9781234567890",
  "status": "AVAILABLE",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data

#### PATCH /books/:id

Update an existing book.

**Parameters:**
- `id` (string): Book ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "author": "Author Name",
  "description": "Updated description",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: Book not found
- `400 Bad Request`: Invalid request data

#### DELETE /books/:id

Delete a book.

**Parameters:**
- `id` (string): Book ID

**Response:**
- `204 No Content`: Book deleted successfully

**Error Responses:**
- `404 Not Found`: Book not found

#### PATCH /books/:id/status

Update book status.

**Parameters:**
- `id` (string): Book ID

**Request Body:**
```json
{
  "status": "LENT"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Book Title",
  "status": "LENT",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### GET /books/isbn/:isbn/info

Get book information from external API (Google Books) by ISBN.

**Parameters:**
- `isbn` (string): ISBN-10 or ISBN-13

**Response:**
```json
{
  "title": "Clean Code",
  "authors": ["Robert C. Martin"],
  "publisher": "Prentice Hall",
  "publishedDate": "2008-08-01",
  "description": "A handbook of agile software craftsmanship",
  "thumbnail": "http://example.com/thumbnail.jpg",
  "isbn10": "0134685997",
  "isbn13": "9780134685991"
}
```

**Error Responses:**
- `404 Not Found`: Book not found in external API

#### GET /books/isbn/:isbn

Find or create a book by ISBN using external API data.

**Parameters:**
- `isbn` (string): ISBN-10 or ISBN-13

**Response:**
```json
{
  "id": "uuid",
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn13": "9780134685991",
  "status": "AVAILABLE",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### Users

#### GET /users

Retrieve all users with optional filtering.

**Query Parameters:**
- `q` (string, optional): Search query for user name
- `role` (string, optional): Filter by user role (`USER`, `ADMIN`)
- `tier` (string, optional): Filter by user tier (`TIER_1`, `TIER_2`, `TIER_3`, `TIER_4`)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "tier": "TIER_4",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### GET /users/:id

Retrieve a specific user by ID.

**Parameters:**
- `id` (string): User ID

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "tier": "TIER_4",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

#### POST /users

Create a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "tier": "TIER_2"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "tier": "TIER_2",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

#### PATCH /users/:id

Update an existing user.

**Parameters:**
- `id` (string): User ID

**Request Body:**
```json
{
  "name": "Updated Name",
  "tier": "TIER_1"
}
```

#### DELETE /users/:id

Delete a user.

**Parameters:**
- `id` (string): User ID

**Response:**
- `204 No Content`: User deleted successfully

**Error Responses:**
- `404 Not Found`: User not found
- `400 Bad Request`: User has active loans

#### GET /users/:id/loans

Get all loans for a specific user.

**Parameters:**
- `id` (string): User ID

**Response:**
```json
[
  {
    "id": "uuid",
    "bookId": "book-uuid",
    "borrowerId": "user-uuid",
    "lentAt": "2023-01-01T00:00:00.000Z",
    "dueAt": "2023-01-15T00:00:00.000Z",
    "returnedAt": null
  }
]
```

#### GET /users/:id/books

Get all books owned by a specific user.

**Parameters:**
- `id` (string): User ID

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Owned Book",
    "author": "Author Name",
    "ownerId": "user-uuid",
    "status": "AVAILABLE"
  }
]
```

### Loans

#### GET /loans

Retrieve all loans with optional filtering.

**Query Parameters:**
- `borrowerId` (string, optional): Filter by borrower ID
- `bookId` (string, optional): Filter by book ID
- `status` (string, optional): Filter by loan status (`active`, `returned`)

**Response:**
```json
[
  {
    "id": "uuid",
    "bookId": "book-uuid",
    "borrowerId": "user-uuid",
    "lentAt": "2023-01-01T00:00:00.000Z",
    "dueAt": "2023-01-15T00:00:00.000Z",
    "returnedAt": null
  }
]
```

#### GET /loans/:id

Retrieve a specific loan by ID.

**Parameters:**
- `id` (string): Loan ID

**Response:**
```json
{
  "id": "uuid",
  "bookId": "book-uuid",
  "borrowerId": "user-uuid",
  "lentAt": "2023-01-01T00:00:00.000Z",
  "dueAt": "2023-01-15T00:00:00.000Z",
  "returnedAt": null
}
```

#### POST /loans

Create a new loan.

**Request Body:**
```json
{
  "bookId": "book-uuid",
  "borrowerId": "user-uuid",
  "dueAt": "2023-01-15T00:00:00.000Z"
}
```

**Response:**
```json
{
  "id": "uuid",
  "bookId": "book-uuid",
  "borrowerId": "user-uuid",
  "lentAt": "2023-01-01T00:00:00.000Z",
  "dueAt": "2023-01-15T00:00:00.000Z",
  "returnedAt": null
}
```

**Error Responses:**
- `400 Bad Request`: Book is not available or invalid data

#### PATCH /loans/:id/return

Return a book (mark loan as returned).

**Parameters:**
- `id` (string): Loan ID

**Response:**
```json
{
  "id": "uuid",
  "bookId": "book-uuid",
  "borrowerId": "user-uuid",
  "lentAt": "2023-01-01T00:00:00.000Z",
  "dueAt": "2023-01-15T00:00:00.000Z",
  "returnedAt": "2023-01-10T00:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: Loan not found
- `400 Bad Request`: Book already returned

#### GET /loans/overdue

Get all overdue loans.

**Response:**
```json
[
  {
    "id": "uuid",
    "bookId": "book-uuid",
    "borrowerId": "user-uuid",
    "lentAt": "2023-01-01T00:00:00.000Z",
    "dueAt": "2023-01-15T00:00:00.000Z",
    "returnedAt": null
  }
]
```

#### DELETE /loans/:id

Delete a loan.

**Parameters:**
- `id` (string): Loan ID

**Response:**
- `204 No Content`: Loan deleted successfully

## Error Handling

The API uses standard HTTP status codes:

- `200 OK`: Successful GET request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a JSON object with error details:

```json
{
  "message": "Error description",
  "error": "Error type"
}
```

## Rate Limiting

Currently, no rate limiting is implemented.

## Testing

The API includes comprehensive unit and integration tests:

### Running Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm test -- --testPathPattern="services"

# Run only integration tests
npm test -- --testPathPattern="integration"

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

- **Unit Tests**: Located in `test/services/` - Test individual service functions with mocked dependencies
- **Integration Tests**: Located in `test/integration/` - Test complete API endpoints with real database interactions

### Test Database

Integration tests use a separate test database to avoid affecting development data.

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- SQLite (for development)

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.sample .env

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run seed

# Start development server
npm run dev
```

### Database Schema

The API uses Prisma ORM with SQLite for development. The schema is defined in `prisma/schema.prisma`.

### Environment Variables

- `DATABASE_URL`: Database connection string
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development, production, test)

## Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start:dist
```

### Docker

A Dockerfile is available for containerized deployment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License
