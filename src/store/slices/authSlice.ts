import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role } from '@/config/permissions';
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from '@/features/auth/storage/auth.storage';

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  department?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const emptyState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
};

const storedSession = loadAuthSession();

const initialState: AuthState = storedSession
  ? {
      token: storedSession.token,
      user: storedSession.user,
      isAuthenticated: true,
    }
  : emptyState;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ token: string; user: AuthUser }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      saveAuthSession(action.payload);
    },
    logout: (state) => {
      clearAuthSession();
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
