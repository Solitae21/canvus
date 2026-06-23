import { Router } from 'express';
import * as Y from 'yjs';
import type { ChatMessage, Connection, Shape } from '@canvus/shared';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/async-handler.js';
import { getUserId, requireInternalKey } from '../lib/internal-auth.js';
import { broadcastToCanvas } from '../ws/index.js';
import {
  isRecord,
  isSafeColor,
  isValidIdentifier,
  normalizeLabel,
  normalizePresenceName,
  validateCanvasPayload,
} from '../validation.js';

export const boardsRouter: Router = Router();

// Every board route is internal-only and acts on behalf of the BFF-resolved user.
boardsRouter.use(requireInternalKey);

const MAX_NAME_LENGTH = 120;
const CONTROL_CHARS_RE = /[\x00-\x1F\x7F]/g;
const BASE64_RE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const MAX_BOARD_STATE_BYTES = 3_000_000;
const MAX_CHAT_MESSAGES = 500;
const MAX_CHAT_TEXT_LENGTH = 1000;
const MAX_FUTURE_TIMESTAMP_MS = 24 * 60 * 60 * 1000;
const DEFAULT_CHAT_SENDER = 'User';
const DEFAULT_CHAT_COLOR = '#60a5fa';

const normalizeName = (value: unknown): string => {
  if (typeof value !== 'string') return 'Untitled board';
  const trimmed = value.replace(CONTROL_CHARS_RE, '').trim().slice(0, MAX_NAME_LENGTH);
  return trimmed.length > 0 ? trimmed : 'Untitled board';
};

const decodeBase64State = (value: string): Buffer | null => {
  if (value.length === 0 || value.length > Math.ceil((MAX_BOARD_STATE_BYTES * 4) / 3)) {
    return null;
  }
  if (value.length % 4 !== 0 || !BASE64_RE.test(value)) {
    return null;
  }
  const bytes = Buffer.from(value, 'base64');
  return bytes.length > 0 && bytes.length <= MAX_BOARD_STATE_BYTES ? bytes : null;
};

const normalizeChatMessage = (value: unknown, now: number): ChatMessage | null => {
  if (!isRecord(value)) return null;
  if (!isValidIdentifier(value.id) || !isValidIdentifier(value.senderId)) return null;
  if (typeof value.text !== 'string') return null;
  if (
    typeof value.timestamp !== 'number' ||
    !Number.isFinite(value.timestamp) ||
    value.timestamp < 0 ||
    value.timestamp > now + MAX_FUTURE_TIMESTAMP_MS
  ) {
    return null;
  }

  const text = normalizeLabel(value.text).slice(0, MAX_CHAT_TEXT_LENGTH);
  if (!text) return null;

  return {
    id: value.id,
    senderId: value.senderId,
    senderName: normalizePresenceName(value.senderName) ?? DEFAULT_CHAT_SENDER,
    senderColor: isSafeColor(value.senderColor) ? value.senderColor : DEFAULT_CHAT_COLOR,
    text,
    timestamp: value.timestamp,
  };
};

const sanitizeChatMessages = (values: unknown[]): ChatMessage[] => {
  const now = Date.now();
  return values
    .slice(-MAX_CHAT_MESSAGES)
    .map((value) => normalizeChatMessage(value, now))
    .filter((value): value is ChatMessage => Boolean(value));
};

const toArrayBufferBytes = (value: Uint8Array): Uint8Array<ArrayBuffer> => {
  const bytes = new Uint8Array(value.byteLength);
  bytes.set(value);
  return bytes;
};

