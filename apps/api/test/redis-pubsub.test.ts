import { test, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { io as connect, type Socket } from 'socket.io-client';
import { Redis } from 'ioredis';
import { REDIS_URL } from '../src/env.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_INDEX = join(__dirname, '..', 'src', 'index.ts');
const PORT_1 = 4001;
const PORT_2 = 4002;

// Resolve tsx CLI as a JS file so we can spawn `node tsx-cli src/index.ts`
// without relying on shell or .cmd wrappers (avoids Node 24 DEP0190 warning
// and Windows path issues).
const require = createRequire(import.meta.url);
const TSX_CLI = require.resolve('tsx/cli');

let proc1: ChildProcess;
let proc2: ChildProcess;
let redis: Redis;
const roomsToClean = new Map<string, Set<string>>();

type SocketOptions = {
  userId: string;
  metadata?: Record<string, unknown> | string;
};

const roomMembershipKey = (canvasId: string): string => `room:${canvasId}`;
const roomUserField = (userId: string): string => `user:${userId}`;
const roomUserSocketsKey = (canvasId: string, userId: string): string =>
  `room:${canvasId}:user:${userId}:sockets`;

function spawnInstance(port: number): ChildProcess {
  return spawn(process.execPath, [TSX_CLI, SRC_INDEX], {
    env: { ...process.env, PORT: String(port), ALLOWED_ORIGIN: '*' },
    stdio: 'pipe',
  });
}

function trackRoom(canvasId: string, userId: string): void {
  const userIds = roomsToClean.get(canvasId) ?? new Set<string>();
  userIds.add(userId);
  roomsToClean.set(canvasId, userIds);
}

async function cleanupTrackedRooms(): Promise<void> {
  for (const [canvasId, userIds] of roomsToClean) {
    const keys = [
      roomMembershipKey(canvasId),
      ...Array.from(userIds, (userId) => roomUserSocketsKey(canvasId, userId)),
    ];

    await redis.del(...keys);
  }

  roomsToClean.clear();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(port: number, timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://localhost:${port}/health`);
      if (res.ok) return;
    } catch {}
    await delay(300);
  }
  throw new Error(`Port ${port} did not become healthy within ${timeoutMs}ms`);
}

async function getMembership(canvasId: string, userId: string): Promise<string | null> {
  return redis.hget(roomMembershipKey(canvasId), roomUserField(userId));
}

async function waitForMembership(canvasId: string, userId: string, timeoutMs = 5_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const value = await getMembership(canvasId, userId);
    if (value !== null) return value;
    await delay(100);
  }

  throw new Error(`Membership ${roomMembershipKey(canvasId)} ${roomUserField(userId)} was not cached`);
}

async function waitForMembershipRemoval(canvasId: string, userId: string, timeoutMs = 5_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const value = await getMembership(canvasId, userId);
    if (value === null) return;
    await delay(100);
  }

  throw new Error(`Membership ${roomMembershipKey(canvasId)} ${roomUserField(userId)} was not removed`);
}

async function waitForSocketCount(
  canvasId: string,
  userId: string,
  expectedCount: number,
  timeoutMs = 5_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  const socketsKey = roomUserSocketsKey(canvasId, userId);

  while (Date.now() < deadline) {
    const count = await redis.scard(socketsKey);
    if (count === expectedCount) return;
    await delay(100);
  }

  throw new Error(`${socketsKey} did not reach socket count ${expectedCount}`);
}

function connectSocket(port: number, canvasId: string, options: SocketOptions): Promise<Socket> {
  const query: Record<string, string> = {
    canvasId,
    userId: options.userId,
  };

  if (options.metadata !== undefined) {
    query.metadata = typeof options.metadata === 'string' ? options.metadata : JSON.stringify(options.metadata);
  }

  trackRoom(canvasId, options.userId);

  return new Promise((resolve, reject) => {
    const socket = connect(`http://localhost:${port}`, {
      path: '/ws',
      query,
      transports: ['websocket'],
    });
    socket.once('connect', () => resolve(socket));
    socket.once('connect_error', reject);
  });
}

