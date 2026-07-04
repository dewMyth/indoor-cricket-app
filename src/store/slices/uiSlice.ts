import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UiState {
  isLoading: boolean;
  loadingMessage?: string;
  toasts: Toast[];
  isDarkMode: boolean;
}

const initialState: UiState = {
  isLoading: false,
  toasts: [],
  isDarkMode: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<{ isLoading: boolean; message?: string }>) {
      state.isLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message;
    },
    pushToast(state, action: PayloadAction<Omit<Toast, 'id'>>) {
      state.toasts.push({ id: crypto.randomUUID(), ...action.payload });
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    toggleDarkMode(state) {
      state.isDarkMode = !state.isDarkMode;
    },
  },
});

export const { setLoading, pushToast, dismissToast, toggleDarkMode } = uiSlice.actions;
export default uiSlice.reducer;
