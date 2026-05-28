import { createHmac, timingSafeEqual } from 'node:crypto';
import { INTERNAL_API_KEY } from '../env.js';
import { isValidIdentifier } from '../validation.js';

type BoardSocketTokenPayload = {
  boardId: string;
  roomId: string;
  userId: string;
  exp: number;
};

const MAX_TOKEN_LENGTH = 4096;
const MAX_CLOCK_SKEW_SECONDS = 30;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const sign = (encodedPayload: string): string =>
  createHmac('sha256', INTERNAL_API_KEY).update(encodedPayload).digest('base64url');

const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
};

const parsePayload = (value: unknown): BoardSocketTokenPayload | null => {
  if (!isRecord(value)) return null;
  const { boardId, roomId, userId, exp } = value;
  if (
    !isValidIdentifier(boardId) ||
    typeof roomId !== 'string' ||
    !isValidIdentifier(roomId) ||
    !isValidIdentifier(userId) ||
    typeof exp !== 'number' ||
    !Number.isInteger(exp)
  ) {
    return null;
  }
  return { boardId, roomId, userId, exp };
};

export const verifyBoardSocketToken = (token: unknown): BoardSocketTokenPayload | null => {
  if (!INTERNAL_API_KEY || typeof token !== 'string' || token.length > MAX_TOKEN_LENGTH) {
    return null;
  }

  const [encodedPayload, signature, extra] = token.split('.');
  if (!encodedPayload || !signature || extra !== undefined) return null;
  if (!safeEqual(signature, sign(encodedPayload))) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  const payload = parsePayload(parsed);
  if (!payload) return null;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp + MAX_CLOCK_SKEW_SECONDS < now) return null;
  return payload;
};
