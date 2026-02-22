import { RootState } from '@/redux/store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PanelSide = 'left' | 'right' | 'chat' | 'minimap'

export interface ViewportState {
  x: number        // canvas pan offset X
  y: number        // canvas pan offset Y
  scale: number    // zoom scale (1 = 100%)
}

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number   // ms, default 3000
}

export interface UIState {
  // ── Panels ──
  panels: {
    left: boolean      // toolbar panel
    right: boolean     // shape properties panel
    chat: boolean      // meeting chat
    minimap: boolean   // minimap overlay
  }

  // ── Present Mode ──
  presentMode: {
    active: boolean
    isPresenter: boolean       // true = you're presenting, false = you're following
    followingUserId: string | null  // which presenter's viewport to follow
    laserPointer: boolean      // show laser pointer cursor highlight
    timerSeconds: number       // meeting timer (counts up)
    timerRunning: boolean
  }

  // ── Viewport / zoom ──
  viewport: ViewportState

  // ── Share modal ──
  shareModal: {
    open: boolean
    boardId: string | null
  }

  // ── Toasts ──
  toasts: ToastMessage[]

  // ── Misc ──
  isFullscreen: boolean
  gridVisible: boolean
  snapToGrid: boolean
  gridSize: number          // px between grid lines (default 24)
  theme: 'dark' | 'light'
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: UIState = {
  panels: {
    left: true,
    right: false,     // opens when a shape is selected
    chat: false,
    minimap: false,
  },

  presentMode: {
    active: false,
    isPresenter: false,
    followingUserId: null,
    laserPointer: false,
    timerSeconds: 0,
    timerRunning: false,
  },

  viewport: {
    x: 0,
    y: 0,
    scale: 1,
  },

  shareModal: {
    open: false,
    boardId: null,
  },

  toasts: [],

  isFullscreen: false,
  gridVisible: true,
  snapToGrid: true,
  gridSize: 24,
  theme: 'dark',
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const uiSlice = createSlice({
  name: 'ui',
  initialState,

  reducers: {

    // ── Panels ──────────────────────────────────────────────────────────────

    /** Toggle a specific panel open/closed */
    togglePanel: (state, action: PayloadAction<PanelSide>) => {
      state.panels[action.payload] = !state.panels[action.payload]
    },

    /** Explicitly set a panel open or closed */
    setPanel: (state, action: PayloadAction<{ panel: PanelSide; open: boolean }>) => {
      state.panels[action.payload.panel] = action.payload.open
    },

    /** Close all panels at once (used when entering Present Mode) */
    closeAllPanels: (state) => {
      state.panels.left    = false
      state.panels.right   = false
      state.panels.chat    = false
      state.panels.minimap = false
    },

    /** Restore default panel layout (used when exiting Present Mode) */
    resetPanels: (state) => {
      state.panels.left    = true
      state.panels.right   = false
      state.panels.chat    = false
      state.panels.minimap = false
    },

    // ── Present Mode ────────────────────────────────────────────────────────

    /** Enter Present Mode as the presenter */
    startPresenting: (state) => {
      state.presentMode.active       = true
      state.presentMode.isPresenter  = true
      state.presentMode.followingUserId = null
      // hide all UI chrome
      state.panels.left    = false
      state.panels.right   = false
      state.panels.minimap = false
    },

    /** Enter Present Mode as a viewer following a presenter */
    startFollowing: (state, action: PayloadAction<string>) => {
      state.presentMode.active          = true
      state.presentMode.isPresenter     = false
      state.presentMode.followingUserId = action.payload
      state.panels.left    = false
      state.panels.right   = false
      state.panels.minimap = false
    },

    /** Exit Present Mode entirely */
    stopPresenting: (state) => {
      state.presentMode.active          = false
      state.presentMode.isPresenter     = false
      state.presentMode.followingUserId = null
      state.presentMode.laserPointer    = false
      state.presentMode.timerRunning    = false
      // restore panels
      state.panels.left  = true
      state.panels.right = false
    },

    toggleLaserPointer: (state) => {
      state.presentMode.laserPointer = !state.presentMode.laserPointer
    },

    /** Called every second by a setInterval in the component */
    tickTimer: (state) => {
      if (state.presentMode.timerRunning) {
        state.presentMode.timerSeconds += 1
      }
    },

    toggleTimer: (state) => {
      state.presentMode.timerRunning = !state.presentMode.timerRunning
    },

    resetTimer: (state) => {
      state.presentMode.timerSeconds = 0
      state.presentMode.timerRunning = false
    },

    // ── Viewport ────────────────────────────────────────────────────────────

    /** Set the full viewport (used when following a presenter's view via socket) */
    setViewport: (state, action: PayloadAction<ViewportState>) => {
      state.viewport = action.payload
    },

    /** Pan the canvas by a delta */
    panViewport: (state, action: PayloadAction<{ dx: number; dy: number }>) => {
      state.viewport.x += action.payload.dx
      state.viewport.y += action.payload.dy
    },

    /** Zoom in or out, clamped between 10% and 400% */
    setZoom: (state, action: PayloadAction<number>) => {
      state.viewport.scale = Math.min(4, Math.max(0.1, action.payload))
    },

    zoomIn: (state) => {
      const steps = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]
      const next = steps.find(s => s > state.viewport.scale)
      state.viewport.scale = next ?? 4
    },

    zoomOut: (state) => {
      const steps = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]
      const prev = [...steps].reverse().find(s => s < state.viewport.scale)
      state.viewport.scale = prev ?? 0.25
    },

    /** Reset viewport to default (100% zoom, centered) */
    resetViewport: (state) => {
      state.viewport = { x: 0, y: 0, scale: 1 }
    },

    // ── Share modal ──────────────────────────────────────────────────────────

    openShareModal: (state, action: PayloadAction<string>) => {
      state.shareModal.open    = true
      state.shareModal.boardId = action.payload
    },

    closeShareModal: (state) => {
      state.shareModal.open    = false
      state.shareModal.boardId = null
    },

    // ── Toasts ──────────────────────────────────────────────────────────────

    addToast: (state, action: PayloadAction<Omit<ToastMessage, 'id'>>) => {
      state.toasts.push({
        ...action.payload,
        id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      })
    },

    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload)
    },

