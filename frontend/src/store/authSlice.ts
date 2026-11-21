import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin';
  name?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

const getInitialUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem('admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  token: localStorage.getItem('admin_token') || null,
  user: getInitialUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ access_token: string; user: AuthUser }>,
    ) => {
      state.token = action.payload.access_token;
      state.user = action.payload.user;
      localStorage.setItem('admin_token', action.payload.access_token);
      localStorage.setItem('admin_user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
