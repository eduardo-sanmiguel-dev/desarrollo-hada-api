import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

import { sign, verify, type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { serialize } from 'cookie';
import CryptoJS from 'crypto-js';
import argon2 from 'argon2';

import { User } from '../modules/users/entities/user.entity';

interface AuthCookies {
  accessTokenCookie: string;
  refreshTokenCookie: string;
}

type AuthUserProfile = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async login(
    encryptedEmail: string,
    encryptedPassword: string,
  ): Promise<AuthCookies> {
    const email = this.decryptCredential(encryptedEmail, 'email');
    const password = this.decryptCredential(encryptedPassword, 'password');

    const user = await this.usersRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);

    return {
      accessTokenCookie: this.buildAccessTokenCookie(accessToken),
      refreshTokenCookie: this.buildRefreshTokenCookie(refreshToken),
    };
  }

  refreshToken(refreshToken: string): AuthCookies {
    const payload = this.verifyRefreshToken(refreshToken);

    const accessToken = this.signAccessToken({ id: payload.id } as User);
    const nextRefreshToken = this.signRefreshToken({ id: payload.id } as User);

    return {
      accessTokenCookie: this.buildAccessTokenCookie(accessToken),
      refreshTokenCookie: this.buildRefreshTokenCookie(nextRefreshToken),
    };
  }

  getRefreshTokenCookieName(): string {
    return this.configService.get<string>(
      'app.auth.refreshTokenCookieName',
      'refresh_token',
    );
  }

  getAccessTokenCookieName(): string {
    return this.configService.get<string>(
      'app.auth.accessTokenCookieName',
      'access_token',
    );
  }

  buildLogoutCookies(): AuthCookies {
    return {
      accessTokenCookie: this.buildClearedCookie(
        this.configService.get<string>(
          'app.auth.accessTokenCookieName',
          'access_token',
        ),
      ),
      refreshTokenCookie: this.buildClearedCookie(
        this.configService.get<string>(
          'app.auth.refreshTokenCookieName',
          'refresh_token',
        ),
      ),
    };
  }

  verifyAccessToken(token: string): { id: number } {
    try {
      const secret = this.configService.get<string>(
        'app.auth.accessTokenSecret',
        '',
      );
      const payload = verify(token, secret);
      return { id: this.extractUserIdFromPayload(payload) };
    } catch {
      throw new UnauthorizedException('Token invalido o expirado');
    }
  }

  async findUserProfileById(userId: number): Promise<AuthUserProfile> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const { password, ...safeUser } = user;
    void password;

    return safeUser;
  }

  private signAccessToken(user: Pick<User, 'id'>): string {
    const secret = this.configService.get<string>(
      'app.auth.accessTokenSecret',
      '',
    );
    const expiresIn = this.configService.get<string>(
      'app.auth.accessTokenExpiresIn',
      '15m',
    );

    return sign({ id: user.id }, secret, {
      expiresIn: expiresIn as SignOptions['expiresIn'],
    });
  }

  private signRefreshToken(user: Pick<User, 'id'>): string {
    const secret = this.configService.get<string>(
      'app.auth.refreshTokenSecret',
      '',
    );
    const expiresIn = this.configService.get<string>(
      'app.auth.refreshTokenExpiresIn',
      '7d',
    );

    return sign({ id: user.id }, secret, {
      expiresIn: expiresIn as SignOptions['expiresIn'],
    });
  }

  private verifyRefreshToken(token: string): { id: number } {
    try {
      const secret = this.configService.get<string>(
        'app.auth.refreshTokenSecret',
        '',
      );
      const payload = verify(token, secret);
      return { id: this.extractUserIdFromPayload(payload) };
    } catch {
      throw new UnauthorizedException('Refresh token invalido o expirado');
    }
  }

  private decryptCredential(encryptedValue: string, field: string): string {
    const key = this.configService.get<string>(
      'app.auth.credentialsCryptoKey',
      '',
    );
    const decrypted = CryptoJS.AES.decrypt(encryptedValue, key).toString(
      CryptoJS.enc.Utf8,
    );

    if (!decrypted) {
      throw new UnauthorizedException(`No se pudo descifrar ${field}`);
    }

    return decrypted;
  }

  private buildAccessTokenCookie(token: string): string {
    return this.serializeCookie(
      this.configService.get<string>(
        'app.auth.accessTokenCookieName',
        'access_token',
      ),
      token,
      this.configService.get<string>('app.auth.accessTokenExpiresIn', '15m'),
    );
  }

  private buildRefreshTokenCookie(token: string): string {
    return this.serializeCookie(
      this.configService.get<string>(
        'app.auth.refreshTokenCookieName',
        'refresh_token',
      ),
      token,
      this.configService.get<string>('app.auth.refreshTokenExpiresIn', '7d'),
    );
  }

  private buildClearedCookie(name: string): string {
    return serialize(name, '', {
      httpOnly: true,
      secure:
        this.configService.get<string>('app.auth.cookieSecure', 'false') ===
        'true',
      sameSite: this.configService.get<'strict' | 'lax' | 'none'>(
        'app.auth.cookieSameSite',
        'lax',
      ),
      path: this.configService.get<string>('app.auth.cookiePath', '/'),
      maxAge: 0,
    });
  }

  private serializeCookie(
    name: string,
    token: string,
    expiresIn: string,
  ): string {
    const maxAge = this.parseDurationToSeconds(expiresIn);
    const domain = this.configService.get<string>('app.auth.cookieDomain', '');

    return serialize(name, token, {
      httpOnly: true,
      secure:
        this.configService.get<string>('app.auth.cookieSecure', 'false') ===
        'true',
      sameSite: this.configService.get<'strict' | 'lax' | 'none'>(
        'app.auth.cookieSameSite',
        'lax',
      ),
      path: this.configService.get<string>('app.auth.cookiePath', '/'),
      maxAge,
      ...(domain ? { domain } : {}),
    });
  }

  private parseDurationToSeconds(value: string): number {
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new InternalServerErrorException(
        'Formato invalido para expiracion de token. Use 15m, 7d, etc.',
      );
    }

    const amount = Number(match[1]);
    const unit = match[2];

    if (unit === 's') return amount;
    if (unit === 'm') return amount * 60;
    if (unit === 'h') return amount * 3600;

    return amount * 86400;
  }

  private extractUserIdFromPayload(payload: string | JwtPayload): number {
    if (typeof payload === 'string') {
      throw new UnauthorizedException('Payload de token invalido');
    }

    const { id } = payload as JwtPayload & { id?: unknown };

    if (typeof id !== 'number') {
      throw new UnauthorizedException('Payload de token invalido');
    }

    return id;
  }
}