    clearAllToasts: (state) => {
      state.toasts = []
    },

    // ── Grid & canvas settings ───────────────────────────────────────────────

    toggleGrid: (state) => {
      state.gridVisible = !state.gridVisible
    },

    toggleSnapToGrid: (state) => {
      state.snapToGrid = !state.snapToGrid
    },

    setGridSize: (state, action: PayloadAction<number>) => {
      state.gridSize = Math.max(8, Math.min(64, action.payload))
    },

    // ── Fullscreen ───────────────────────────────────────────────────────────

    setFullscreen: (state, action: PayloadAction<boolean>) => {
      state.isFullscreen = action.payload
    },

    // ── Theme ────────────────────────────────────────────────────────────────

    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
    },

    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload
    },
  },
})

// ─── Exports ──────────────────────────────────────────────────────────────────

export const {
  // panels
  togglePanel,
  setPanel,
  closeAllPanels,
  resetPanels,
  // present mode
  startPresenting,
  startFollowing,
  stopPresenting,
  toggleLaserPointer,
  tickTimer,
  toggleTimer,
  resetTimer,
  // viewport
  setViewport,
  panViewport,
  setZoom,
  zoomIn,
  zoomOut,
  resetViewport,
  // share modal
  openShareModal,
  closeShareModal,
  // toasts
  addToast,
  removeToast,
  clearAllToasts,
  // grid
  toggleGrid,
  toggleSnapToGrid,
  setGridSize,
  // fullscreen
  setFullscreen,
  // theme
  toggleTheme,
  setTheme,
} = uiSlice.actions

export default uiSlice.reducer

// ─── Selectors ────────────────────────────────────────────────────────────────
// Pre-built selectors — import these in components instead of writing
// state => state.ui.xxx every time

export const selectPanels          = (state: RootState) => state.ui.panels
export const selectIsPanelOpen     = (panel: PanelSide) => (state: RootState) => state.ui.panels[panel]
export const selectPresentMode     = (state: RootState) => state.ui.presentMode
export const selectIsPresenting    = (state: RootState) => state.ui.presentMode.active
export const selectIsPresenter     = (state: RootState) => state.ui.presentMode.isPresenter
export const selectFollowingUserId = (state: RootState) => state.ui.presentMode.followingUserId
export const selectLaserPointer    = (state: RootState) => state.ui.presentMode.laserPointer
export const selectTimerSeconds    = (state: RootState) => state.ui.presentMode.timerSeconds
export const selectViewport        = (state: RootState) => state.ui.viewport
export const selectZoom            = (state: RootState) => state.ui.viewport.scale
export const selectShareModal      = (state: RootState) => state.ui.shareModal
export const selectToasts          = (state: RootState) => state.ui.toasts
export const selectGridVisible     = (state: RootState) => state.ui.gridVisible
export const selectSnapToGrid      = (state: RootState) => state.ui.snapToGrid
export const selectGridSize        = (state: RootState) => state.ui.gridSize
export const selectIsFullscreen    = (state: RootState) => state.ui.isFullscreen
export const selectTheme           = (state: RootState) => state.ui.theme