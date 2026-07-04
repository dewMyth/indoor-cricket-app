import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppUser } from '@/types';

interface AuthState {
  user: AppUser | null;
  isInitializing: boolean;
}

const initialState: AuthState = {
  user: null,
  isInitializing: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AppUser | null>) {
      state.user = action.payload;
      state.isInitializing = false;
    },
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
