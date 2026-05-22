import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/async-handler.js';
import { requireInternalKey } from '../lib/internal-auth.js';

export const authRouter: Router = Router();

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

authRouter.post(
  '/internal/auth/register',
  requireInternalKey,
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const name =
      typeof req.body?.name === 'string' && req.body.name.trim().length > 0
        ? req.body.name.trim().slice(0, 80)
        : null;

    if (!EMAIL_RE.test(email)) {
      res.status(400).json({ error: 'Enter a valid email address.' });
      return;
    }
    if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
      res.status(400).json({ error: `Password must be ${MIN_PASSWORD}–${MAX_PASSWORD} characters.` });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'An account with that email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { email, name, passwordHash } });
    res.status(201).json({ ok: true });
  }),
);

authRouter.post(
  '/internal/auth/verify-credentials',
  requireInternalKey,
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || password.length === 0) {
      res.status(401).json({ error: 'invalid_credentials' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: 'invalid_credentials' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      image: user.image ?? null,
    });
  }),
);
