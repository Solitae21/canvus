# Canvus API

The backend for the Canvus collaborative canvas editor. It's an Express.js server that provides a REST API for managing canvases (shapes + connections) and a Socket.IO WebSocket layer for real-time collaboration.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Getting Started](#getting-started)
3. [Environment Variables](#environment-variables)
4. [Useful Commands](#useful-commands)
5. [REST Endpoints](#rest-endpoints)
6. [WebSocket / Real-time](#websocket--real-time)
7. [In-Memory Store](#in-memory-store)
8. [Shared Types](#shared-types)
9. [How to Add a New Endpoint](#how-to-add-a-new-endpoint)
10. [Common Pitfalls](#common-pitfalls)

---

## Project Structure

```
apps/api/
├── src/
│   ├── index.ts          ← Server entry point: creates Express app, attaches middleware, registers routes, starts Socket.IO
│   ├── env.ts            ← Reads PORT and ALLOWED_ORIGIN from process.env (with defaults)
│   ├── routes/
│   │   ├── health.ts     ← GET /health — simple liveness check
│   │   └── canvases.ts   ← All canvas CRUD endpoints (list, create, get, update, delete)
│   ├── store/
│   │   └── memory.ts     ← In-memory data store using a JavaScript Map; all canvas data lives here
│   └── ws/
│       └── index.ts      ← Socket.IO server setup and broadcastToCanvas() helper
├── .env.example          ← Template for required environment variables
├── package.json          ← Scripts and dependencies
└── tsconfig.json         ← TypeScript compiler config
```

**How the pieces connect:**

```
Client (browser)
    │
    ├── HTTP  →  Express routes (routes/canvases.ts)
    │                  └── reads/writes → store/memory.ts
    │                         └── on PUT → broadcastToCanvas() → all WS clients
    │
    └── WS    →  Socket.IO (ws/index.ts)
                       └── relays messages between clients in the same canvas room
```

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

3. Start the development server (hot-reloads on file changes):
   ```bash
   npm run dev:api
   ```
   The API will be available at `http://localhost:4000`.

---

## Environment Variables

Defined in `src/env.ts` and loaded from the `.env` file.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | The port the HTTP + WebSocket server listens on |
| `ALLOWED_ORIGIN` | `http://localhost:3000` | The frontend origin allowed by CORS. Requests from any other origin will be blocked. |

---

## Useful Commands

Run these from the workspace root (`canvus/`) unless noted.

| Command | What it does |
|---|---|
| `npm run dev:api` | Start API in dev mode with hot reload (`tsx watch`) |
| `npm run build -w @canvus/api` | Compile TypeScript to `dist/` |
| `npm run start -w @canvus/api` | Run the compiled server (`node dist/index.js`) — for production |
| `npm run typecheck -w @canvus/api` | Check types without emitting files |
| `npm run lint -w @canvus/api` | Lint `src/` with ESLint |

---

## REST Endpoints

### Quick Reference

| Method | Path | Description | Success Status |
|---|---|---|---|
| GET | `/health` | Liveness check | 200 |
| GET | `/canvases` | List all canvases (summaries) | 200 |
| POST | `/canvases` | Create a new canvas | 201 |
| GET | `/canvases/:id` | Get one canvas (full data) | 200 |
| PUT | `/canvases/:id` | Replace canvas shapes & connections | 200 |
| DELETE | `/canvases/:id` | Delete a canvas | 204 |

---

### GET /health

Lets you quickly check that the server is running.

**Response:**
```json
{ "ok": true }
```

---

### GET /canvases

Returns a summary list of all canvases. Does **not** include shapes or connections — just the metadata.

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

---

### POST /canvases

Creates a new, empty canvas.

**Request body (optional):**
```json
{ "name": "My New Canvas" }
```
If `name` is omitted, the canvas will be named `"Untitled"`.

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

**Response (404) — canvas not found:**
```json
{ "error": "not_found" }
```

---

### PUT /canvases/:id

Replaces the entire canvas state (shapes and connections). This is the main endpoint the frontend calls whenever the user makes a change. After saving, the server broadcasts the new state to all WebSocket clients in that canvas room.

**Request body (required):**
```json
{
  "name": "Optional new name",
  "shapes": [ /* array of Shape objects */ ],
  "connections": [ /* array of Connection objects */ ]
}
```
- `shapes` and `connections` **must** be arrays (even if empty).
- `name` is optional; if omitted, the existing name is preserved.

**Response (200):** Updated Canvas object (same shape as GET /canvases/:id).

**Response (400) — bad request:**
```json
{ "error": "invalid_body", "detail": "shapes and connections must be arrays" }
```

**Response (404) — canvas not found:**
```json
{ "error": "not_found" }
```

---

### DELETE /canvases/:id

Permanently deletes a canvas from the in-memory store.

**Response (204):** Empty body.

**Response (404):** `{ "error": "not_found" }`

---

## WebSocket / Real-time

The API uses [Socket.IO](https://socket.io) for real-time collaboration. Multiple browser tabs/users editing the same canvas will see each other's changes instantly.

### Connecting

```
ws://localhost:4000/ws?canvasId=<canvasId>
```

The `canvasId` query parameter is **required**. Without it, the server will immediately disconnect the client.

On connect, the client is placed into a Socket.IO "room" named after the canvas ID. This ensures messages are only sent to clients viewing the same canvas.

### Message Events

| Event | Direction | Description |
|---|---|---|
| `message` | Client → Server | Any message the client wants to relay to other clients |
| `message` | Server → Client | Relayed messages from other clients, or server broadcasts |

### Message Envelope Format

All messages use this envelope shape:

```typescript
{
  type: string;       // identifies what kind of message this is
  payload?: unknown;  // the actual data
  clientId?: string;  // who sent it ("server" for server-originated messages)
}
```

### Message Flow

```
Client A                    Server                    Client B
   │                          │                          │
   │── emit("message", msg) ──►│                          │
   │                          │── emit("message", msg) ──►│
   │                          │   (relayed to all other   │
   │                          │    clients in canvas room) │
```

Client A's message is **not** sent back to Client A — only to other clients in the same room.

### Server-initiated Broadcasts

When `PUT /canvases/:id` succeeds, the server automatically broadcasts the updated canvas to all connected clients:

```typescript
// Sent automatically after every successful PUT
{
  type: "canvas:replaced",
  payload: Canvas,       // the full updated canvas object
  clientId: "server"
}
```

This is handled by the `broadcastToCanvas()` function in `src/ws/index.ts`:

```typescript
export function broadcastToCanvas(canvasId: string, envelope: unknown): void {
  io?.to(canvasId).emit('message', envelope);
}
```

---

## In-Memory Store

`src/store/memory.ts` is the entire data layer. All canvas data is stored in a JavaScript `Map` keyed by canvas ID.

> **Important:** There is no database. Data is stored in process memory and **will be lost when the server restarts.**

### Store Functions

```typescript
// Return a summary list of all canvases (no shapes/connections)
list(): CanvasSummary[]

// Return one full canvas by ID, or undefined if it doesn't exist
get(id: string): Canvas | undefined

// Create a new canvas with an optional name (default: "Untitled")
create(name?: string): Canvas

// Replace shapes and connections for an existing canvas
// Returns the updated canvas, or undefined if the ID doesn't exist
replace(id: string, data: { name?: string; shapes: Shape[]; connections: Connection[] }): Canvas | undefined

// Delete a canvas. Returns true if it existed, false if not found
remove(id: string): boolean
```

### ID Generation

New canvas IDs are generated with `crypto.randomUUID()` (UUID v4), with a timestamp-based fallback for environments that don't support the Web Crypto API.

---

## Shared Types

These TypeScript types are defined in `packages/shared/src/canvas.ts` and imported by the API. You'll need to know them when working with request/response bodies.

### Shape

```typescript
interface Shape {
  id: string;
  type: ShapeType;       // one of the 18 shape names listed below
  x: number;            // x position on the canvas
  y: number;            // y position on the canvas
  w: number;            // width
  h: number;            // height
  label: string;        // text displayed inside the shape
  fill: string;         // background color (any CSS color string)
  strokeColor: string;  // border color (any CSS color string)
  src?: string;         // only for "image" type shapes
}
```

**Valid ShapeType values:** `rect`, `rounded-rect`, `diamond`, `oval`, `parallelogram`, `trapezoid`, `hexagon`, `cylinder`, `document`, `predefined-process`, `manual-input`, `stored-data`, `internal-storage`, `circle`, `off-page`, `delay`, `sticky`, `image`

### Connection

```typescript
interface Connection {
  id: string;
  fromId: string;                                  // ID of the source Shape
  toId: string;                                    // ID of the target Shape
  fromPort?: "top" | "right" | "bottom" | "left"; // connection point on source
  toPort?: "top" | "right" | "bottom" | "left";   // connection point on target
  color?: string;                                  // line color
  label?: string;                                  // label shown on the line
}
```

### Canvas

```typescript
interface Canvas {
  id: string;
  name: string;
  shapes: Shape[];
  connections: Connection[];
  updatedAt: string;  // ISO 8601 timestamp, e.g. "2026-05-01T10:00:00.000Z"
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

---

## How to Add a New Endpoint

Here's a step-by-step walkthrough for adding a new REST endpoint. As an example, let's add `POST /canvases/:id/duplicate` to duplicate an existing canvas.

**Step 1 — Add the route handler in `src/routes/canvases.ts`**

```typescript
// POST /canvases/:id/duplicate
router.post('/:id/duplicate', (req, res) => {
  // Step 2: Get the existing canvas from the store
  const original = store.get(req.params.id);
  if (!original) {
    return res.status(404).json({ error: 'not_found' });
  }

  // Step 3: Validate any request body fields (if needed)
  const name = typeof req.body?.name === 'string'
    ? req.body.name
    : `${original.name} (copy)`;

  // Step 4: Call the store to create/mutate data
  const duplicate = store.create(name);
  store.replace(duplicate.id, {
    shapes: original.shapes,
    connections: original.connections,
  });

  // Step 5: Return the response with the appropriate status code
  const result = store.get(duplicate.id)!;
  return res.status(201).json(result);

  // Step 6 (optional): Broadcast to WebSocket clients if the change
  // affects a shared canvas room
  // broadcastToCanvas(canvasId, { type: 'canvas:replaced', payload: result, clientId: 'server' });
});
```

**Step 2 — Run the type checker to make sure nothing is broken**

```bash
npm run typecheck -w @canvus/api
```

**Step 3 — Test your endpoint**

```bash
curl -X POST http://localhost:4000/canvases/<existing-id>/duplicate \
  -H "Content-Type: application/json" \
  -d '{"name": "My Copy"}'
```

---

## Common Pitfalls

| Problem | Cause | Fix |
|---|---|---|
| All canvas data disappears on server restart | Data is stored in memory, not a database | Expected behavior — add a database if persistence is needed |
| Frontend gets CORS errors | `ALLOWED_ORIGIN` in `.env` doesn't match the frontend URL | Set `ALLOWED_ORIGIN=http://localhost:3000` (or wherever the frontend runs) |
| WebSocket client disconnects immediately | `canvasId` query param is missing from the connection URL | Always connect with `?canvasId=<id>` |
| `PUT /canvases/:id` returns 400 | `shapes` or `connections` is missing or not an array in the body | Always send both fields, even if they're empty arrays `[]` |
| TypeScript errors after changing a shared type | `@canvus/shared` types changed but API wasn't updated | Update `packages/shared` first, then fix the API to match |
