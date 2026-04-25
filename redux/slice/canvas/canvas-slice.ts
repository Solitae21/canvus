
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

interface Shape {
  id: string
  type: ShapeType
  x: number; y: number; w: number; h: number
  label: string
  fill: string
  strokeColor: string
}

interface CanvasState {
  shapes: Shape[]
  selectedId: string | null
  tool: ToolType
}

const initialState: CanvasState = {
  shapes: [],
  selectedId: null,
  tool: 'select',
}

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    addShape: (state, action: PayloadAction<Shape>) => {
      state.shapes.push(action.payload)          // RTK uses Immer — mutate directly ✓
    },
    updateShape: (state, action: PayloadAction<{ id: string } & Partial<Shape>>) => {
      const shape = state.shapes.find(s => s.id === action.payload.id)
      if (shape) Object.assign(shape, action.payload)
    },
    deleteShape: (state, action: PayloadAction<string>) => {
      state.shapes = state.shapes.filter(s => s.id !== action.payload)
    },
    selectShape: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload
    },
    setTool: (state, action: PayloadAction<CanvasState['tool']>) => {
      state.tool = action.payload
    },
  },
})

export const { addShape, updateShape, deleteShape, selectShape, setTool } = canvasSlice.actions
export default canvasSlice.reducer