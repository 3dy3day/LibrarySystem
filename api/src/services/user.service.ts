import { prisma } from '../lib/prisma';

export const UserService = {
  list: () => prisma.user.findMany(),
  get: (id: string) => prisma.user.findUnique({ where: { id } }),
  create: (data: { name: string; email: string }) => prisma.user.create({ data }),
  update: (id: string, data: Partial<{ name: string; email: string }>) =>
    prisma.user.update({ where: { id }, data }),
  remove: (id: string) => prisma.user.delete({ where: { id } })
};
