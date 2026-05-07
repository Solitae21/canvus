import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import type { Server as HttpServer } from 'node:http';
import { REDIS_URL } from '../env.js';

export let io: Server;

const getQueryString = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const parseMembershipMetadata = (value: string | undefined): Record<string, unknown> => {
  if (!value) return {};

  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {}

  return {};
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
  metadata: Record<string, unknown>,
): Promise<void> => {
  await redis.sadd(roomUserSocketsKey(canvasId, userId), socketId);
  await redis.hset(roomMembershipKey(canvasId), roomUserField(userId), JSON.stringify(metadata));
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
  return false;
};

export async function attachSocketIO(server: HttpServer, allowedOrigin: string): Promise<void> {
  io = new Server(server, {
    cors: { origin: allowedOrigin },
    path: '/ws',
  });

  const pubClient = new Redis(REDIS_URL);
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', async (socket) => {
    const canvasId = getQueryString(socket.handshake.query.canvasId);
    const userId = getQueryString(socket.handshake.query.userId);

    if (!canvasId || !userId) {
      socket.disconnect();
      return;
    }

    const metadata = parseMembershipMetadata(getQueryString(socket.handshake.query.metadata));

    socket.join(canvasId);

    try {
      await cacheRoomMembership(pubClient, canvasId, userId, socket.id, metadata);
    } catch (error) {
      console.error('Failed to cache room membership', error);
      socket.disconnect();
      return;
    }

    socket.on('message', (envelope: unknown) => {
      socket.to(canvasId).emit('message', envelope);
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
