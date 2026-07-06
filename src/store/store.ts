import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import matchReducer from "./slices/matchSlice";
import uiReducer from "./slices/uiSlice";
import historyReducer from "./slices/historySlice";
import tournamentReducer from "./slices/tournamentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    match: matchReducer,
    ui: uiReducer,
    history: historyReducer,
    tournament: tournamentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
