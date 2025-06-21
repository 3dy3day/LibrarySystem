# User Management Features

This document outlines the user-related functionality that has been added to the Library System.

## Overview

The system now supports user roles and subscription tiers that control borrowing limits and access permissions.

## User Roles

### USER (Default)
- Can CRUD books they own
- Can borrow books based on their tier limit
- Can view their own borrowing status and owned books

### ADMIN
- Full access to all system features
- Can manage all users and books
- Can override borrowing limits
- Can access admin-only endpoints

## User Tiers & Borrowing Limits

| Tier | Price | Borrow Limit | Description |
|------|-------|--------------|-------------|
| TIER_4 | Free (Default) | 1 book | Basic free tier |
| TIER_3 | 500 yen | 2 books | Basic subscription |
| TIER_2 | 1000 yen | 3 books | Standard subscription |
| TIER_1 | 3000 yen | 3 books | Premium subscription (same as TIER_2, future expansion) |

## Database Schema Changes

### User Model
```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  role      UserRole @default(USER)
  tier      UserTier @default(TIER_4)
  createdAt DateTime @default(now())

  loans     Loan[]
  ownedBooks Book[]
}
```

### Book Model
```prisma
model Book {
  // ... existing fields
  ownerId     String?
  owner       User?    @relation(fields: [ownerId], references: [id])
  // ... rest of fields
}
```

## API Endpoints

**Note:** All endpoints require Basic Authentication with credentials `admin:changeme`

### User Management

#### GET /users
List all users with optional filtering
- Query params: `q` (search), `role`, `tier`
- Returns: Array of users with their roles and tiers

#### GET /users/:id
Get specific user details
- Returns: User with owned books and active loans

#### POST /users
Create new user
- Body: `{ name, email, role?, tier? }`
- Returns: Created user

#### PATCH /users/:id
Update user
- Body: Partial user data
- Returns: Updated user

#### DELETE /users/:id
Delete user
- Returns: 204 No Content

#### GET /users/:id/borrow-status
Check user's borrowing capacity
- Returns: `{ canBorrow: boolean, currentLoans: number, maxLoans: number }`

#### GET /users/:id/owned-books
Get books owned by user
- Returns: Array of books with loan information

### Book Management

#### GET /books
List books with optional filtering
- Query params: `q`, `status`, `author`, `ownerId`
- Returns: Array of books with owner and borrower information

#### POST /books
Create new book
- Body: Book data including optional `ownerId`
- Returns: Created book

#### PATCH /books/:id
Update book (owner or admin only)
- Body: Partial book data
- Returns: Updated book

### Loan Management

The loan system now enforces tier-based borrowing limits:
- Checks user's current active loans before allowing new loans
- Prevents borrowing if user has reached their tier limit
- Returns appropriate error messages with current/max loan counts

## Authentication & Authorization

### Headers
- `x-user-id`: Required header containing the user's ID for authentication

### Middleware
- `authenticateUser`: Validates user and attaches user info to request
- `requireAdmin`: Ensures user has admin role
- `requireOwnershipOrAdmin`: Allows access to resource owners or admins
- `requireBookOwnershipOrAdmin`: Specific check for book ownership

## Test Users

The system includes seeded test users:

| Email | Role | Tier | Borrow Limit | User ID |
|-------|------|------|--------------|---------|
| admin@library.com | ADMIN | TIER_1 | 3 books | 97e44342-8611-42f7-8354-82e16a669fb8 |
| premium@library.com | USER | TIER_1 | 3 books | d6cd411d-5619-4606-acc4-5374a7ee416d |
| standard@library.com | USER | TIER_2 | 3 books | 8f7f0f88-cb73-4df2-9d00-267ee283a68f |
| basic@library.com | USER | TIER_3 | 2 books | 0a4dc11a-bc16-44af-ae91-6cf13df18f5a |
| free@library.com | USER | TIER_4 | 1 book | 0ce43844-e93e-4d0d-a371-ed52be41fe01 |

## Usage Examples

### Testing Borrowing Limits

1. **Check user's borrow status:**
```bash
curl -u admin:changeme \
     http://localhost:3000/users/0ce43844-e93e-4d0d-a371-ed52be41fe01/borrow-status
```

2. **Create a loan (will check tier limits):**
```bash
curl -X POST \
     -u admin:changeme \
     -H "Content-Type: application/json" \
     -d '{"bookId": "book-id", "borrowerId": "user-id"}' \
     http://localhost:3000/loans
```

### Book Ownership

1. **Create a book with owner:**
```bash
curl -X POST \
     -u admin:changeme \
     -H "Content-Type: application/json" \
     -d '{"title": "My Book", "author": "Author", "ownerId": "user-id"}' \
     http://localhost:3000/books
```

2. **Get books owned by user:**
```bash
curl -u admin:changeme \
     http://localhost:3000/users/user-id/owned-books
```

3. **Filter books by owner:**
```bash
curl -u admin:changeme \
     "http://localhost:3000/books?ownerId=user-id"
```

## Future Enhancements

- Subscription management system
- Payment processing for tier upgrades
- Notification system for due dates
- Advanced reporting for admins
- Book recommendation system based on user preferences
