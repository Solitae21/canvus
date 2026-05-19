# Canvus

Canvus is a TypeScript npm workspace for a collaborative flowchart and canvas application. It includes a Next.js web app, an Express API, a Socket.IO collaboration channel (with Redis pub/sub and Yjs CRDT support), Postgres-backed persistence via Prisma, and shared domain contracts used by both sides of the stack.

The app focuses on a rich browser canvas experience: flowchart shapes, connectors, labels, image placement, selection, drag and resize controls, keyboard shortcuts, undo/redo, zoom, pan, presenter mode, in-canvas chat, live cursors, and saved board snapshots.

> **Note:** The backend API is hosted on a free [Render](https://render.com) web service. Free-tier instances spin down after inactivity, so the **first request after a period of idle may take 30–60 seconds** to respond while the service cold-starts. Subsequent requests will be fast. Thank you for your patience.

## Tech Stack

- **Workspace:** npm workspaces
- **Web:** Next.js 16 (canary), React 19, Redux Toolkit, Tailwind CSS 4, shadcn/Radix-style components, lucide-react, Konva, react-konva, Auth.js (NextAuth v5) with Google OAuth, Yjs + y-socket.io, jsPDF for exports
- **API:** Express 4, Helmet, CORS, express-rate-limit, Socket.IO 4 with `@socket.io/redis-adapter`, Yjs server (y-socket.io), Prisma 7, TypeScript
- **Shared:** TypeScript canvas/domain types exported as `@canvus/shared`
- **Persistence:** Postgres via Prisma (users, boards, board members, board snapshots, NextAuth tables); Redis for Socket.IO pub/sub and active room membership; an additional in-memory canvas store powers the legacy `/canvases` REST routes
- **Runtime state:** browser `localStorage` for the local canvas working copy; Postgres for authenticated board snapshots

## Workspace Structure

```text
.
+-- apps
|   +-- web                 # Next.js application, auth routes, board APIs, canvas UI
|   +-- api                 # Express REST API + Socket.IO/Yjs server, Prisma client
+-- packages
|   +-- shared              # Shared canvas/domain TypeScript contracts
+-- package.json            # Root workspace scripts
+-- package-lock.json
+-- tsconfig.base.json      # Shared TypeScript defaults
```

### `apps/web`

The web app contains the landing/features/how-it-works marketing pages, sign-in/sign-up auth pages, the authenticated dashboard, the board and canvas pages, the Redux store, canvas components, REST/WS clients, and Next.js route handlers for board persistence.

Important areas:

- `app/`: Next.js app routes (landing, auth, dashboard, board, canvas) and layouts
- `app/api/auth/[...nextauth]/`: Auth.js (NextAuth v5) handler
- `app/api/boards/`: REST handlers for authenticated board listing, creation, snapshot reads and writes
- `auth.ts` / `middleware.ts`: NextAuth configuration and route protection
- `client/canvas/`: Konva canvas stage, shapes, connectors, labels, chat panel, cursor layer, presenter controls, board auto-saver, snapshot loader
- `client/landing-page/`, `client/features/`, `client/how-it-works/`, `client/brand/`, `client/layout/`, `client/modals/`, `client/guest/`: marketing and shell UI
- `components/`: shared UI primitives (shadcn-style)
- `lib/api.ts`: REST client for the Express API
- `lib/ws.ts`: Socket.IO client wrapper
- `lib/use-presence.ts`, `lib/canvas-export.ts`, `lib/canvas-security.ts`, `lib/random-name.ts`, `lib/guest.ts`: presence, PDF export, payload hardening, guest naming
- `redux/`: Redux store, hooks, RTK Query boards API, and `canvas`, `chat`, `presence`, `ui` slices

### `apps/api`

The API serves REST endpoints for canvases and hosts the Socket.IO collaboration channel (with Redis-backed pub/sub and Yjs awareness). It also exposes a Prisma client to the web app via the `@canvus/api/db` subpath export.

Important areas:

- `src/index.ts`: Express app, helmet, origin guard, CORS, rate limiter, JSON body parser, error handlers, HTTP server, Socket.IO attach point
- `src/env.ts`: environment defaults (`HOST`, `PORT`, `ALLOWED_ORIGIN`, `REDIS_URL`, `ALLOW_GLOBAL_CANVAS_LIST`, `NODE_ENV`) and origin allow-list check
- `src/validation.ts`: shared payload validation (identifiers, names, colors, image data URLs, shape and connection validation, query id-list parsing)
- `src/routes/health.ts`: health check route
- `src/routes/canvases.ts`: canvas REST routes (list, create, get, replace, rename, delete)
- `src/store/memory.ts`: in-memory canvas store backing the `/canvases` routes
- `src/ws/index.ts`: Socket.IO server, Redis adapter, room membership caching, sanitized `cursor:moved` / `presenter:viewport` relay, `user:left` notices, server broadcasts, Yjs (`y-socket.io`) integration
- `src/lib/prisma.ts`: shared Prisma client (re-exported as `@canvus/api/db`)
- `prisma/`: Prisma schema and migrations for users, accounts, sessions, boards, board members, and board snapshots

### `packages/shared`

The shared package exports the canvas domain model consumed by both `@canvus/web` and `@canvus/api`.

Important types include:

- `Canvas`, `CanvasSummary`
- `Shape`, `ShapeType`, `PlaceableShapeType`
- `Connection`, `ConnectionPort`
- `CursorMovedPayload`, `UserLeftPayload`, `PresenterViewportPayload`, `ChatMessage`

## Quick Start

### 1. Install dependencies

Run from the repository root:

```bash
npm install
```

The web app's `predev` and `prebuild` scripts run `prisma generate` in `@canvus/api` automatically, so make sure the Prisma schema and `DATABASE_URL` are configured before starting dev.

### 2. Configure environment files

Copy the provided examples:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

On Windows PowerShell:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
```

Default local values:

```env
# apps/api/.env
NODE_ENV=development
HOST=127.0.0.1
PORT=4000
ALLOWED_ORIGIN=http://localhost:3000
ALLOW_GLOBAL_CANVAS_LIST=false
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/canvus?schema=public
```

```env
# apps/web/.env
NEXT_PUBLIC_API_URL=http://localhost:4000

# Auth.js (NextAuth v5)
AUTH_SECRET=                # generate with: npx auth secret
AUTH_TRUST_HOST=true
# AUTH_URL=http://localhost:3000

# Google OAuth (https://console.cloud.google.com/apis/credentials)
# Authorized redirect URI: http://localhost:3000/api/auth/callback/google
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Must match apps/api/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/canvus?schema=public
```

`DATABASE_URL` must be identical in both `.env` files so the web app and API share the same database.

### 3. Provision Postgres and Redis

The API needs a reachable Postgres instance (for Prisma) and a reachable Redis instance (for Socket.IO pub/sub and room membership). The defaults assume local services at `localhost:5432` and `localhost:6379`.

Apply the Prisma schema:

```bash
npx prisma migrate dev --schema apps/api/prisma/schema.prisma
```

### 4. Start development servers

Run the web and API servers together:

```bash
npm run dev
```

Development URLs:

- Web app: `http://localhost:3000`
- API: `http://localhost:4000`
- API health check: `http://localhost:4000/health`
- Socket.IO endpoint: `http://localhost:4000/ws` (requires `canvasId` and `userId` query params)

## Scripts

Run workspace scripts from the repository root unless you are intentionally targeting one workspace.

| Command | Description |
| --- | --- |
| `npm run dev` | Start the web and API dev servers together. |
| `npm run dev:web` | Start only `@canvus/web` (runs `prisma generate` in the API workspace first). |
| `npm run dev:api` | Start only `@canvus/api`. |
| `npm run build` | Build all workspaces that define a build script. |
| `npm run lint` | Lint all workspaces that define a lint script. |
| `npm run typecheck` | Typecheck all workspaces that define a typecheck script. |
| `npm run generate -w @canvus/api` | Run `prisma generate` and compile the generated client. |
| `npm run start -w @canvus/api` | Run the compiled API server (`node dist/index.js`). |
| `npm run test:redis -w @canvus/api` | Run the API Redis/Socket.IO integration tests. |

Focused workspace examples:

```bash
npm run lint -w @canvus/web
npm run typecheck -w @canvus/api
npm run typecheck -w @canvus/shared
npm run test:redis -w @canvus/api
```

## Tests

Current test suites:

| Command | Workspace | Covers |
| --- | --- | --- |
| `npm run test:redis -w @canvus/api` | `@canvus/api` | Redis-backed Socket.IO behavior: room membership caching, disconnect cleanup, multi-socket user membership, and cross-instance `canvas:replaced` pub/sub delivery. |

The Redis test suite lives at `apps/api/test/redis-pubsub.test.ts`. It starts two API instances on ports `4001` and `4002`, connects Socket.IO clients to both instances, and inspects Redis directly with `ioredis`.

Requirements for `test:redis`:

- `REDIS_URL` must point at a reachable Redis instance.
- Ports `4001` and `4002` must be available.
- On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`.

## Environment Variables

### API (`apps/api/.env`)

| Variable | Default | Description |
| --- | --- | --- |
| `NODE_ENV` | `development` | Standard Node environment flag. |
| `HOST` | `127.0.0.1` | Interface the HTTP and Socket.IO server binds to. Use `0.0.0.0` only when LAN/container exposure is intended. |
| `PORT` | `4000` | Port for the HTTP and Socket.IO server. |
| `ALLOWED_ORIGIN` | `http://localhost:3000` | Comma-separated frontend origins allowed by CORS, the origin guard, and Socket.IO origin checks. Use `*` to allow any origin (not recommended). |
| `ALLOW_GLOBAL_CANVAS_LIST` | `false` | When `true`, `GET /canvases` without an `ids` query returns every canvas. Keep this disabled outside of trusted dev environments. |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL used by Socket.IO pub/sub, room membership caching, and Redis integration tests. |
| `DATABASE_URL` | — | Postgres connection URL used by Prisma. Must match the value in `apps/web/.env`. |

### Web (`apps/web/.env`)

| Variable | Default | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Base URL used by the web REST and Socket.IO clients. |
| `AUTH_SECRET` | — | Required. Used to sign Auth.js JWTs and CSRF tokens. Generate with `npx auth secret`. |
| `AUTH_TRUST_HOST` | `true` | Trust the host header behind a proxy. |
| `AUTH_URL` | — | Override the canonical site URL when running behind a non-default host. |
| `AUTH_GOOGLE_ID` | — | Google OAuth client ID. |
| `AUTH_GOOGLE_SECRET` | — | Google OAuth client secret. |
| `DATABASE_URL` | — | Postgres connection URL used by Prisma adapter for Auth.js and by `/api/boards/*` route handlers. Must match `apps/api/.env`. |

## Canvas Features

Authenticated boards are available at `/board/[id]`. A standalone (unauthenticated, localStorage-only) canvas is also available at `/canvas`.

Implemented behavior includes:

- Flowchart shape placement (process, decision, terminal, database, document, sticky note, image, and other supported types)
- Shape selection, multi-selection, drag, resize, delete, copy, paste, and duplicate
- Orthogonal connectors between shapes, connector labels, connector selection, color editing, and retargeting
- Shape labels with inline editing
- Image placement from file selection or pasted image data (validated as safe `data:image/*` URLs)
- Bottom toolbar with selection, hand/pan, shape, arrow, text, sticky, and image tools
- Right-side properties panel for selected shapes and connectors
- Undo/redo history for canvas mutations
- Keyboard shortcuts for common tools and editing operations
- Zoom and pan controls, including wheel and keyboard-driven zoom
- Live cursors with name and color presence
- In-canvas chat panel
- Presenter mode with follower viewport sync and laser pointer
- PDF export via jsPDF
- Browser `localStorage` persistence for the local canvas working copy
- Authenticated board snapshots persisted to Postgres (auto-saved on edits, hydrated on load)

Common keyboard shortcuts:

| Shortcut | Action |
| --- | --- |
| `V` | Select tool |
| `H` | Hand/pan tool |
| `R` | Process rectangle |
| `D` | Decision diamond |
| `O` | Terminal oval |
| `A` | Arrow/connector tool |
| `T` | Text tool |
| `S` | Sticky note |
| `Space` | Temporarily switch to hand/pan |
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Y` or `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Redo |
| `Ctrl+C` / `Cmd+C` | Copy selected shapes |
| `Ctrl+V` / `Cmd+V` | Paste copied shapes |
| `Ctrl+D` / `Cmd+D` | Duplicate selected shape |
| `Delete` / `Backspace` | Delete selection |
| Arrow keys | Nudge selected shape or shapes |
| `Shift` + arrow keys | Nudge by a larger step |
| `Ctrl+Plus` / `Cmd+Plus` | Zoom in |
| `Ctrl+Minus` / `Cmd+Minus` | Zoom out |
| `Ctrl+0` / `Cmd+0` | Reset zoom |
| `Escape` | Clear selection or pending connector |

## API

The Express API exposes JSON request/response endpoints. All routes are protected by helmet, an origin allow-list, CORS, a global rate limiter (300 requests / minute), and a 4 MB JSON body limit.

### Health

```http
GET /health
```

Response:

```json
{ "ok": true }
```

### List canvases

```http
GET /canvases?ids=<id,id,...>
```

Returns a `CanvasSummary[]` for the requested ids. Without an `ids` query, returns an empty array unless `ALLOW_GLOBAL_CANVAS_LIST=true`. At most 100 ids per request.

Errors:

- `400 invalid_query` if any id is malformed or the list exceeds 100 entries.

### Create canvas

```http
POST /canvases
Content-Type: application/json
```

Optional body:

```json
{ "name": "Untitled" }
```

If `name` is omitted or empty, the canvas is named `"Untitled"`. Returns `201` with the created `Canvas`.

### Get canvas

```http
GET /canvases/:id
```

Returns the full `Canvas`, or:

- `400 invalid_id` if the id is malformed.
- `404 not_found` if no canvas exists with that id.

### Replace canvas

```http
PUT /canvases/:id
Content-Type: application/json
```

Body:

```json
{
  "name": "Optional new name",
  "shapes": [],
  "connections": []
}
```

`shapes` and `connections` must be arrays. Shapes are limited to 1000 entries and connections to 2000. Each shape and connection is validated (identifier shape, numeric ranges, safe colors, control-character-stripped labels, valid `data:image/*` URLs for image sources, connections must reference existing shape ids, ids must be unique). `name` is optional; when omitted, the existing name is preserved.

On success, returns the updated `Canvas` and broadcasts a `canvas:replaced` envelope to the canvas Socket.IO room.

Errors:

- `400 invalid_id`, `400 invalid_body` (with a `detail` describing the failing field), `404 not_found`.

### Rename canvas

```http
PATCH /canvases/:id
Content-Type: application/json
```

Body:

```json
{ "name": "New name" }
```

Renames the canvas and broadcasts a `canvas:renamed` envelope to the room. Returns the updated `Canvas`.

Errors:

- `400 invalid_id`, `400 invalid_body` (`name must be a non-empty string`), `404 not_found`.

### Delete canvas

```http
DELETE /canvases/:id
```

Returns `204 No Content` on success, `400 invalid_id` for malformed ids, or `404 not_found` when missing.

## Web Board API

The Next.js app exposes authenticated board endpoints backed by Postgres via Prisma. All routes require a NextAuth session.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/boards` | List the signed-in user's boards (id, name, timestamps), most recently updated first. |
| `POST` | `/api/boards` | Create a new board owned by the signed-in user. Body: `{ "name"?: string }`. |
| `GET` | `/api/boards/:id` | Return board metadata plus the latest `BoardSnapshot` (shapes, connections, base64-encoded Yjs state). |
| `PATCH` | `/api/boards/:id` | Append a new `BoardSnapshot`. Body: `{ "state": base64, "shapes": [], "connections": [] }`. |

Unauthorized requests return `401 unauthorized`; missing/foreign boards return `404 not_found`; malformed JSON returns `400 invalid_json` or `400 invalid_body`.

## WebSocket / Collaboration Channel

The API hosts Socket.IO at path `/ws`. The same server also exposes a Yjs document channel via `y-socket.io`, which the web app uses for CRDT-based shape/connection state.

Clients connect with `canvasId` and `userId` query parameters; an optional `metadata` JSON string can supply the user's presence name and color:

```ts
io("http://localhost:4000", {
  path: "/ws",
  query: {
    canvasId,
    userId,
    metadata: JSON.stringify({ name, color }),
  },
  transports: ["websocket"],
});
```

Connection rules:

- Sockets missing or with invalid `canvasId` / `userId` are disconnected.
- Each socket joins a room named by `canvasId`.
- Room membership and per-user socket sets are cached in Redis with a 24-hour TTL.
- Inbound `message` events are rate-limited to 80 per second per socket.

### Inbound events (client → server)

Only sanitized envelopes are accepted; any other shape is dropped silently.

- `cursor:moved` — payload `{ x, y, name?, color?, laser? }`. Coordinates must be finite and within ±1,000,000. Name and color are normalized; `laser: true` is forwarded when present.
- `presenter:viewport` — payload `{ x, y, scale }`. Coordinates within ±1,000,000; scale within `[0.1, 4]`.

Sanitized envelopes are relayed to other clients in the same room (the sender does not receive their own message back).

### Outbound events (server → client)

All outbound messages share the envelope:

```ts
type WsEnvelope = {
  type: string;
  payload?: unknown;
  clientId?: string;
};
```

Known event types:

| `type` | Origin | Payload |
| --- | --- | --- |
| `cursor:moved` | Relay | `CursorMovedPayload` |
| `presenter:viewport` | Relay | `PresenterViewportPayload` |
| `user:left` | Server (`clientId: "server"`) | `UserLeftPayload` — emitted when the last socket for a user disconnects from a room |
| `canvas:replaced` | Server (`clientId: "server"`) | The full updated `Canvas`, after a successful `PUT /canvases/:id` |
| `canvas:renamed` | Server (`clientId: "server"`) | `{ id, name, updatedAt }`, after a successful `PATCH /canvases/:id` |

## Shared Canvas Model

The source of truth for canvas data contracts is `packages/shared/src/canvas.ts`.

```ts
interface Canvas {
  id: string;
  name: string;
  shapes: Shape[];
  connections: Connection[];
  updatedAt: string;
}

interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  fill: string;
  strokeColor: string;
  src?: string;       // only for "image" type shapes
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  fromPort?: ConnectionPort;  // "top" | "right" | "bottom" | "left"
  toPort?: ConnectionPort;
  color?: string;
  label?: string;
}

