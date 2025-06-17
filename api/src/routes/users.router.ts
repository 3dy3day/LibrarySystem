import { Router } from 'express';
import { UserService } from '../services/user.service';
import { validateBody, validateQuery, validateParams } from '../middlewares/validation';
import { 
  createUserSchema, 
  updateUserSchema, 
  userQuerySchema, 
  userParamsSchema 
} from '../schemas/user.schema';

export const usersRouter = Router();

usersRouter
  .get('/', validateQuery(userQuerySchema), async (req, res, next) => {
    try {
      const { q } = req.query as any;
      res.json(await UserService.list(q));
    } catch (e) { next(e); }
  })
  .get('/:id', validateParams(userParamsSchema), async (req, res, next) => {
    try {
      res.json(await UserService.get(req.params.id));
    } catch (e) { next(e); }
  })
  .post('/', validateBody(createUserSchema), async (req, res, next) => {
    try {
      res.status(201).json(await UserService.create(req.body));
    } catch (e) { next(e); }
  })
  .patch('/:id', validateParams(userParamsSchema), validateBody(updateUserSchema), async (req, res, next) => {
    try {
      res.json(await UserService.update(req.params.id, req.body));
    } catch (e) { next(e); }
  })
  .delete('/:id', validateParams(userParamsSchema), async (req, res, next) => {
    try {
      await UserService.remove(req.params.id);
      res.status(204).end();
    } catch (e) { next(e); }
  });
