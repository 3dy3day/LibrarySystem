import { PrismaClient, BookStatus } from '@prisma/client';
export const prisma = new PrismaClient();
export { BookStatus };
export * from '@prisma/client';