const sanitizeYjsState = (
  stateBytes: Buffer,
): { ok: true; stateBytes: Uint8Array<ArrayBuffer>; shapes: Shape[]; connections: Connection[] } | { ok: false; detail: string } => {
  const sourceDoc = new Y.Doc();
  try {
    Y.applyUpdate(sourceDoc, stateBytes);
  } catch {
    sourceDoc.destroy();
    return { ok: false, detail: 'state is not a valid Yjs update' };
  }

  const payload = validateCanvasPayload({
    shapes: Array.from(sourceDoc.getMap<unknown>('shapes').values()),
    connections: Array.from(sourceDoc.getMap<unknown>('connections').values()),
  });
  if (!payload.ok) {
    sourceDoc.destroy();
    return { ok: false, detail: payload.detail };
  }

  const chatMessages = sanitizeChatMessages(sourceDoc.getArray<unknown>('chat').toArray());
  sourceDoc.destroy();

  const sanitizedDoc = new Y.Doc();
  const shapesMap = sanitizedDoc.getMap<Shape>('shapes');
  const connectionsMap = sanitizedDoc.getMap<Connection>('connections');
  const chatArray = sanitizedDoc.getArray<ChatMessage>('chat');

  sanitizedDoc.transact(() => {
    for (const shape of payload.value.shapes) shapesMap.set(shape.id, shape);
    for (const connection of payload.value.connections) connectionsMap.set(connection.id, connection);
    if (chatMessages.length > 0) chatArray.push(chatMessages);
  });

  const sanitizedStateBytes = toArrayBufferBytes(Y.encodeStateAsUpdate(sanitizedDoc));
  sanitizedDoc.destroy();
  return {
    ok: true,
    stateBytes: sanitizedStateBytes,
    shapes: payload.value.shapes,
    connections: payload.value.connections,
  };
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

    // Check ownership before any expensive work (base64 decode, Yjs
    // apply/re-encode) so a caller cannot burn CPU on boards they don't own.
    const owned = await prisma.board.findFirst({
      where: { id, ownerId: userId },
      select: { id: true },
    });
    if (!owned) {
      res.status(404).json({ error: 'not_found' });
      return;
    }

    const body = (req.body ?? {}) as {
      name?: unknown;
      state?: unknown;
      shapes?: unknown;
      connections?: unknown;
    };

    const hasName = body.name !== undefined;
    const hasSnapshot =
      body.state !== undefined || body.shapes !== undefined || body.connections !== undefined;

    if (!hasName && !hasSnapshot) {
      res.status(400).json({ error: 'invalid_body' });
      return;
    }
    if (hasName && typeof body.name !== 'string') {
      res.status(400).json({ error: 'invalid_body', detail: 'name must be a string' });
      return;
    }

    // Name-only update (rename): skip the snapshot work entirely.
    if (!hasSnapshot) {
      const board = await prisma.board.update({
        where: { id },
        data: { name: normalizeName(body.name) },
        select: { id: true, name: true, createdAt: true, updatedAt: true },
      });
      broadcastToCanvas(`board:${id}`, {
        type: 'canvas:renamed',
        payload: { id: board.id, name: board.name, updatedAt: board.updatedAt },
        clientId: 'server',
      });
      res.json(board);
      return;
    }

    if (
      typeof body.state !== 'string' ||
      !Array.isArray(body.shapes) ||
      !Array.isArray(body.connections)
    ) {
      res.status(400).json({ error: 'invalid_body' });
      return;
    }

    const payload = validateCanvasPayload({
      shapes: body.shapes,
      connections: body.connections,
    });
    if (!payload.ok) {
      res.status(400).json({ error: 'invalid_body', detail: payload.detail });
      return;
    }

    const stateBytes = decodeBase64State(body.state);
    if (!stateBytes) {
      res.status(400).json({ error: 'invalid_state' });
      return;
    }
    const sanitized = sanitizeYjsState(stateBytes);
    if (!sanitized.ok) {
      res.status(400).json({ error: 'invalid_state', detail: sanitized.detail });
      return;
    }

    const [snapshot] = await prisma.$transaction([
      prisma.boardSnapshot.create({
        data: {
          boardId: id,
          authorId: userId,
          shapes: sanitized.shapes as never,
          connections: sanitized.connections as never,
          state: sanitized.stateBytes,
        },
        select: { id: true, createdAt: true },
      }),
      prisma.board.update({
        where: { id },
        data: hasName ? { name: normalizeName(body.name) } : {},
        select: { id: true },
      }),
    ]);

    res.json({ id: snapshot.id, createdAt: snapshot.createdAt });
  }),
);
