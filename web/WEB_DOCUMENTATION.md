# Library System Web Application Documentation

## Overview

The Library System Web Application is a Vue.js 3 frontend that provides a user-friendly interface for managing books, users, and loans in a library management system. It communicates with the Library System API to perform all operations.

## Technology Stack

- **Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: Vue Router 4
- **State Management**: Pinia
- **Styling**: CSS3 with custom styles
- **HTTP Client**: Fetch API

## Project Structure

```
web/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── vue.svg
│   ├── components/
│   │   └── HelloWorld.vue
│   ├── lib/
│   │   └── api.ts              # API client
│   ├── pages/                  # Page components
│   │   ├── BookDetail.vue
│   │   ├── BookEdit.vue
│   │   ├── BooksPage.vue
│   │   ├── DashboardPage.vue
│   │   ├── HomePage.vue
│   │   ├── LoginPage.vue
│   │   ├── ManualBookEntry.vue
│   │   ├── RegisterPage.vue
│   │   ├── ScanBookInfoPage.vue
│   │   ├── ScanConfirmPage.vue
│   │   ├── ScanPage.vue
│   │   └── UserPage.vue
│   ├── router/
│   │   └── index.ts            # Route definitions
│   ├── stores/
│   │   ├── auth.ts             # Authentication store
│   │   └── book.ts             # Book management store
│   ├── App.vue                 # Root component
│   ├── main.ts                 # Application entry point
│   └── style.css               # Global styles
├── index.html                  # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── demo.html                   # Demo page
```

## Features

### Core Functionality

1. **Book Management**
   - Browse and search books
   - View book details
   - Add new books manually or by ISBN scanning
   - Edit book information
   - Track book status (Available, Lent, Lost)

2. **User Management**
   - View user profiles
   - Manage user information
   - Track user loan history

3. **Loan Management**
   - Create new loans
   - Return books
   - View loan history
   - Track overdue books

4. **ISBN Scanning**
   - Scan book barcodes using device camera
   - Automatically fetch book information from external APIs
   - Confirm and add scanned books to the library

### User Interface

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Clear routing between different sections
- **Real-time Updates**: Dynamic content updates without page refreshes
- **Error Handling**: User-friendly error messages and validation

## Pages and Components

### HomePage.vue
The main landing page that provides navigation to different sections of the application.

**Features:**
- Welcome message
- Quick access to main features
- Navigation menu

### BooksPage.vue
Displays a list of all books in the library with search and filtering capabilities.

**Features:**
- Book grid/list view
- Search by title, author, or ISBN
- Filter by status (Available, Lent, Lost)
- Pagination for large book collections
- Quick actions (view details, edit, delete)

**Props:**
- None

**Emits:**
- `book-selected`: When a book is clicked

### BookDetail.vue
Shows detailed information about a specific book.

**Features:**
- Complete book information display
- Book cover image (if available)
- Current status and availability
- Loan history
- Edit and delete actions

**Props:**
```typescript
interface Props {
  bookId: string;
}
```

### BookEdit.vue
Form for editing existing book information.

**Features:**
- Editable form fields for all book properties
- Validation for required fields
- Save and cancel actions
- Image upload for book covers

**Props:**
```typescript
interface Props {
  bookId: string;
}
```

### ManualBookEntry.vue
Form for manually adding new books to the library.

**Features:**
- Complete book information form
- ISBN validation
- Automatic book info fetching by ISBN
- Form validation and error handling

### ScanPage.vue
Camera interface for scanning book barcodes.

**Features:**
- Camera access and control
- Barcode detection and scanning
- Real-time preview
- Manual ISBN entry fallback

### ScanBookInfoPage.vue
Displays book information fetched from external APIs after scanning.

**Features:**
- Book information preview
- Edit capabilities before adding
- Confirmation workflow

### ScanConfirmPage.vue
Final confirmation step before adding a scanned book.

**Features:**
- Final book details review
- Add to library confirmation
- Success/error feedback

### UserPage.vue
User profile and management interface.

**Features:**
- User information display
- Loan history
- Owned books list
- Edit user details

**Props:**
```typescript
interface Props {
  userId: string;
}
```

### DashboardPage.vue
Administrative dashboard with system overview.

**Features:**
- Library statistics
- Recent activity
- Quick actions
- System health indicators

### LoginPage.vue
User authentication interface.

**Features:**
- Login form
- User registration link
- Password reset functionality

### RegisterPage.vue
New user registration interface.

**Features:**
- Registration form
- Email validation
- Terms and conditions

## State Management

### Auth Store (`stores/auth.ts`)

Manages user authentication and session state.

**State:**
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}
```

**Actions:**
- `login(credentials)`: Authenticate user
- `logout()`: Clear user session
- `register(userData)`: Create new user account
- `refreshToken()`: Refresh authentication token

### Book Store (`stores/book.ts`)

Manages book-related state and operations.

**State:**
```typescript
interface BookState {
  books: Book[];
  currentBook: Book | null;
  loading: boolean;
  error: string | null;
}
```

**Actions:**
- `fetchBooks(filters?)`: Get all books with optional filtering
- `fetchBook(id)`: Get specific book details
- `createBook(bookData)`: Add new book
- `updateBook(id, bookData)`: Update existing book
- `deleteBook(id)`: Remove book
- `searchBooks(query)`: Search books by query

## API Integration

### API Client (`lib/api.ts`)

Centralized HTTP client for API communication.

**Configuration:**
```typescript
const API_BASE_URL = 'http://localhost:3000/api/v1';

