import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';

import type { Request, Response } from 'express';
import { parse } from 'cookie';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessTokenCookie, refreshTokenCookie } =
      await this.authService.login(body.email, body.password);

    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    return { success: true };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const { accessTokenCookie, refreshTokenCookie } =
      this.authService.buildLogoutCookies();

    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    return { success: true };
  }

  @Get('check-token')
  async checkToken(@Req() req: Request) {
    const userId = (req as Request & { userId?: number }).userId;

    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const user = await this.authService.findUserProfileById(userId);

    return {
      valid: true,
      userId,
      user,
    };
  }

  @Post('refresh-token')
  refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = parse(req.headers.cookie || '');
    const refreshCookieName = this.authService.getRefreshTokenCookieName();
    const refreshToken = cookies[refreshCookieName];

    if (!refreshToken) {
      throw new UnauthorizedException('No se encontro refresh token');
    }

    const { accessTokenCookie, refreshTokenCookie } =
      this.authService.refreshToken(refreshToken);

    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    return { success: true };
  }
}