interface CursorMovedPayload {
  userId: string;
  x: number;
  y: number;
  name: string;
  color: string;
  laser?: boolean;
}

interface PresenterViewportPayload {
  userId: string;
  x: number;
  y: number;
  scale: number;
}
```

When changing canvas data, update `@canvus/shared` first, then align API validation/storage, `apps/web/lib/api.ts`, `apps/web/lib/ws.ts`, Redux state, and canvas rendering.

## Development Notes

- Keep shared wire shapes synchronized across `packages/shared`, `apps/api`, and `apps/web`.
- The `/canvases` REST store is intentionally in-memory; restarting the API clears those canvases. Authenticated boards persist in Postgres.
- The standalone `/canvas` page persists its local working copy to browser `localStorage`.
- Canvas mutation behavior should preserve undo/redo history.
- Rendering changes often need coordinated updates across shapes, connectors, labels, hit areas, selection, keyboard behavior, and the properties panel.
- Keep client-only canvas behavior inside client components and hooks (`"use client"`).
- Prisma client output is committed under `apps/api/src/generated/prisma`. After schema changes, run `npm run generate -w @canvus/api`.

## Verification

For documentation-only changes, no runtime test is required.

Useful checks for code changes:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:redis -w @canvus/api
```

For focused work, prefer the smallest relevant workspace check first:

```bash
npm run lint -w @canvus/web
npm run typecheck -w @canvus/api
npm run typecheck -w @canvus/shared
```
