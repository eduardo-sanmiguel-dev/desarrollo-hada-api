declare module 'cookie' {
  export interface CookieSerializeOptions {
    maxAge?: number;
    domain?: string;
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }

  export function parse(cookieHeader: string): Record<string, string>;
  export function serialize(
    name: string,
    value: string,
    options?: CookieSerializeOptions,
  ): string;

  const cookie: {
    parse: typeof parse;
    serialize: typeof serialize;
  };

  export default cookie;
}

declare module 'argon2' {
  export interface Options {
    type?: number;
    memoryCost?: number;
    timeCost?: number;
    parallelism?: number;
  }

  export interface Argon2Api {
    argon2id: number;
    hash(data: string, options?: Options): Promise<string>;
    verify(hash: string, plain: string): Promise<boolean>;
  }

  const argon2: Argon2Api;
  export default argon2;
}

declare module 'crypto-js' {
  export const enc: {
    Utf8: unknown;
  };

  export const AES: {
    decrypt(
      cipherText: string,
      key: string,
    ): {
      toString(encoder: unknown): string;
    };
  };

  const CryptoJS: {
    enc: typeof enc;
    AES: typeof AES;
  };

  export default CryptoJS;
}

declare module 'jsonwebtoken' {
  export interface SignOptions {
    expiresIn?: string | number;
  }

  export interface JwtPayload {
    [key: string]: unknown;
  }

  export function sign(
    payload: object,
    secret: string,
    options?: SignOptions,
  ): string;

  export function verify(token: string, secret: string): string | JwtPayload;
}

declare module 'xlsx-populate' {
  interface Cell {
    value(): unknown;
    value(value: unknown): Cell;
  }

  interface Sheet {
    cell(row: number, column: number): Cell;
  }

  interface Workbook {
    sheet(index: number): Sheet;
    toFileAsync(path: string): Promise<void>;
    outputAsync(): Promise<Uint8Array>;
  }

  const XlsxPopulate: {
    fromFileAsync(path: string): Promise<Workbook>;
  };

  export default XlsxPopulate;
}
