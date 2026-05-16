import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import canvasReducer from '@/redux/slice/canvas/canvas-slice';
import uiReducer from '@/redux/slice/ui/ui-slice';
import presenceReducer from '@/redux/slice/presence/presence-slice';
import { boardsApi } from '@/redux/api/boardsApi';

export const store = configureStore({
    reducer: {
        canvas: canvasReducer,
        ui: uiReducer,
        presence: presenceReducer,
        [boardsApi.reducerPath]: boardsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(boardsApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
