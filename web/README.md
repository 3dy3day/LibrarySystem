# Library System - Web Frontend

A modern web application for managing library collections, built with Vue 3, TypeScript, and Tailwind CSS.

## Features

- **Dashboard**: Overview of library statistics and recent activity
- **Book Management**: Browse, search, and manage book collections
- **ISBN Scanning**: Add books by scanning ISBN barcodes using device camera
- **Book Details**: View detailed information about individual books
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: Vue Router 4
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Barcode Scanning**: ZXing library
- **Build Tool**: Vite

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Running Library System API server (see `/api` directory)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Project Structure

```
src/
├── components/          # Reusable Vue components
├── pages/              # Page components
│   ├── DashboardPage.vue    # Main dashboard with stats
│   ├── BooksPage.vue        # Book listing and management
│   ├── ScanPage.vue         # ISBN barcode scanning
│   └── BookDetail.vue       # Individual book details
├── router/             # Vue Router configuration
├── stores/             # Pinia state management
│   ├── auth.ts             # Authentication store
│   └── book.ts             # Book data store
├── lib/                # Utility libraries
│   └── api.ts              # Axios API client configuration
└── assets/             # Static assets
```

## API Integration

The application connects to the Library System API server running on `http://localhost:3000`. The API client is configured with:

- Basic Authentication support
- Request timeout of 8 seconds
- Automatic authorization header injection

### Authentication

The app uses HTTP Basic Authentication. Credentials are managed through the Pinia auth store and automatically included in API requests.

## Key Features

### Dashboard
- Real-time library statistics (total books, available, on loan, overdue)
- Recent activity feed
- Quick action buttons for common tasks

### Book Management
- Browse complete book collection
- Search and filter functionality
- View detailed book information
- Track availability status

### ISBN Scanning
- Camera-based barcode scanning using ZXing library
- Automatic book information retrieval
- Add books to collection via ISBN

## Configuration

### Environment Variables

Currently, the API base URL is hardcoded in `src/lib/api.ts`. For production deployment, consider moving this to environment variables:

```typescript
// TODO: Move to environment configuration
baseURL: process.env.VITE_API_URL || 'http://localhost:3000'
```

### Tailwind CSS

The project uses Tailwind CSS for styling. Configuration can be found in `tailwind.config.js` (if present) or through PostCSS configuration.

## Development

### Code Style

The project follows Vue 3 best practices:
- Composition API with `<script setup>`
- TypeScript for type safety
- Single File Components (SFCs)

### Adding New Pages

1. Create a new Vue component in `src/pages/`
2. Add the route to `src/router/index.ts`
3. Update navigation components as needed

### State Management

Use Pinia stores for global state management:
- Authentication state in `stores/auth.ts`
- Book data in `stores/book.ts`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Browser Support

- Modern browsers with ES6+ support
- Camera access required for barcode scanning functionality

## Related Projects

- **API Backend**: See `/api` directory for the Express.js backend server
- **Database**: Uses Prisma ORM with PostgreSQL/SQLite

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new features
3. Test new functionality thoroughly
4. Update documentation as needed

## License

This project is part of the Library System application suite.
