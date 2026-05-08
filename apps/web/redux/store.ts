import { configureStore } from '@reduxjs/toolkit';
import canvasReducer from '@/redux/slice/canvas/canvas-slice';
import uiReducer from '@/redux/slice/ui/ui-slice';
import presenceReducer from '@/redux/slice/presence/presence-slice';

export const store = configureStore({
    reducer: {
        canvas: canvasReducer,
        ui: uiReducer,
        presence: presenceReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
