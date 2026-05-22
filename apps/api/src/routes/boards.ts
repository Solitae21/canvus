import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/async-handler.js';
import { getUserId, requireInternalKey } from '../lib/internal-auth.js';

export const boardsRouter: Router = Router();

// Every board route is internal-only and acts on behalf of the BFF-resolved user.
boardsRouter.use(requireInternalKey);

const MAX_NAME_LENGTH = 120;
const CONTROL_CHARS_RE = /[\x00-\x1F\x7F]/g;

const normalizeName = (value: unknown): string => {
  if (typeof value !== 'string') return 'Untitled board';
  const trimmed = value.replace(CONTROL_CHARS_RE, '').trim().slice(0, MAX_NAME_LENGTH);
  return trimmed.length > 0 ? trimmed : 'Untitled board';
};

boardsRouter.get(
  '/internal/boards',
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    if (!userId) {
      res.status(400).json({ error: 'missing_user' });
      return;
    }

    const boards = await prisma.board.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(boards);
  }),
);

boardsRouter.post(
  '/internal/boards',
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    if (!userId) {
      res.status(400).json({ error: 'missing_user' });
      return;
    }

    const name = normalizeName(req.body?.name);
    const board = await prisma.board.create({
      data: { name, ownerId: userId },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    res.status(201).json(board);
  }),
);

boardsRouter.get(
  '/internal/boards/:id',
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    if (!userId) {
      res.status(400).json({ error: 'missing_user' });
      return;
    }
    const { id } = req.params;

    const board = await prisma.board.findFirst({
      where: { id, ownerId: userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        snapshots: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            shapes: true,
            connections: true,
            state: true,
            createdAt: true,
          },
        },
      },
    });

    if (!board) {
      res.status(404).json({ error: 'not_found' });
      return;
    }

    const snapshot = board.snapshots[0] ?? null;
    res.json({
      id: board.id,
      name: board.name,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      snapshot: snapshot
        ? {
            id: snapshot.id,
            shapes: snapshot.shapes,
            connections: snapshot.connections,
            state: Buffer.from(snapshot.state).toString('base64'),
            createdAt: snapshot.createdAt,
          }
        : null,
    });
  }),
);

boardsRouter.patch(
  '/internal/boards/:id',
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    if (!userId) {
      res.status(400).json({ error: 'missing_user' });
      return;
    }
    const { id } = req.params;

    const body = (req.body ?? {}) as { state?: unknown; shapes?: unknown; connections?: unknown };
    if (
      typeof body.state !== 'string' ||
      !Array.isArray(body.shapes) ||
      !Array.isArray(body.connections)
    ) {
      res.status(400).json({ error: 'invalid_body' });
      return;
    }

    const stateBytes = Buffer.from(body.state, 'base64');
    if (stateBytes.length === 0) {
      res.status(400).json({ error: 'invalid_state' });
      return;
    }

    const owned = await prisma.board.findFirst({
      where: { id, ownerId: userId },
      select: { id: true },
    });
    if (!owned) {
      res.status(404).json({ error: 'not_found' });
      return;
    }

    const [snapshot] = await prisma.$transaction([
      prisma.boardSnapshot.create({
        data: {
          boardId: id,
          authorId: userId,
          shapes: body.shapes as never,
          connections: body.connections as never,
          state: stateBytes,
        },
        select: { id: true, createdAt: true },
      }),
      prisma.board.update({
        where: { id },
        data: {},
        select: { id: true },
      }),
    ]);

    res.json({ id: snapshot.id, createdAt: snapshot.createdAt });
  }),
);
