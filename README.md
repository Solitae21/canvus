# Canvus

Canvus is a TypeScript npm workspace for a collaborative flowchart and canvas application. It includes a Next.js web app, an Express API, a Socket.IO collaboration channel, and shared domain contracts used by both sides of the stack.

The current app focuses on a rich browser canvas experience: flowchart shapes, connectors, labels, image placement, selection, drag and resize controls, keyboard shortcuts, undo/redo, zoom, pan, and local canvas state persistence.

> **Note:** The backend API is hosted on a free [Render](https://render.com) web service. Free-tier instances spin down after inactivity, so the **first request after a period of idle may take 30–60 seconds** to respond while the service cold-starts. Subsequent requests will be fast. Thank you for your patience.

## Tech Stack

- **Workspace:** npm workspaces
- **Web:** Next.js 16, React 19, Redux Toolkit, Tailwind CSS 4, shadcn/Radix-style components, lucide-react, Konva, react-konva
- **API:** Express, CORS, Socket.IO, TypeScript
- **Shared:** TypeScript canvas/domain types exported as `@canvus/shared`
- **Runtime state:** browser `localStorage` for the current web canvas state; in-memory API store for API-created canvases

## Workspace Structure

```text
.
+-- apps
|   +-- web                 # Next.js application and interactive canvas UI
|   +-- api                 # Express REST API and Socket.IO server
+-- packages
|   +-- shared              # Shared canvas/domain TypeScript contracts
+-- package.json            # Root workspace scripts
+-- package-lock.json
+-- tsconfig.base.json      # Shared TypeScript defaults
```

### `apps/web`

The web app contains the landing page, canvas page, Redux store, canvas components, API client, and Socket.IO client.

Important areas:

- `app/`: Next.js app routes and layout
- `client/canvas/`: Konva canvas stage, shapes, connectors, labels, keyboard behavior, and panels
- `components/`: shared UI components such as the toolbar
- `lib/api.ts`: REST client for the API
- `lib/ws.ts`: Socket.IO client wrapper
- `redux/`: Redux store, hooks, and canvas/UI slices

### `apps/api`

The API serves simple REST endpoints for canvases and hosts the Socket.IO collaboration channel.

Important areas:

- `src/index.ts`: Express app, HTTP server, CORS, JSON body limit, route registration, Socket.IO attach point
- `src/env.ts`: API environment defaults
- `src/routes/health.ts`: health check route
- `src/routes/canvases.ts`: canvas CRUD routes
- `src/store/memory.ts`: in-memory canvas store
- `src/ws/index.ts`: Socket.IO room handling and broadcasts

### `packages/shared`

The shared package exports the canvas domain model consumed by both `@canvus/web` and `@canvus/api`.

Important types include:

- `Canvas`
- `CanvasSummary`
- `Shape`
- `ShapeType`
- `PlaceableShapeType`
- `Connection`
- `ConnectionPort`

## Quick Start

### 1. Install dependencies

Run from the repository root:

```bash
npm install
```

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
PORT=4000
ALLOWED_ORIGIN=http://localhost:3000
```

```env
# apps/web/.env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Start development servers

Run the web and API servers together:

```bash
npm run dev
```

Development URLs:

- Web app: `http://localhost:3000`
- API: `http://localhost:4000`
- API health check: `http://localhost:4000/health`
- Socket.IO endpoint: `http://localhost:4000/ws`

## Scripts

Run workspace scripts from the repository root unless you are intentionally targeting one workspace.

| Command | Description |
| --- | --- |
| `npm run dev` | Start the web and API dev servers together. |
| `npm run dev:web` | Start only `@canvus/web`. |
| `npm run dev:api` | Start only `@canvus/api`. |
| `npm run build` | Build all workspaces that define a build script. |
| `npm run lint` | Lint all workspaces that define a lint script. |
| `npm run typecheck` | Typecheck all workspaces that define a typecheck script. |
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

### API

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `4000` | Port used by the Express and Socket.IO server. |
| `ALLOWED_ORIGIN` | `http://localhost:3000` | CORS origin allowed by the API and Socket.IO server. |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL used by Socket.IO pub/sub and room membership tests. |

### Web

| Variable | Default | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Base URL used by the web REST and Socket.IO clients. |

## Canvas Features

The canvas page is available at `/canvas`.

Implemented canvas behavior includes:

- Flowchart shape placement, including process, decision, terminal, database, document, sticky note, image, and other supported shape types
- Shape selection, multi-selection, drag, resize, delete, copy, paste, and duplicate
- Orthogonal connectors between shapes, connector labels, connector selection, color editing, and retargeting
- Shape labels with inline editing
- Image placement from file selection or pasted image data
- Bottom toolbar with selection, hand/pan, shape, arrow, text, sticky, and image tools
- Right-side properties panel for selected shapes and connectors
- Undo/redo history for canvas mutations
- Keyboard shortcuts for common tools and editing operations
- Zoom and pan controls, including wheel and keyboard-driven zoom
- Browser `localStorage` persistence for the current canvas state

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

The API uses JSON request and response bodies.

### Health

```http
GET /health
```

Response:

```json
{
  "ok": true
}
```

### List canvases

```http
GET /canvases
```

Returns an array of `CanvasSummary` objects.

### Create canvas

```http
POST /canvases
Content-Type: application/json
```

Request body:

```json
{
  "name": "Untitled"
}
```

Returns the created `Canvas`.

### Get canvas

```http
GET /canvases/:id
```

Returns a `Canvas`, or `404` with:

```json
{
  "error": "not_found"
}
```

### Replace canvas

```http
PUT /canvases/:id
Content-Type: application/json
```

Request body:

```json
{
  "name": "Updated canvas name",
  "shapes": [],
  "connections": []
}
```

The `shapes` and `connections` fields must be arrays. A successful replacement updates `updatedAt`, returns the updated `Canvas`, and broadcasts a `canvas:replaced` envelope to the canvas Socket.IO room.

Invalid request body:

```json
{
  "error": "invalid_body",
  "detail": "shapes and connections must be arrays"
}
```

### Delete canvas

```http
DELETE /canvases/:id
```

Returns `204 No Content` when deleted, or `404` when the canvas does not exist.

## WebSocket Collaboration Channel

The API hosts Socket.IO at path `/ws`.

Clients connect with a `canvasId` query parameter:

```ts
io("http://localhost:4000", {
  path: "/ws",
  query: { canvasId },
  transports: ["websocket"],
});
```

Connection behavior:

- A socket without `canvasId` is disconnected.
- Each socket joins a room named by its `canvasId`.
- Client `message` events are forwarded to other clients in the same canvas room.
- Server-side canvas replacements broadcast a `message` envelope to the room.

Current envelope shape used by the web client:

```ts
type WsEnvelope = {
  type: string;
  payload?: unknown;
  clientId?: string;
};
```

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
  src?: string;
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  fromPort?: ConnectionPort;
  toPort?: ConnectionPort;
  color?: string;
  label?: string;
}
```

When changing canvas data, update `@canvus/shared` first, then align API validation/storage, `apps/web/lib/api.ts`, `apps/web/lib/ws.ts`, Redux state, and canvas rendering.

## Development Notes

- Keep shared wire shapes synchronized across `packages/shared`, `apps/api`, and `apps/web`.
- The API store is intentionally in-memory. Restarting the API clears API-created canvases.
- The web canvas currently persists local Redux canvas data to browser `localStorage`.
- Canvas mutation behavior should preserve undo/redo history.
- Rendering changes often need coordinated updates across shapes, connectors, labels, hit areas, selection, keyboard behavior, and the properties panel.
- Keep client-only canvas behavior inside client components and hooks.

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
