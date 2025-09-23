"use client";

// Minimal client-side env reader: return env as-is or fallback to defaults

const DEFAULTS = {
  APP_NAME: "T3Game",
  API_URL: "http://localhost:5000/v1",
  SOCKET_URL: "http://localhost:5000",
  APP_VERSION: "1.0.0",
} as const;

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULTS.API_URL);
export const SOCKET_URL = (process.env.NEXT_PUBLIC_SOCKET_URL ?? DEFAULTS.SOCKET_URL);
export const APP_NAME = (process.env.NEXT_PUBLIC_APP_NAME ?? DEFAULTS.APP_NAME);
export const APP_VERSION = (process.env.NEXT_PUBLIC_APP_VERSION ?? DEFAULTS.APP_VERSION);

export const env = {
  API_URL,
  SOCKET_URL,
  APP_NAME,
  APP_VERSION,
} as const;

export default env;


