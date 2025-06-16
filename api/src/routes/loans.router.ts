import { Router } from 'express';
import { LoanService } from '../services/loan.service';

export const loansRouter = Router();

loansRouter
  .get('/', async (_req, res) => res.json(await LoanService.list()))
  .get('/:id', async (req, res) => res.json(await LoanService.get(req.params.id)))
  .post('/', async (req, res, next) => {
    try {
      const { bookId, borrowerId, days } = req.body;
      const loan = await LoanService.lend(bookId, borrowerId, days);
      res.status(201).json(loan);
    } catch (e) { next(e); }
  })
  .patch('/:id/return', async (req, res, next) => {
    try {
      const loan = await LoanService.returnLoan(req.params.id);
      res.json(loan);
    } catch (e) { next(e); }
  });
