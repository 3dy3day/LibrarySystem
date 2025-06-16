import { Router } from 'express';
import { BookService } from '../services/book.service';

export const booksRouter = Router();

booksRouter
  .get('/', async (req, res) =>
    res.json(await BookService.list(req.query.q as string | undefined))
  )
  .get('/:id', async (req, res) => res.json(await BookService.get(req.params.id)))
  .post('/', async (req, res) => res.status(201).json(await BookService.create(req.body)))
  .patch('/:id', async (req, res) =>
    res.json(await BookService.update(req.params.id, req.body))
  )
  .delete('/:id', async (req, res) => {
    await BookService.remove(req.params.id);
    res.status(204).end();
  });
