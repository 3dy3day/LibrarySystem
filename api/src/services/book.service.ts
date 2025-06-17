import { prisma, BookStatus } from '../lib/prisma';
import { GoogleBooksService } from './googleBooks.service';

export const BookService = {
  list: (q?: string, status?: string, author?: string) =>
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
          ...(author && { author: { contains: author } })
        }
    }),
  get: (id: string) => prisma.book.findUnique({ where: { id } }),
  create: (data: any) => prisma.book.create({ data }),
  update: (id: string, data: any) =>
    prisma.book.update({ where: { id }, data }),
  remove: (id: string) => prisma.book.delete({ where: { id } }),
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
      return await prisma.book.create({ data: googleBookData });
    }
    
    return await prisma.book.create({
      data: {
        title: 'Unknown',
        author: 'Unknown',
        isbn13: isbn
      }
    });
  }
};
