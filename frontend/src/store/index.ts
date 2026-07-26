import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { authApi } from './services/authApi';
import { invitationApi } from './services/invitationApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [invitationApi.reducerPath]: invitationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, invitationApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
