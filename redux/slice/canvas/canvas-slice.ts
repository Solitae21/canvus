
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ShapeType =
  | 'rect' | 'rounded-rect' | 'diamond' | 'oval'
  | 'parallelogram' | 'trapezoid' | 'hexagon' | 'cylinder'
  | 'document' | 'predefined-process' | 'manual-input' | 'stored-data'
  | 'internal-storage' | 'circle' | 'off-page' | 'delay'
  | 'sticky'

export type ToolType =
  | 'select' | 'hand'
  | ShapeType
  | 'pen' | 'arrow' | 'text' | 'image'

export interface Shape {
  id: string
  type: ShapeType
  x: number; y: number; w: number; h: number
  label: string
  fill: string
  strokeColor: string
}

export interface Connection {
  id: string
  fromId: string
  toId: string
}

interface CanvasState {
  shapes: Shape[]
  connections: Connection[]
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
  selectedId: null,
  pendingFromId: null,
  tool: 'select',
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
    deleteShape: (state, action: PayloadAction<string>) => {
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
      state.connections.push(action.payload)
    },
    deleteConnection: (state, action: PayloadAction<string>) => {
      state.connections = state.connections.filter(c => c.id !== action.payload)
    },
    setPendingFromId: (state, action: PayloadAction<string | null>) => {
      state.pendingFromId = action.payload
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
} = canvasSlice.actions
export default canvasSlice.reducer
