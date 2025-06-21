import { env } from './env';
import { createApp } from './app';

const app = createApp();

const port = Number(env.PORT);
app.listen(port, () => {
  /* eslint-disable-next-line no-console */
  console.log(`Listening: http://localhost:${port}`);
});

export { app };
