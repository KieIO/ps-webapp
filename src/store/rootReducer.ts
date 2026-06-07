import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import permissionReducer from './slices/permissionSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  permission: permissionReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
