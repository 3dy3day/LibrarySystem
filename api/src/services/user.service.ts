import { prisma } from '../lib/prisma';

export const UserService = {
  list: (q?: string) =>
    prisma.user.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } }
            ]
          }
        : undefined
    }),
  get: (id: string) => prisma.user.findUnique({ where: { id } }),
  create: (data: { name: string; email: string; phone?: string; address?: string }) => 
    prisma.user.create({ data }),
  update: (id: string, data: Partial<{ name: string; email: string; phone?: string; address?: string }>) =>
    prisma.user.update({ where: { id }, data }),
  remove: (id: string) => prisma.user.delete({ where: { id } })
};
