import { Router } from 'express';

export const healthRouter = Router().get('/healthz', (_req, res) => {
  res.json({ status: 'OK' });
});
