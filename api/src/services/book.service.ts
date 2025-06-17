import { prisma, BookStatus } from '../lib/prisma';

export const BookService = {
  list: (q?: string, status?: string, author?: string) =>
    prisma.book.findMany({
        where: {
          ...(q && { title: { contains: q } }),
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
    prisma.book.update({ where: { id }, data: { status } })
};
