
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Shape {
  id: string
  type: 'rect' | 'diamond' | 'oval' | 'sticky'
  x: number; y: number; w: number; h: number
  label: string
  fill: string
  strokeColor: string
}

interface CanvasState {
  shapes: Shape[]
  selectedId: string | null
  tool: 'select' | 'rect' | 'diamond' | 'oval' | 'arrow' | 'sticky'
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