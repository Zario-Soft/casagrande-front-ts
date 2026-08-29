import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { LogMiddleware } from './middlewares/log.middleware';
import { AuthSlice } from './slices/auth.slice';
import { SidebarSlice } from './slices/sidebar.slice';
import { clientesApi } from 'src/features/clientes/api';

const rootReducer = combineReducers({
    auth: AuthSlice.reducer,
    sidebar: SidebarSlice.reducer,
    clientesApi: clientesApi.reducer,
})

export const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware()
            .concat(LogMiddleware)
            .concat(clientesApi.middleware)
})

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch