import { Router } from 'express';
import { BookService } from '../services/book.service';
import { validateBody, validateQuery, validateParams } from '../middlewares/validation';
import { 
  createBookSchema, 
  updateBookSchema, 
  bookQuerySchema, 
  bookParamsSchema,
  setBookStatusSchema 
} from '../schemas/book.schema';

export const booksRouter = Router();

booksRouter
  .get('/', validateQuery(bookQuerySchema), async (req, res, next) => {
    try {
      const { q, status, author, ownerId } = req.query as any;
      res.json(await BookService.list(q, status, author, ownerId));
    } catch (e) { next(e); }
  })
  .get('/:id', validateParams(bookParamsSchema), async (req, res, next) => {
    try {
      res.json(await BookService.get(req.params.id));
    } catch (e) { next(e); }
  })
  .post('/', validateBody(createBookSchema), async (req, res, next) => {
    try {
      res.status(201).json(await BookService.create(req.body));
    } catch (e) { next(e); }
  })
  .patch('/:id', validateParams(bookParamsSchema), validateBody(updateBookSchema), async (req, res, next) => {
    try {
      res.json(await BookService.update(req.params.id, req.body));
    } catch (e) { next(e); }
  })
  .delete('/:id', validateParams(bookParamsSchema), async (req, res, next) => {
    try {
      await BookService.remove(req.params.id);
      res.status(204).end();
    } catch (e) { next(e); }
  })
  .patch('/:id/status', validateParams(bookParamsSchema), validateBody(setBookStatusSchema), async (req, res, next) => {
    try {
      res.json(await BookService.setStatus(req.params.id, req.body.status));
    } catch (e) { next(e); }
  })
  .get('/isbn/:isbn', async (req, res, next) => {
    try {
      const book = await BookService.findOrCreateByIsbn(req.params.isbn);
      res.json(book);
    } catch (e) { next(e); }
  })
  .get('/isbn/:isbn/info', async (req, res, next) => {
    try {
      const book = await BookService.getBookInfoByIsbn(req.params.isbn);
      res.json(book);
    } catch (e) { next(e); }
  });
