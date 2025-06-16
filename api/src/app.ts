// src/app.ts
import express from 'express';
import { basicAuth } from './middlewares/basicAuth.js';      // ← .js がポイント
import { healthRouter } from './controllers/health.controller.js';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(basicAuth);         // 全ルートに Basic 認証
  app.use(healthRouter);
  return app;
}
