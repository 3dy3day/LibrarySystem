import { Router } from 'express';
import { LoanService } from '../services/loan.service';
import { validateBody, validateQuery, validateParams } from '../middlewares/validation';
import { 
  createLoanSchema, 
  loanQuerySchema, 
  loanParamsSchema 
} from '../schemas/loan.schema';

export const loansRouter = Router();

loansRouter
  .get('/', validateQuery(loanQuerySchema), async (req, res, next) => {
    try {
      const { bookId, borrowerId, overdue } = req.query as any;
      res.json(await LoanService.list(bookId, borrowerId, overdue));
    } catch (e) { next(e); }
  })
  .get('/:id', validateParams(loanParamsSchema), async (req, res, next) => {
    try {
      res.json(await LoanService.get(req.params.id));
    } catch (e) { next(e); }
  })
  .post('/', validateBody(createLoanSchema), async (req, res, next) => {
    try {
      const { bookId, borrowerId, days } = req.body;
      const loan = await LoanService.lend(bookId, borrowerId, days);
      res.status(201).json(loan);
    } catch (e) { next(e); }
  })
  .patch('/:id/return', validateParams(loanParamsSchema), async (req, res, next) => {
    try {
      const loan = await LoanService.returnLoan(req.params.id);
      res.json(loan);
    } catch (e) { next(e); }
  });
