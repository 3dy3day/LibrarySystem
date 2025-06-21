import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

// Middleware to check if user exists and attach user info to request
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required in x-user-id header' });
    }

    const user = await UserService.get(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

// Middleware to check if user owns the resource or is admin
export const requireOwnershipOrAdmin = (resourceUserIdField: string = 'ownerId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (user.role === 'ADMIN' || user.id === resourceUserId) {
      return next();
    }
    
    res.status(403).json({ error: 'Access denied. You can only access your own resources.' });
  };
};

// Middleware to check if user can modify a book (owner or admin)
export const requireBookOwnershipOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const bookId = req.params.id;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (user.role === 'ADMIN') {
      return next();
    }
    
    // Check if user owns the book
    const { BookService } = await import('../services/book.service');
    const book = await BookService.get(bookId);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    if (book.ownerId !== user.id) {
      return res.status(403).json({ error: 'Access denied. You can only modify books you own.' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};
