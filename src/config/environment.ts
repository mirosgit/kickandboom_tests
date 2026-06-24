import { config } from 'dotenv';

config();

const DEFAULT_BASE_URL = 'https://kickandboom.com/dt/';

function normalizeUrl(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

export const env = {
  baseUrl: normalizeUrl(process.env.BASE_URL ?? DEFAULT_BASE_URL),
  isCi: process.env.CI === 'true'
} as const;
