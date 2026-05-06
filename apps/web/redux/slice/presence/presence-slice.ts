import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/redux/store';

interface CursorEntry {
  x: number;
  y: number;
  lastSeen: number;
}

interface PresenceState {
  cursors: Record<string, CursorEntry>;
}

const initialState: PresenceState = { cursors: {} };

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    upsertCursor(state, action: PayloadAction<{ userId: string; x: number; y: number }>) {
      const { userId, x, y } = action.payload;
      state.cursors[userId] = { x, y, lastSeen: Date.now() };
    },
    removeCursor(state, action: PayloadAction<string>) {
      delete state.cursors[action.payload];
    },
    pruneStale(state, action: PayloadAction<number>) {
      const threshold = action.payload;
      const now = Date.now();
      for (const uid of Object.keys(state.cursors)) {
        if (now - state.cursors[uid].lastSeen > threshold) {
          delete state.cursors[uid];
        }
      }
    },
  },
});

export const { upsertCursor, removeCursor, pruneStale } = presenceSlice.actions;
export const selectRemoteCursors = (s: RootState) => s.presence.cursors;
export default presenceSlice.reducer;
