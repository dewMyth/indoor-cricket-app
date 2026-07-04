import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MatchHistorySummary } from '@/types';

interface HistoryState {
  matches: MatchHistorySummary[];
  isLoading: boolean;
}

const initialState: HistoryState = {
  matches: [],
  isLoading: false,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setHistoryLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setHistoryMatches(state, action: PayloadAction<MatchHistorySummary[]>) {
      state.matches = action.payload;
    },
  },
});

export const { setHistoryLoading, setHistoryMatches } = historySlice.actions;
export default historySlice.reducer;