function nextMessage(socket: Socket, timeoutMs = 5_000): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`No message received within ${timeoutMs}ms - Redis pub/sub may not be routing across instances`)),
      timeoutMs,
    );
    socket.once('message', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

before(async () => {
  redis = new Redis(REDIS_URL);
  proc1 = spawnInstance(PORT_1);
  proc2 = spawnInstance(PORT_2);
  await Promise.all([waitForHealth(PORT_1), waitForHealth(PORT_2)]);
});

afterEach(async () => {
  await cleanupTrackedRooms();
});

after(async () => {
  proc1?.kill();
  proc2?.kill();
  await redis.quit();
});

test('WebSocket connection caches active room membership in Redis', async () => {
  const canvasId = 'redis-membership-cache-test';
  const userId = 'membership-user-a';
  const metadata = { name: 'Ada', color: '#2563eb' };
  const client = await connectSocket(PORT_1, canvasId, { userId, metadata });

  try {
    const rawMembership = await waitForMembership(canvasId, userId);
    assert.deepEqual(JSON.parse(rawMembership), metadata);
  } finally {
    client.disconnect();
  }
});

test('WebSocket disconnect removes room membership from Redis', async () => {
  const canvasId = 'redis-membership-disconnect-test';
  const userId = 'membership-user-b';
  const client = await connectSocket(PORT_1, canvasId, {
    userId,
    metadata: { name: 'Grace' },
  });

  await waitForMembership(canvasId, userId);

  client.disconnect();
  await waitForMembershipRemoval(canvasId, userId);
});

test('room membership remains until the user final socket disconnects', async () => {
  const canvasId = 'redis-membership-multisocket-test';
  const userId = 'membership-user-c';
  const [clientA, clientB] = await Promise.all([
    connectSocket(PORT_1, canvasId, { userId, metadata: { tab: 'a' } }),
    connectSocket(PORT_2, canvasId, { userId, metadata: { tab: 'b' } }),
  ]);

  try {
    await waitForSocketCount(canvasId, userId, 2);
    await waitForMembership(canvasId, userId);

    clientA.disconnect();
    await waitForSocketCount(canvasId, userId, 1);
    assert.notEqual(await getMembership(canvasId, userId), null);

    clientB.disconnect();
    await waitForMembershipRemoval(canvasId, userId);
  } finally {
    clientA.disconnect();
    clientB.disconnect();
  }
});

test('canvas:replaced event crosses from instance 1 to instance 2 via Redis pub/sub', async () => {
  // Create a canvas on instance 1 (only lives in instance 1's in-memory store)
  const createRes = await fetch(`http://localhost:${PORT_1}/canvases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'redis-pubsub-test' }),
  });
  assert.equal(createRes.status, 201);
  const canvas = (await createRes.json()) as { id: string };

  // Both clients join the same canvas room, but on different server instances
  const [clientA, clientB] = await Promise.all([
    connectSocket(PORT_1, canvas.id, { userId: 'pubsub-user-a', metadata: { name: 'A' } }),
    connectSocket(PORT_2, canvas.id, { userId: 'pubsub-user-b', metadata: { name: 'B' } }),
  ]);

  try {
    // Arm listener on clientB before triggering the update
    const pending = nextMessage(clientB);

    // PUT to instance 1 -> broadcastToCanvas -> Redis adapter publishes -> instance 2 delivers to clientB
    const putRes = await fetch(`http://localhost:${PORT_1}/canvases/${canvas.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'updated', shapes: [], connections: [] }),
    });
    assert.equal(putRes.status, 200);

    const envelope = (await pending) as { type: string };
    assert.equal(envelope.type, 'canvas:replaced');
  } finally {
    clientA.disconnect();
    clientB.disconnect();
  }
});
