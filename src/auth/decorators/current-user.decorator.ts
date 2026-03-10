import {
  UnauthorizedException,
  createParamDecorator,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = (request as Request & { userId?: number }).userId;

    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return userId;
  },
);
