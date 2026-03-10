import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';

import type { NextFunction, Request, Response } from 'express';
import { parse } from 'cookie';

import { AuthService } from './auth.service';

@Injectable()
export class AuthTokenMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    const cookies = parse(req.headers.cookie || '');
    const accessTokenCookieName = this.authService.getAccessTokenCookieName();
    const accessToken = cookies[accessTokenCookieName];

    if (!accessToken) {
      throw new UnauthorizedException('No se encontro access token');
    }

    const payload = this.authService.verifyAccessToken(accessToken);
    (req as Request & { userId?: number }).userId = payload.id;

    next();
  }
}
