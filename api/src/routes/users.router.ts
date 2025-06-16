import { Router } from 'express';
import { UserService } from '../services/user.service';

export const usersRouter = Router();

usersRouter
  .get('/', async (_req, res) => res.json(await UserService.list()))
  .get('/:id', async (req, res) => res.json(await UserService.get(req.params.id)))
  .post('/', async (req, res) => res.status(201).json(await UserService.create(req.body)))
  .patch('/:id', async (req, res) =>
    res.json(await UserService.update(req.params.id, req.body))
  )
  .delete('/:id', async (req, res) => {
    await UserService.remove(req.params.id);
    res.status(204).end();
  });
