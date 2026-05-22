# Canvus API

The backend for the Canvus collaborative canvas editor. It's an Express.js server that provides a REST API for canvases (shapes + connections) and a Socket.IO WebSocket layer for real-time collaboration. Socket.IO uses a Redis adapter for cross-instance pub/sub and room membership, and a Yjs document channel is exposed via `y-socket.io` for CRDT-based collaborative state. A Prisma client (Postgres) is also bundled and re-exported to the Next.js app via the `@canvus/api/db` subpath.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Getting Started](#getting-started)
3. [Environment Variables](#environment-variables)
4. [Useful Commands](#useful-commands)
5. [REST Endpoints](#rest-endpoints)
6. [WebSocket / Real-time](#websocket--real-time)
7. [Persistence Layers](#persistence-layers)
8. [Validation Rules](#validation-rules)
9. [Shared Types](#shared-types)
10. [How to Add a New Endpoint](#how-to-add-a-new-endpoint)
11. [Common Pitfalls](#common-pitfalls)

---

## Project Structure

```
apps/api/
├── src/
│   ├── index.ts          ← Server entry: helmet, origin guard, CORS, rate limit, JSON parser, error handlers, HTTP server, Socket.IO
│   ├── env.ts            ← Reads env vars (HOST, PORT, ALLOWED_ORIGIN, REDIS_URL, ALLOW_GLOBAL_CANVAS_LIST, NODE_ENV) with defaults
│   ├── validation.ts     ← Payload validation: identifiers, names, colors, image data URLs, shape & connection validators
│   ├── routes/
│   │   ├── health.ts     ← GET /health — liveness check
│   │   └── canvases.ts   ← Canvas REST endpoints (list, create, get, replace, rename, delete)
│   ├── store/
│   │   └── memory.ts     ← In-memory store backing the /canvases routes (Map<string, Canvas>)
│   ├── ws/
│   │   └── index.ts      ← Socket.IO server, Redis adapter, room membership, sanitized message relay, Yjs (y-socket.io) integration
│   ├── lib/
│   │   └── prisma.ts     ← Shared Prisma client (re-exported as @canvus/api/db)
│   └── generated/prisma/ ← Generated Prisma client (committed; regenerate with `npm run generate`)
├── prisma/
│   ├── schema.prisma     ← User, Account, Session, VerificationToken, Board, BoardMember, BoardSnapshot
│   └── migrations/       ← Prisma migrations
├── test/
│   └── redis-pubsub.test.ts  ← Integration test: two API instances + Redis
├── .env.example          ← Template for required environment variables
├── package.json          ← Scripts and dependencies
├── tsconfig.json         ← Server TypeScript config
└── tsconfig.prisma-client.json  ← Compiles the generated Prisma client
```

**How the pieces connect:**

```
Client (browser)
    │
    ├── HTTP  →  Express routes (routes/canvases.ts)
    │                  ├── validation.ts (payload checks)
    │                  └── store/memory.ts (read/write)
    │                         └── on PUT/PATCH → broadcastToCanvas() → all WS clients in the room
    │
    └── WS    →  Socket.IO (ws/index.ts) at path /ws
                       ├── Redis pub/sub (cross-instance broadcasting + room membership)
                       ├── Sanitized cursor/viewport relay
                       └── Yjs document channel (y-socket.io) for shape state CRDT
```

The Next.js app additionally imports `prisma` from `@canvus/api/db` (the `./db` subpath export) to back its own `/api/boards/*` route handlers and NextAuth.

---

## Getting Started

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies from the workspace root:
   ```bash
   npm install
   ```

3. Generate the Prisma client (also runs automatically before web `dev`/`build`):
   ```bash
   npm run generate -w @canvus/api
   ```

4. Apply migrations against your Postgres instance:
   ```bash
   npx prisma migrate dev --schema apps/api/prisma/schema.prisma
   ```

5. Start the development server (hot-reloads on file changes):
   ```bash
   npm run dev:api
   ```
   The API will be available at `http://localhost:4000`.

The API needs reachable Postgres and Redis instances. Defaults assume `localhost:5432` and `localhost:6379`.

---

## Environment Variables

Defined in `src/env.ts` and loaded from `.env` via `dotenv`.

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Standard Node environment flag. Logged at startup. |
| `HOST` | `127.0.0.1` (dev) / `0.0.0.0` (production) | Interface the HTTP + WebSocket server binds to. Defaults to `0.0.0.0` when `NODE_ENV=production` so container/PaaS port scanners (e.g. Render) can detect the open port. Override explicitly to lock it down. |
| `PORT` | `4000` | Port the HTTP + WebSocket server listens on. |
| `ALLOWED_ORIGIN` | `http://localhost:3000` | Comma-separated frontend origins allowed by the origin guard, CORS, and Socket.IO origin checks. Use `*` to allow any origin (not recommended). |
| `ALLOW_GLOBAL_CANVAS_LIST` | `false` | When `true`, `GET /canvases` without an `ids` query returns every in-memory canvas. Keep disabled outside trusted dev. |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL for Socket.IO pub/sub, active room membership, and Redis integration tests. |
| `DATABASE_URL` | — | Postgres connection URL used by Prisma. Must match the value in `apps/web/.env` so web and API share the DB. |

---

## Useful Commands

Run from the workspace root (`canvus/`) unless noted.

| Command | What it does |
|---|---|
| `npm run dev:api` | Start API in dev mode with hot reload (`tsx watch`) |
| `npm run generate -w @canvus/api` | Run `prisma generate` and compile the generated client |
| `npm run build -w @canvus/api` | Compile TypeScript to `dist/` |
| `npm run start -w @canvus/api` | Run the compiled server (`node dist/index.js`) — for production |
| `npm run start:dev -w @canvus/api` | Run the compiled server with `NODE_ENV=development` |
| `npm run typecheck -w @canvus/api` | Check types without emitting files |
| `npm run lint -w @canvus/api` | Lint `src/` with ESLint |
| `npm run test:redis -w @canvus/api` | Run Redis/Socket.IO integration tests |

### Tests

The API has one integration test suite:

| Command | Test file | Covers |
|---|---|---|
| `npm run test:redis -w @canvus/api` | `apps/api/test/redis-pubsub.test.ts` | Redis-backed Socket.IO room membership caching, disconnect cleanup, multi-socket user membership, and cross-instance `canvas:replaced` pub/sub delivery. |

This suite starts two API instances on ports `4001` and `4002`, connects Socket.IO clients to both, and inspects Redis directly with `ioredis`.

Before running it:

- Set `REDIS_URL` to a reachable Redis instance.
- Make sure ports `4001` and `4002` are free.
- On Windows PowerShell, run `npm.cmd run test:redis -w @canvus/api` if execution policy blocks `npm.ps1`.

---

## Middleware Stack

`src/index.ts` registers the following middleware in order before any route:

1. `app.disable('x-powered-by')`
2. `helmet()` — secure default headers
3. Origin guard — rejects requests whose `Origin` header is not in `ALLOWED_ORIGIN` with `403 origin_not_allowed`
4. `cors()` — allows the same origin allow-list
5. `express-rate-limit` — 300 requests / minute, draft-8 standard headers
6. `express.json({ limit: '4mb' })` — JSON body parser
7. JSON syntax error handler — returns `400 invalid_json` for malformed JSON
8. Routes (`/health`, `/canvases/*`)
9. Final error handler — returns `413 payload_too_large` for size errors, otherwise `500 internal_error`

---

## REST Endpoints

### Quick Reference

| Method | Path | Description | Success Status |
|---|---|---|---|
| GET | `/health` | Liveness check | 200 |
| GET | `/canvases?ids=<id,id>` | List requested canvas summaries | 200 |
| POST | `/canvases` | Create a new canvas | 201 |
| GET | `/canvases/:id` | Get one canvas (full data) | 200 |
| PUT | `/canvases/:id` | Replace shapes, connections, and optionally name | 200 |
| PATCH | `/canvases/:id` | Rename a canvas | 200 |
| DELETE | `/canvases/:id` | Delete a canvas | 204 |

---

### GET /health

Liveness probe.

**Response:**
```json
{ "ok": true }
```

---

### GET /canvases

Returns summary metadata for requested canvas IDs. Does **not** include shapes or connections.

Without `ids`, returns an empty list to avoid exposing every in-memory canvas ID. Set `ALLOW_GLOBAL_CANVAS_LIST=true` only for trusted development or after adding real authentication. The `ids` query may be a single comma-separated string or repeated parameter, and is capped at **100 ids** per request.

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Flowchart",
    "updatedAt": "2026-05-01T10:00:00.000Z"
  }
]
```

**Response (400) — invalid query:**
```json
{ "error": "invalid_query", "detail": "ids contains an invalid id" }
```

---

### POST /canvases

Creates a new, empty canvas.

**Request body (optional):**
```json
{ "name": "My New Canvas" }
```

The name is trimmed, stripped of control characters, and limited to 120 characters. If `name` is missing or empty, the canvas is named `"Untitled"`.

**Response (201):**
```json
{
  "id": "550e8400-...",
  "name": "My New Canvas",
  "shapes": [],
  "connections": [],
  "updatedAt": "2026-05-01T10:00:00.000Z"
}
```

---

### GET /canvases/:id

Returns the full canvas including all shapes and connections.

**Response (200):**
```json
{
  "id": "550e8400-...",
  "name": "My Flowchart",
  "shapes": [ /* Shape objects */ ],
  "connections": [ /* Connection objects */ ],
  "updatedAt": "2026-05-01T10:00:00.000Z"
}
```

**Response (400) — bad id:** `{ "error": "invalid_id" }`
**Response (404) — not found:** `{ "error": "not_found" }`

---

### PUT /canvases/:id

Replaces the entire canvas state. The frontend calls this whenever a user-saved change should be persisted to the API store. After saving, the server broadcasts a `canvas:replaced` envelope to all WebSocket clients in the room.

**Request body:**
```json
{
  "name": "Optional new name",
  "shapes": [ /* array of Shape objects */ ],
  "connections": [ /* array of Connection objects */ ]
}
```

- `shapes` and `connections` **must** be arrays (even if empty).
- Shapes are capped at **1000**, connections at **2000**.
- Every shape and connection is validated — see [Validation Rules](#validation-rules).
- `name` is optional; if omitted, the existing name is preserved.

**Response (200):** Updated `Canvas` object.

**Response (400) — invalid id or body:**
```json
{ "error": "invalid_body", "detail": "shape.fill is invalid" }
```

**Response (404):** `{ "error": "not_found" }`

---

### PATCH /canvases/:id

Renames a canvas without replacing its shapes/connections. After saving, broadcasts a `canvas:renamed` envelope to the room.

**Request body:**
```json
{ "name": "New name" }
```

The name is trimmed, stripped of control characters, and limited to 120 characters. An empty or missing name returns `400`.

**Response (200):** Updated `Canvas` object.

**Response (400):**
```json
{ "error": "invalid_body", "detail": "name must be a non-empty string" }
```

**Response (404):** `{ "error": "not_found" }`

---

### DELETE /canvases/:id

Permanently deletes a canvas from the in-memory store.

**Response (204):** Empty body.

**Response (400):** `{ "error": "invalid_id" }`
**Response (404):** `{ "error": "not_found" }`

---

## WebSocket / Real-time

The API exposes Socket.IO at path `/ws` for live presence and server broadcasts, and a Yjs document channel (via `y-socket.io`) for CRDT-based collaborative state.

Multiple browser tabs/users editing the same canvas see each other's cursors, presenter viewport, and server-emitted canvas events instantly. Across multiple API instances, broadcasts are fanned out via the `@socket.io/redis-adapter`.

### Connecting

```
ws://localhost:4000/ws?canvasId=<canvasId>&userId=<userId>&metadata=<json>
```

- `canvasId` and `userId` are **required** and must match `^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$`. Without them, the server immediately disconnects.
- `metadata` is an optional JSON string with `{ name?, color? }` for presence. Names are stripped of control characters and trimmed to 80 chars. Colors must match `transparent` or `#RGB`/`#RRGGBB`/`#RRGGBBAA`.

On connect, the socket joins a Socket.IO room named after the canvas ID, and its membership is cached in Redis under:

- `room:<canvasId>` — hash of `user:<userId>` → JSON metadata
- `room:<canvasId>:user:<userId>:sockets` — set of socket IDs

Both keys carry a 24-hour TTL that refreshes on activity.

### Inbound events (client → server)

Inbound `message` events are rate-limited to **80 per second per socket**. Only the following envelope shapes are accepted; anything else is silently dropped.

| `type` | Payload | Notes |
|---|---|---|
| `cursor:moved` | `{ x, y, name?, color?, laser? }` | Coordinates within ±1,000,000; name/color sanitized; relayed as `CursorMovedPayload` with `clientId = userId` |
| `presenter:viewport` | `{ x, y, scale }` | Coordinates within ±1,000,000; scale within `[0.1, 4]` |

Sanitized envelopes are relayed to **other** clients in the same room (the sender does not receive their own message back).

### Outbound events (server → client)

All outbound messages share the envelope:

```typescript
{
  type: string;
  payload?: unknown;
  clientId?: string;  // "server" for server-originated messages
}
```

| `type` | Origin | Payload | Trigger |
|---|---|---|---|
| `cursor:moved` | Relay | `CursorMovedPayload` | Inbound cursor message |
| `presenter:viewport` | Relay | `PresenterViewportPayload` | Inbound presenter viewport |
| `user:left` | `clientId: "server"` | `{ userId }` | Last socket for a user disconnected from the room |
| `canvas:replaced` | `clientId: "server"` | Full updated `Canvas` | Successful `PUT /canvases/:id` |
| `canvas:renamed` | `clientId: "server"` | `{ id, name, updatedAt }` | Successful `PATCH /canvases/:id` |

Server broadcasts are sent via:

```typescript
export function broadcastToCanvas(canvasId: string, envelope: unknown): void {
  io?.to(canvasId).emit('message', envelope);
}
```

### Yjs channel

In addition to Socket.IO `message` events, the same server initializes `YSocketIO` so the web client can sync a Yjs document for shape/connection state without polling REST. Use the canvas id as the document name to align with the room.

---

## Persistence Layers

There are three persistence surfaces in this codebase:

1. **In-memory store (`src/store/memory.ts`)** — backs the `/canvases` REST routes. Data lives in a `Map` keyed by canvas ID and is **lost when the server restarts**.

   ```typescript
   list(ids?: string[]): CanvasSummary[]
   get(id: string): Canvas | undefined
   create(name?: string): Canvas
   replace(id: string, data: { name?: string; shapes: Shape[]; connections: Connection[] }): Canvas | undefined
   rename(id: string, name: string): Canvas | undefined
   remove(id: string): boolean
   ```

   New IDs come from `crypto.randomUUID()` with a timestamp-based fallback.

2. **Redis** — Socket.IO pub/sub adapter, plus active room membership and per-user socket sets (see [WebSocket](#websocket--real-time)).

3. **Postgres via Prisma (`prisma/schema.prisma`)** — stores Auth.js users, accounts, sessions, verification tokens, plus the `Board`, `BoardMember`, and `BoardSnapshot` models used by the Next.js app's `/api/boards/*` routes. The Prisma client is exposed to the web app via the `@canvus/api/db` subpath export:

   ```ts
   import { prisma } from "@canvus/api/db";
   ```

   Schema highlights:

   - `Board` — id, name, owner (User), shapes/connections JSON, timestamps, members, snapshots
   - `BoardMember` — owner/editor/viewer role per (board, user)
   - `BoardSnapshot` — versioned snapshot with shapes JSON, connections JSON, base64-decoded Yjs `state` bytes, optional author

   The Express API does not currently mutate these tables itself — they are owned by the web `/api/boards/*` routes.

---

## Validation Rules

`src/validation.ts` exports validators reused by canvas routes and the WebSocket layer. Notable rules:

- **Identifiers** (`canvasId`, `userId`, shape ids, connection ids): `^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$`
- **Names** (canvas, presence): control characters stripped, trimmed; canvas names limited to 120 chars, presence names to 80
- **Labels** (shape/connection): control characters except `\t \n \r` stripped, trimmed, capped at 2000 chars
- **Colors** (`fill`, `strokeColor`, `connection.color`, presence color): `transparent` or `#RGB`/`#RRGGBB`/`#RRGGBBAA`, max 32 chars
- **Image data URLs** (`shape.src` for `type === 'image'`): only `data:image/(png|jpe?g|webp|gif);base64,…`, up to 3 MB
- **Numbers**: shape `x`/`y` within ±1,000,000; `w`/`h` within `(0, 10000]`
- **Counts**: at most 1000 shapes and 2000 connections per canvas; at most 100 ids per `GET /canvases?ids=` query
- **Connections**: `fromId`/`toId` must reference shapes that exist in the same payload; ports must be `top`/`right`/`bottom`/`left`; ids unique

When validation fails, the route returns `400` with a `detail` describing the failing field.

---

## Shared Types

Defined in `packages/shared/src/canvas.ts` and imported by the API.

### Shape

```typescript
interface Shape {
  id: string;
  type: ShapeType;       // one of the 18 shape names below
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  fill: string;          // any safe CSS color string
  strokeColor: string;
  src?: string;          // only for "image" type shapes
}
```

**Valid `ShapeType` values:** `rect`, `rounded-rect`, `diamond`, `oval`, `parallelogram`, `trapezoid`, `hexagon`, `cylinder`, `document`, `predefined-process`, `manual-input`, `stored-data`, `internal-storage`, `circle`, `off-page`, `delay`, `sticky`, `image`

### Connection

```typescript
interface Connection {
  id: string;
  fromId: string;
  toId: string;
  fromPort?: "top" | "right" | "bottom" | "left";
  toPort?: "top" | "right" | "bottom" | "left";
  color?: string;
  label?: string;
}
```

### Canvas

```typescript
interface Canvas {
  id: string;
  name: string;
  shapes: Shape[];
  connections: Connection[];
  updatedAt: string;  // ISO 8601
}
```

### CanvasSummary

```typescript
interface CanvasSummary {
  id: string;
  name: string;
  updatedAt: string;
}
```

### Presence / collaboration payloads

```typescript
interface CursorMovedPayload {
  userId: string;
  x: number;
  y: number;
  name: string;
  color: string;
  laser?: boolean;
}

interface UserLeftPayload {
  userId: string;
}

interface PresenterViewportPayload {
  userId: string;
  x: number;
  y: number;
  scale: number;
}
```

---

## How to Add a New Endpoint

As an example, let's add `POST /canvases/:id/duplicate` to duplicate an existing canvas.

**Step 1 — Add the route handler in `src/routes/canvases.ts`**

```typescript
canvasesRouter.post('/canvases/:id/duplicate', (req, res) => {
  const { id } = req.params;
  if (!isValidIdentifier(id)) {
    res.status(400).json({ error: 'invalid_id' });
    return;
  }

  const original = store.get(id);
  if (!original) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  const name = normalizeCanvasName(req.body?.name) ?? `${original.name} (copy)`;
  const duplicate = store.create(name);
  const updated = store.replace(duplicate.id, {
    shapes: original.shapes,
    connections: original.connections,
  })!;

  res.status(201).json(updated);

  // If the duplicate's room should be notified (rarely needed for a fresh id):
  // broadcastToCanvas(updated.id, { type: 'canvas:replaced', payload: updated, clientId: 'server' });
});
```

**Step 2 — Typecheck**

```bash
npm run typecheck -w @canvus/api
```

**Step 3 — Manual smoke test**

```bash
curl -X POST http://localhost:4000/canvases/<existing-id>/duplicate \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"name": "My Copy"}'
```

(The `Origin` header is required — the API's origin guard rejects requests from origins outside `ALLOWED_ORIGIN`.)

---

## Common Pitfalls

| Problem | Cause | Fix |
|---|---|---|
| Canvas data from `/canvases` disappears on restart | That store is in-memory | Expected. Authenticated boards persist in Postgres via the web `/api/boards/*` routes. |
| Frontend gets `403 origin_not_allowed` | Request has no `Origin` matching `ALLOWED_ORIGIN` | Set `ALLOWED_ORIGIN` to the frontend URL (comma-separated for multiple origins, or `*` for any). |
| Frontend gets CORS errors | Same as above | Same fix. The origin guard and `cors()` use the same allow-list. |
| `429 Too Many Requests` | More than 300 requests/minute from one IP | Spread the workload or tune the limiter in `src/index.ts`. |
| `413 payload_too_large` | Body exceeds 4 MB | Reduce payload size, or raise the `express.json({ limit })` value if you really need it. |
| WebSocket client disconnects immediately | `canvasId` or `userId` query param is missing or fails the identifier regex | Always connect with valid identifiers; metadata is optional. |
| `PUT /canvases/:id` returns 400 with a `detail` | A shape/connection failed validation | Read the `detail` field — it names the offending field (`shape.fill is invalid`, `connection.fromId is invalid`, etc.). |
| Socket.IO works on one instance but not across instances | `REDIS_URL` not set or not shared | Both instances must point at the same Redis. |
| Prisma client errors on import | Client not generated for the current schema | Run `npm run generate -w @canvus/api`. The web `dev`/`build` scripts also trigger this automatically. |
| TypeScript errors after changing a shared type | `@canvus/shared` types changed but API wasn't updated | Update `packages/shared` first, then align validation, store, and routes here. |
