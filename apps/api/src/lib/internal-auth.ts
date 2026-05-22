import { timingSafeEqual } from 'node:crypto';
import type { Request, RequestHandler } from 'express';
import { INTERNAL_API_KEY } from '../env.js';

const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
};

/**
 * Guards routes that may only be called by a trusted backend (the web BFF),
 * never directly by a browser. The caller must present a matching `x-internal-key`.
 */
export const requireInternalKey: RequestHandler = (req, res, next) => {
  if (!INTERNAL_API_KEY) {
    console.error('INTERNAL_API_KEY is not set; refusing internal request');
    res.status(503).json({ error: 'internal_auth_unconfigured' });
    return;
  }
  const provided = req.header('x-internal-key');
  if (typeof provided !== 'string' || !safeEqual(provided, INTERNAL_API_KEY)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  next();
};

/** Reads the authenticated user id the BFF resolved from the session. */
export const getUserId = (req: Request): string | null => {
  const id = req.header('x-user-id');
  return typeof id === 'string' && id.length > 0 ? id : null;
};
