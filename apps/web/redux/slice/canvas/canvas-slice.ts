
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Shape, ShapeType, Connection } from '@canvus/shared'

export type { Shape, ShapeType, Connection }

export type ToolType =
  | 'select' | 'hand'
  | ShapeType
  | 'pen' | 'arrow' | 'text' | 'image'

interface HistoryEntry {
  shapes: Shape[]
  connections: Connection[]
}

interface CanvasState {
  shapes: Shape[]
  connections: Connection[]
  past: HistoryEntry[]
  future: HistoryEntry[]
  selectedId: string | null
  pendingFromId: string | null
  tool: ToolType
}

const initialState: CanvasState = {
  shapes: [
    { id: 'seed-1', type: 'rect',    x: 80,  y: 80,  w: 160, h: 100, label: 'Process',  fill: 'transparent', strokeColor: '#ffffff' },
    { id: 'seed-2', type: 'oval',    x: 300, y: 150, w: 140, h: 90,  label: 'Terminal', fill: 'transparent', strokeColor: '#ffffff' },
    { id: 'seed-3', type: 'rect',    x: 520, y: 100, w: 140, h: 100, label: 'Decision', fill: 'transparent', strokeColor: '#ffffff' },
  ],
  connections: [],
  past: [],
  future: [],
  selectedId: null,
  pendingFromId: null,
  tool: 'select',
}

function pushHistory(state: CanvasState) {
  state.past.push({ shapes: [...state.shapes], connections: [...state.connections] })
  if (state.past.length > 50) state.past.shift()
  state.future = []
}

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    addShape: (state, action: PayloadAction<Shape>) => {
      pushHistory(state)
      state.shapes.push(action.payload)
    },
    updateShape: (state, action: PayloadAction<{ id: string } & Partial<Shape>>) => {
      pushHistory(state)
      const shape = state.shapes.find(s => s.id === action.payload.id)
      if (shape) Object.assign(shape, action.payload)
    },
    deleteShape: (state, action: PayloadAction<string>) => {
      pushHistory(state)
      const id = action.payload
      state.shapes = state.shapes.filter(s => s.id !== id)
      state.connections = state.connections.filter(c => c.fromId !== id && c.toId !== id)
      if (state.selectedId === id) state.selectedId = null
      if (state.pendingFromId === id) state.pendingFromId = null
    },
    selectShape: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload
    },
    setTool: (state, action: PayloadAction<CanvasState['tool']>) => {
      state.tool = action.payload
    },
    addConnection: (state, action: PayloadAction<Connection>) => {
      pushHistory(state)
      state.connections.push(action.payload)
    },
    deleteConnection: (state, action: PayloadAction<string>) => {
      pushHistory(state)
      state.connections = state.connections.filter(c => c.id !== action.payload)
    },
    setPendingFromId: (state, action: PayloadAction<string | null>) => {
      state.pendingFromId = action.payload
    },
    undo: (state) => {
      const entry = state.past.pop()
      if (!entry) return
      state.future.push({ shapes: [...state.shapes], connections: [...state.connections] })
      state.shapes = entry.shapes
      state.connections = entry.connections
      // deselect if selected shape no longer exists
      if (state.selectedId && !state.shapes.find(s => s.id === state.selectedId)) {
        state.selectedId = null
      }
    },
    redo: (state) => {
      const entry = state.future.pop()
      if (!entry) return
      state.past.push({ shapes: [...state.shapes], connections: [...state.connections] })
      state.shapes = entry.shapes
      state.connections = entry.connections
      if (state.selectedId && !state.shapes.find(s => s.id === state.selectedId)) {
        state.selectedId = null
      }
    },
  },
})

export const {
  addShape,
  updateShape,
  deleteShape,
  selectShape,
  setTool,
  addConnection,
  deleteConnection,
  setPendingFromId,
  undo,
  redo,
} = canvasSlice.actions
export default canvasSlice.reducer
