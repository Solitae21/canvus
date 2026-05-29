import { timingSafeEqual } from 'node:crypto';

/**
 * Constant-time string comparison. Returns false (without leaking timing) when
 * lengths differ, otherwise compares with `timingSafeEqual` so an attacker
 * cannot learn the secret byte-by-byte from response timing.
 */
export const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
};