interface ApiClient {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, data: any): Promise<T>;
  patch<T>(endpoint: string, data: any): Promise<T>;
  delete(endpoint: string): Promise<void>;
}
```

**Features:**
- Automatic request/response interceptors
- Error handling and retry logic
- Authentication token management
- Request/response logging (development)

**Usage Example:**
```typescript
import { api } from '@/lib/api';

// Fetch all books
const books = await api.get<Book[]>('/books');

// Create new book
const newBook = await api.post<Book>('/books', bookData);

// Update book
const updatedBook = await api.patch<Book>(`/books/${id}`, updateData);

// Delete book
await api.delete(`/books/${id}`);
```

## Routing

### Route Configuration (`router/index.ts`)

**Routes:**
```typescript
const routes = [
  { path: '/', component: HomePage, name: 'home' },
  { path: '/books', component: BooksPage, name: 'books' },
  { path: '/books/:id', component: BookDetail, name: 'book-detail' },
  { path: '/books/:id/edit', component: BookEdit, name: 'book-edit' },
  { path: '/books/new', component: ManualBookEntry, name: 'book-new' },
  { path: '/scan', component: ScanPage, name: 'scan' },
  { path: '/scan/info', component: ScanBookInfoPage, name: 'scan-info' },
  { path: '/scan/confirm', component: ScanConfirmPage, name: 'scan-confirm' },
  { path: '/users/:id', component: UserPage, name: 'user' },
  { path: '/dashboard', component: DashboardPage, name: 'dashboard' },
  { path: '/login', component: LoginPage, name: 'login' },
  { path: '/register', component: RegisterPage, name: 'register' },
];
```

**Navigation Guards:**
- Authentication required for protected routes
- Role-based access control
- Redirect handling for unauthorized access

## Styling and Theming

### Global Styles (`style.css`)

**CSS Variables:**
```css
:root {
  --primary-color: #646cff;
  --secondary-color: #535bf2;
  --background-color: #ffffff;
  --text-color: #213547;
  --border-color: #e5e7eb;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
}
```

**Responsive Breakpoints:**
```css
/* Mobile */
@media (max-width: 768px) { }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

### Component Styling

Each Vue component includes scoped styles:

```vue
<style scoped>
.component-class {
  /* Component-specific styles */
}
</style>
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Modern web browser with camera support (for scanning features)

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server

The development server runs on `http://localhost:5173` by default and includes:
- Hot module replacement (HMR)
- TypeScript compilation
- Vue component hot reload
- Proxy configuration for API calls

### Environment Configuration

Create `.env` files for different environments:

**.env.development:**
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_TITLE=Library System (Development)
```

**.env.production:**
```
VITE_API_BASE_URL=https://api.library.com/v1
VITE_APP_TITLE=Library System
```

## Building and Deployment

### Production Build

```bash
# Build for production
npm run build

# Output directory: dist/
```

**Build Optimization:**
- Code splitting and lazy loading
- Asset optimization and compression
- Tree shaking for unused code elimination
- Source map generation for debugging

### Deployment Options

1. **Static Hosting** (Netlify, Vercel, GitHub Pages)
2. **CDN Deployment** (AWS CloudFront, Cloudflare)
3. **Docker Container**
4. **Traditional Web Server** (Nginx, Apache)

### Docker Deployment

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Testing

### Unit Testing

```bash
# Run unit tests
npm run test:unit

# Run tests with coverage
npm run test:unit -- --coverage

# Run tests in watch mode
npm run test:unit -- --watch
```

### E2E Testing

```bash
# Run end-to-end tests
npm run test:e2e

# Run E2E tests in headless mode
npm run test:e2e:headless
```

### Testing Structure

```
tests/
├── unit/
│   ├── components/
│   ├── stores/
│   └── utils/
└── e2e/
    ├── specs/
    └── support/
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load components
const BookDetail = () => import('@/pages/BookDetail.vue');
const UserPage = () => import('@/pages/UserPage.vue');
```

### Caching Strategy

- API response caching
- Component-level caching
- Browser storage utilization
- Service worker implementation

### Bundle Analysis

```bash
# Analyze bundle size
npm run build -- --analyze
```

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Camera Features**: Requires HTTPS in production for camera access

## Security Considerations

### Content Security Policy (CSP)

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:;">
```

### Input Validation

- Client-side form validation
- XSS prevention
- CSRF protection
- Secure API communication

## Accessibility

### WCAG 2.1 Compliance

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

### Accessibility Features

```vue
<template>
  <button 
    :aria-label="buttonLabel"
    :aria-pressed="isPressed"
    @click="handleClick"
    @keydown.enter="handleClick"
  >
    {{ buttonText }}
  </button>
</template>
```

## Troubleshooting

### Common Issues

1. **Camera Access Denied**
   - Ensure HTTPS in production
   - Check browser permissions
   - Verify camera hardware

2. **API Connection Errors**
   - Verify API server is running
   - Check CORS configuration
   - Validate API endpoints

3. **Build Failures**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify environment variables

### Debug Mode

```bash
# Enable debug logging
VITE_DEBUG=true npm run dev
```

## Contributing

### Code Style

- ESLint configuration for code quality
- Prettier for code formatting
- Vue 3 Composition API patterns
- TypeScript strict mode

### Git Workflow

1. Create feature branch from main
2. Implement changes with tests
3. Run linting and tests
4. Submit pull request
5. Code review and merge

### Component Guidelines

```vue
<template>
  <!-- Use semantic HTML -->
  <!-- Include accessibility attributes -->
  <!-- Follow Vue 3 best practices -->
</template>

<script setup lang="ts">
// Use Composition API
// Define props and emits with TypeScript
// Implement reactive state management
</script>

<style scoped>
/* Component-specific styles */
/* Use CSS custom properties */
/* Follow responsive design principles */
</style>
```

## License

MIT License
