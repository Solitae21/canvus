import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import type { Server as HttpServer } from 'node:http';
import type { CursorMovedPayload } from '@canvus/shared';
import { YSocketIO } from 'y-socket.io/dist/server';
import { ALLOWED_ORIGINS, REDIS_URL, isAllowedOrigin } from '../env.js';
import {
  isSafeColor,
  isValidIdentifier,
  normalizePresenceName,
} from '../validation.js';

export let io: Server;

type ClientEnvelope = {
  type: string;
  payload?: unknown;
  clientId?: string;
};

type MembershipMetadata = {
  name?: string;
  color?: string;
};

const MAX_METADATA_LENGTH = 2048;
const MAX_CURSOR_COORDINATE = 1_000_000;
const MESSAGE_LIMIT_PER_SECOND = 80;
const ROOM_TTL_SECONDS = 24 * 60 * 60;
const DEFAULT_CURSOR_NAME = 'Guest';
const DEFAULT_CURSOR_COLOR = '#60a5fa';

const getQueryString = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const parseMembershipMetadata = (value: string | undefined): MembershipMetadata => {
  if (!value || value.length > MAX_METADATA_LENGTH) return {};

  try {
    const parsed: unknown = JSON.parse(value);
    if (isRecord(parsed)) {
      const metadata: MembershipMetadata = {};
      const name = normalizePresenceName(parsed.name);
      if (name) metadata.name = name;
      if (isSafeColor(parsed.color)) metadata.color = parsed.color;
      return metadata;
    }
  } catch {
    return {};
  }

  return {};
};

const createMessageRateLimiter = (): (() => boolean) => {
  let windowStart = Date.now();
  let count = 0;

  return () => {
    const now = Date.now();
    if (now - windowStart >= 1000) {
      windowStart = now;
      count = 0;
    }
    count += 1;
    return count <= MESSAGE_LIMIT_PER_SECOND;
  };
};

const parseCursorMessage = (
  envelope: unknown,
  userId: string,
  metadata: MembershipMetadata,
): ClientEnvelope | null => {
  if (!isRecord(envelope) || envelope.type !== 'cursor:moved' || !isRecord(envelope.payload)) {
    return null;
  }

  const payload = envelope.payload;
  const x = payload.x;
  const y = payload.y;
  if (
    typeof x !== 'number' ||
    typeof y !== 'number' ||
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    Math.abs(x) > MAX_CURSOR_COORDINATE ||
    Math.abs(y) > MAX_CURSOR_COORDINATE
  ) {
    return null;
  }

  const normalizedPayload: CursorMovedPayload = {
    userId,
    x,
    y,
    name: normalizePresenceName(payload.name) ?? metadata.name ?? DEFAULT_CURSOR_NAME,
    color: isSafeColor(payload.color) ? payload.color : metadata.color ?? DEFAULT_CURSOR_COLOR,
  };

  return {
    type: 'cursor:moved',
    payload: normalizedPayload,
    clientId: userId,
  };
};

const roomMembershipKey = (canvasId: string): string => `room:${canvasId}`;
const roomUserField = (userId: string): string => `user:${userId}`;
const roomUserSocketsKey = (canvasId: string, userId: string): string =>
  `room:${canvasId}:user:${userId}:sockets`;

const cacheRoomMembership = async (
  redis: Redis,
  canvasId: string,
  userId: string,
  socketId: string,
  metadata: MembershipMetadata,
): Promise<void> => {
  const membershipKey = roomMembershipKey(canvasId);
  const socketsKey = roomUserSocketsKey(canvasId, userId);

  await redis
    .multi()
    .sadd(socketsKey, socketId)
    .hset(membershipKey, roomUserField(userId), JSON.stringify(metadata))
    .expire(socketsKey, ROOM_TTL_SECONDS)
    .expire(membershipKey, ROOM_TTL_SECONDS)
    .exec();
};

const removeRoomMembership = async (
  redis: Redis,
  canvasId: string,
  userId: string,
  socketId: string,
): Promise<boolean> => {
  const socketsKey = roomUserSocketsKey(canvasId, userId);

  await redis.srem(socketsKey, socketId);
  const socketCount = await redis.scard(socketsKey);

  if (socketCount === 0) {
    await redis.hdel(roomMembershipKey(canvasId), roomUserField(userId));
    await redis.del(socketsKey);
    return true;
  }
  await redis.expire(socketsKey, ROOM_TTL_SECONDS);
  return false;
};

export async function attachSocketIO(server: HttpServer): Promise<void> {
  io = new Server(server, {
    allowRequest: (req, callback) => {
      callback(null, isAllowedOrigin(req.headers.origin));
    },
    cors: {
      origin: ALLOWED_ORIGINS.includes('*') ? true : ALLOWED_ORIGINS,
    },
    path: '/ws',
  });

  const pubClient = new Redis(REDIS_URL);
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));

  const ysocketio = new YSocketIO(io);
  ysocketio.initialize();

  io.on('connection', async (socket) => {
    const canvasId = getQueryString(socket.handshake.query.canvasId);
    const userId = getQueryString(socket.handshake.query.userId);

    if (!isValidIdentifier(canvasId) || !isValidIdentifier(userId)) {
      socket.disconnect();
      return;
    }

    const metadata = parseMembershipMetadata(getQueryString(socket.handshake.query.metadata));
    const allowMessage = createMessageRateLimiter();

    socket.join(canvasId);

    try {
      await cacheRoomMembership(pubClient, canvasId, userId, socket.id, metadata);
    } catch (error) {
      console.error('Failed to cache room membership', error);
      socket.disconnect();
      return;
    }

    socket.on('message', (envelope: unknown) => {
      if (!allowMessage()) return;
      const sanitized = parseCursorMessage(envelope, userId, metadata);
      if (sanitized) socket.to(canvasId).emit('message', sanitized);
    });

    socket.on('disconnect', () => {
      socket.leave(canvasId);
      void removeRoomMembership(pubClient, canvasId, userId, socket.id)
        .then((userFullyLeft) => {
          if (userFullyLeft) {
            io.to(canvasId).emit('message', { type: 'user:left', payload: { userId } });
          }
        })
        .catch((error) => {
          console.error('Failed to remove room membership', error);
        });
    });
  });
}

export function broadcastToCanvas(canvasId: string, envelope: unknown): void {
  io?.to(canvasId).emit('message', envelope);
}
