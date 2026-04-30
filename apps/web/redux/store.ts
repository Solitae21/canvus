import { configureStore } from '@reduxjs/toolkit';
import canvasReducer from '@/redux/slice/canvas/canvas-slice';
import uiReducer from '@/redux/slice/ui/ui-slice';

const STORAGE_KEY = 'canvus-canvas-state';

function loadCanvasState() {
    if (typeof window === 'undefined') return undefined;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return undefined;
        const parsed = JSON.parse(raw);
        // Reset transient UI state on reload
        return {
            canvas: {
                ...parsed,
                selectedId: null,
                selectedConnectionId: null,
                selectedIds: [],
                selectedConnectionIds: [],
                pendingFromId: null,
                tool: 'select',
            },
        };
    } catch {
        return undefined;
    }
}

export const store = configureStore({
    reducer: {
        canvas: canvasReducer,
        ui: uiReducer,
    },
    preloadedState: loadCanvasState(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

if (typeof window !== 'undefined') {
    store.subscribe(() => {
        try {
            const { shapes, connections, past, future } = store.getState().canvas;
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ shapes, connections, past, future }));
        } catch { /* ignore write errors */ }
    });
}