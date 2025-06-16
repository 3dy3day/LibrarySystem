import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './env';
import { basicAuth } from './middlewares/basicAuth';
import { healthRouter } from './controllers/health.controller';

import { usersRouter } from './routes/users.router';
import { booksRouter } from './routes/books.router';
import { loansRouter } from './routes/loans.router';

const app = express();

/* ミドルウェア */
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

/* 認証 & ルーティング */
app.use(basicAuth);
app.use(healthRouter);

app.use('/users', usersRouter);
app.use('/books', booksRouter);
app.use('/loans', loansRouter);

/* 起動 */
const port = Number(env.PORT);
app.listen(port, () => {
  /* eslint-disable-next-line no-console */
  console.log(`Listening: http://localhost:${port}`);
});

export { app };  // Supertest/E2E テスト用
