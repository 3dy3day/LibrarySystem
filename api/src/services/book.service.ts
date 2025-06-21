import { prisma, BookStatus } from '../lib/prisma';
import { GoogleBooksService } from './googleBooks.service';

export const BookService = {
  list: (q?: string, status?: string, author?: string, ownerId?: string) =>
    prisma.book.findMany({
        where: {
          ...(q && { 
            OR: [
              { title: { contains: q } },
              { isbn10: { equals: q } },
              { isbn13: { equals: q } }
            ]
          }),
          ...(status && { status: status as BookStatus }),
          ...(author && { author: { contains: author } }),
          ...(ownerId && { ownerId })
        },
        include: {
          loans: {
            where: { returnedAt: null },
            include: {
              borrower: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
    }),
  get: (id: string) => 
    prisma.book.findUnique({ 
      where: { id },
      include: {
        loans: {
          include: {
            borrower: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    }),
  create: (data: any) => 
    prisma.book.create({ 
      data
    }),
  update: (id: string, data: any) =>
    prisma.book.update({ 
      where: { id }, 
      data
    }),
  remove: async (id: string) => {
    // Check if book has any loans
    const bookWithLoans = await prisma.book.findUnique({
      where: { id },
      include: { loans: true }
    });

    if (!bookWithLoans) {
      throw new Error('Book not found');
    }

    // Check if book has any active loans (not returned)
    const activeLoans = bookWithLoans.loans.filter(loan => !loan.returnedAt);
    
    if (activeLoans.length > 0) {
      throw new Error('Cannot delete book with active loans. Please return the book first.');
    }

    // If book has historical loans (returned), delete them first
    if (bookWithLoans.loans.length > 0) {
      await prisma.loan.deleteMany({
        where: { bookId: id }
      });
    }

    // Now delete the book
    return prisma.book.delete({ where: { id } });
  },
  setStatus: (id: string, status: BookStatus) =>
    prisma.book.update({ where: { id }, data: { status } }),
  
  async findOrCreateByIsbn(isbn: string) {
    const existingBook = await prisma.book.findFirst({
      where: {
        OR: [
          { isbn10: isbn },
          { isbn13: isbn }
        ]
      }
    });
    
    if (existingBook) return existingBook;
    
    const googleBookData = await GoogleBooksService.fetchByIsbn(isbn);
    
    if (googleBookData) {
      return await prisma.book.create({ 
        data: googleBookData
      });
    }
    
    return await prisma.book.create({
      data: {
        title: 'Unknown',
        author: 'Unknown',
        isbn13: isbn
      }
    });
  },

  async getBookInfoByIsbn(isbn: string) {
    // First check if book already exists in database
    const existingBook = await prisma.book.findFirst({
      where: {
        OR: [
          { isbn10: isbn },
          { isbn13: isbn }
        ]
      }
    });
    
    if (existingBook) {
      return { ...existingBook, exists: true };
    }
    
    // If not in database, fetch from Google Books API
    const googleBookData = await GoogleBooksService.fetchByIsbn(isbn);
    
    if (googleBookData) {
      return { ...googleBookData, exists: false };
    }
    
    // Return minimal data if not found
    return {
      title: 'Unknown',
      author: 'Unknown',
      isbn13: isbn,
      exists: false
    };
  }
};
