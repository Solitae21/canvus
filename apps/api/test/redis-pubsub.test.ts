import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { io as connect, type Socket } from 'socket.io-client';

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

function spawnInstance(port: number): ChildProcess {
  return spawn(process.execPath, [TSX_CLI, SRC_INDEX], {
    env: { ...process.env, PORT: String(port), ALLOWED_ORIGIN: '*' },
    stdio: 'pipe',
  });
}

async function waitForHealth(port: number, timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://localhost:${port}/health`);
      if (res.ok) return;
    } catch {}
    await new Promise<void>(r => setTimeout(r, 300));
  }
  throw new Error(`Port ${port} did not become healthy within ${timeoutMs}ms`);
}

function connectSocket(port: number, canvasId: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = connect(`http://localhost:${port}`, {
      path: '/ws',
      query: { canvasId },
      transports: ['websocket'],
    });
    socket.once('connect', () => resolve(socket));
    socket.once('connect_error', reject);
  });
}

function nextMessage(socket: Socket, timeoutMs = 5_000): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`No message received within ${timeoutMs}ms — Redis pub/sub may not be routing across instances`)),
      timeoutMs,
    );
    socket.once('message', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

before(async () => {
  proc1 = spawnInstance(PORT_1);
  proc2 = spawnInstance(PORT_2);
  await Promise.all([waitForHealth(PORT_1), waitForHealth(PORT_2)]);
});

after(() => {
  proc1?.kill();
  proc2?.kill();
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
    connectSocket(PORT_1, canvas.id),
    connectSocket(PORT_2, canvas.id),
  ]);

  try {
    // Arm listener on clientB before triggering the update
    const pending = nextMessage(clientB);

    // PUT to instance 1 → broadcastToCanvas → Redis adapter publishes → instance 2 delivers to clientB
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
