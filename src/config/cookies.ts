import type { CookieOptions } from 'express';

const isProd = () => process.env.NODE_ENV === 'production';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * ONE_DAY_MS;

const cookieConfig = {
    accessToken: (): CookieOptions => ({
        httpOnly: true,
        secure: isProd(),
        sameSite: 'lax',
        maxAge: ONE_DAY_MS,
        path: '/',
    }),
    refreshToken: (): CookieOptions => ({
        httpOnly: true,
        secure: isProd(),
        sameSite: 'lax',
        maxAge: THIRTY_DAYS_MS,
        path: '/',
    }),
    generic: (): CookieOptions => ({
        httpOnly: false,
        secure: isProd(),
        sameSite: 'lax',
        path: '/',
    })
} as const;

export default cookieConfig;


