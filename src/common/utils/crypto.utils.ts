
// src/common/utils/crypto.util.ts
import * as crypto from 'crypto';

export function randomKey(): string {
  return 'sk_live_' + crypto.randomBytes(24).toString('hex');
}

export function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function expiryToDate(code: '1H' | '1D' | '1M' | '1Y'): Date {
  const now = new Date();
  const d = new Date(now);
  switch (code) {
    case '1H': d.setHours(d.getHours() + 1); break;
    case '1D': d.setDate(d.getDate() + 1); break;
    case '1M': d.setMonth(d.getMonth() + 1); break;
    case '1Y': d.setFullYear(d.getFullYear() + 1); break;
  }
  return d;
}
