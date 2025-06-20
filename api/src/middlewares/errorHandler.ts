import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Unique constraint violation',
          message: 'A record with this value already exists'
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Record not found',
          message: 'The requested record does not exist'
        });
      default:
        return res.status(400).json({
          error: 'Database error',
          message: error.message
        });
    }
  }

  if (error.message.includes('not available')) {
    return res.status(409).json({
      error: 'Resource not available',
      message: error.message
    });
  }

  if (error.message.includes('Cannot delete book with active loans')) {
    return res.status(409).json({
      error: 'Cannot delete book',
      message: error.message
    });
  }

  if (error.message.includes('Book not found')) {
    return res.status(404).json({
      error: 'Book not found',
      message: error.message
    });
  }

  return res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
}
