import type { Request, Response, NextFunction } from 'express';
import { env } from '../env';
import bcrypt from 'bcrypt';

/**
 * 超シンプル Basic 認証
 * TODO: env にパスワードハッシュを置き、bcrypt.compare へ差し替える
 */
export async function basicAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization ?? '';
  const [type, encoded] = header.split(' ');
  if (type !== 'Basic' || !encoded) return unauthorized(res);

  const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':');

  const ok = user === env.BASIC_USER && pass === env.BASIC_PASS;
  // ハッシュ運用に切り替えるなら:
  // const ok = user === env.BASIC_USER && await bcrypt.compare(pass, env.BASIC_HASH);

  if (!ok) return unauthorized(res);
  next();
}

function unauthorized(res: Response) {
  res.set('WWW-Authenticate', 'Basic realm="LibraryApp"').status(401).end();
}
