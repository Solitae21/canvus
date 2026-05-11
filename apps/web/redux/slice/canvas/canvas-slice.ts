
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Shape, ShapeType, Connection, ConnectionPort } from '@canvus/shared'
import { newId } from '@/client/canvas/canvas-defaults'

export type { Shape, ShapeType, Connection, ConnectionPort }

export type ToolType =
  | 'select' | 'hand'
  | ShapeType
  | 'pen' | 'arrow' | 'text' | 'image'

interface CanvasState {
  shapes: Shape[]
  connections: Connection[]
  selectedId: string | null
  selectedConnectionId: string | null
  selectedIds: string[]
  selectedConnectionIds: string[]
  pendingFromId: string | null
  tool: ToolType
  clipboard: { shapes: Shape[]; connections: Connection[] } | null
}

const initialState: CanvasState = {
  shapes: [],
  connections: [],
  selectedId: null,
  selectedConnectionId: null,
  selectedIds: [],
  selectedConnectionIds: [],
  pendingFromId: null,
  tool: 'select',
  clipboard: null,
}

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    addShape: (state, action: PayloadAction<Shape>) => {
      state.shapes.push(action.payload)
    },
    updateShape: (state, action: PayloadAction<{ id: string } & Partial<Shape>>) => {
      const shape = state.shapes.find(s => s.id === action.payload.id)
      if (shape) Object.assign(shape, action.payload)
    },
    batchUpdateShapes: (state, action: PayloadAction<Array<{ id: string; x: number; y: number }>>) => {
      for (const update of action.payload) {
        const shape = state.shapes.find(s => s.id === update.id)
        if (shape) { shape.x = update.x; shape.y = update.y }
      }
    },
    deleteShape: (state, action: PayloadAction<string>) => {
      const id = action.payload
      state.shapes = state.shapes.filter(s => s.id !== id)
      state.connections = state.connections.filter(c => c.fromId !== id && c.toId !== id)
      if (state.selectedId === id) state.selectedId = null
      if (state.pendingFromId === id) state.pendingFromId = null
      state.selectedIds = state.selectedIds.filter(i => i !== id)
    },
    deleteSelectedItems: (state) => {
      if (state.selectedIds.length === 0 && state.selectedConnectionIds.length === 0) return
      const shapeIdSet = new Set(state.selectedIds)
      const connIdSet = new Set(state.selectedConnectionIds)
      state.shapes = state.shapes.filter(s => !shapeIdSet.has(s.id))
      state.connections = state.connections.filter(
        c => !connIdSet.has(c.id) && !shapeIdSet.has(c.fromId) && !shapeIdSet.has(c.toId),
      )
      if (state.pendingFromId && shapeIdSet.has(state.pendingFromId)) state.pendingFromId = null
      state.selectedIds = []
      state.selectedConnectionIds = []
    },
    selectShape: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload
      state.selectedConnectionId = null
      state.selectedIds = []
      state.selectedConnectionIds = []
    },
    setMultiSelection: (state, action: PayloadAction<{ shapeIds: string[]; connectionIds: string[] }>) => {
      state.selectedIds = action.payload.shapeIds
      state.selectedConnectionIds = action.payload.connectionIds
      state.selectedId = null
      state.selectedConnectionId = null
    },
    setTool: (state, action: PayloadAction<CanvasState['tool']>) => {
      state.tool = action.payload
    },
    addConnection: (state, action: PayloadAction<Connection>) => {
      state.connections.push(action.payload)
    },
    deleteConnection: (state, action: PayloadAction<string>) => {
      state.connections = state.connections.filter(c => c.id !== action.payload)
      if (state.selectedConnectionId === action.payload) state.selectedConnectionId = null
      state.selectedConnectionIds = state.selectedConnectionIds.filter(id => id !== action.payload)
    },
    selectConnection: (state, action: PayloadAction<string | null>) => {
      state.selectedConnectionId = action.payload
      state.selectedId = null
      state.selectedIds = []
      state.selectedConnectionIds = []
    },
    updateConnection: (state, action: PayloadAction<{ id: string } & Partial<Connection>>) => {
      const conn = state.connections.find(c => c.id === action.payload.id)
      if (conn) Object.assign(conn, action.payload)
    },
    setPendingFromId: (state, action: PayloadAction<string | null>) => {
      state.pendingFromId = action.payload
    },
    copySelection: (state) => {
      const ids = state.selectedIds.length > 0
        ? new Set(state.selectedIds)
        : state.selectedId ? new Set([state.selectedId]) : null
      if (!ids || ids.size === 0) return
      const shapes = state.shapes.filter(s => ids.has(s.id)).map(s => ({ ...s }))
      const connections = state.connections
        .filter(c => ids.has(c.fromId) && ids.has(c.toId))
        .map(c => ({ ...c }))
      state.clipboard = { shapes, connections }
    },
    pasteClipboard: (state) => {
      if (!state.clipboard || state.clipboard.shapes.length === 0) return
      const idMap = new Map<string, string>()
      for (const s of state.clipboard.shapes) idMap.set(s.id, newId())
      const newShapes = state.clipboard.shapes.map(s => ({
        ...s,
        id: idMap.get(s.id)!,
        x: s.x + 20,
        y: s.y + 20,
      }))
      const newConnections = state.clipboard.connections.map(c => ({
        ...c,
        id: newId(),
        fromId: idMap.get(c.fromId)!,
        toId: idMap.get(c.toId)!,
      }))
      state.shapes.push(...newShapes)
      state.connections.push(...newConnections)
      state.selectedIds = newShapes.map(s => s.id)
      state.selectedConnectionIds = newConnections.map(c => c.id)
      state.selectedId = null
      state.selectedConnectionId = null
    },
    addShapeWithConnection: (state, action: PayloadAction<{ shape: Shape; connection: Connection }>) => {
      state.shapes.push(action.payload.shape)
      state.connections.push(action.payload.connection)
    },
    setShapes: (state, action: PayloadAction<Shape[]>) => {
      state.shapes = action.payload
    },
    setConnections: (state, action: PayloadAction<Connection[]>) => {
      state.connections = action.payload
    },
    removeConnectionsForShapes: (state, action: PayloadAction<{ shapeIds: string[]; connectionIds?: string[] }>) => {
      const shapeIdSet = new Set(action.payload.shapeIds)
      const connIdSet = new Set(action.payload.connectionIds ?? [])
      state.connections = state.connections.filter(
        c => !connIdSet.has(c.id) && !shapeIdSet.has(c.fromId) && !shapeIdSet.has(c.toId),
      )
      state.selectedId = null
      state.selectedConnectionId = null
      state.selectedIds = []
      state.selectedConnectionIds = []
    },
  },
})

export const {
  addShape,
  updateShape,
  batchUpdateShapes,
  deleteShape,
  deleteSelectedItems,
  selectShape,
  setMultiSelection,
  setTool,
  addConnection,
  addShapeWithConnection,
  deleteConnection,
  selectConnection,
  updateConnection,
  setPendingFromId,
  copySelection,
  pasteClipboard,
  setShapes,
  setConnections,
  removeConnectionsForShapes,
} = canvasSlice.actions
export default canvasSlice.reducer
