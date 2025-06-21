import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { basicAuth } from './middlewares/basicAuth';
import { errorHandler } from './middlewares/errorHandler';
import { healthRouter } from './controllers/health.controller';
import { usersRouter } from './routes/users.router';
import { booksRouter } from './routes/books.router';
import { loansRouter } from './routes/loans.router';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json());

  app.use(basicAuth);
  app.use(healthRouter);

  app.use('/users', usersRouter);
  app.use('/books', booksRouter);
  app.use('/loans', loansRouter);

  // Error handler must be last
  app.use(errorHandler);

  return app;
}

export default createApp;
