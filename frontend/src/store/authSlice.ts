import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  user: { username: string } | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('admin_token') || null,
  user: localStorage.getItem('admin_user')
    ? JSON.parse(localStorage.getItem('admin_user') || '{}')
    : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ access_token: string; user: { username: string } }>,
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
