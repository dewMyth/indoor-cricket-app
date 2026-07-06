import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import type { MatchState, TournamentStandings, TournamentState } from "@/types";

interface TournamentSliceState {
  currentTournament: TournamentState | null;
  tournamentMatches: MatchState[]; // matches played so far in the current tournament
}

const initialState: TournamentSliceState = {
  currentTournament: null,
  tournamentMatches: [],
};

const tournamentSlice = createSlice({
  name: "tournament",
  initialState,
  reducers: {
    createTournament(
      state,
      action: PayloadAction<{ ownerUid: string; name: string }>,
    ) {
      state.currentTournament = {
        id: uuid(),
        ownerUid: action.payload.ownerUid,
        name: action.payload.name.trim(),
        status: "ACTIVE",
        createdAtISO: new Date().toISOString(),
      };
      state.tournamentMatches = [];
    },
    loadTournament(
      state,
      action: PayloadAction<{
        tournament: TournamentState;
        matches: MatchState[];
      }>,
    ) {
      state.currentTournament = action.payload.tournament;
      state.tournamentMatches = action.payload.matches;
    },
    setTournamentMatches(state, action: PayloadAction<MatchState[]>) {
      state.tournamentMatches = action.payload;
    },
    completeTournament(state, action: PayloadAction<TournamentStandings>) {
      if (!state.currentTournament) return;
      state.currentTournament.status = "COMPLETED";
      state.currentTournament.completedAtISO = new Date().toISOString();
      state.currentTournament.standings = action.payload;
    },
    clearTournament(state) {
      state.currentTournament = null;
      state.tournamentMatches = [];
    },
  },
});

export const {
  createTournament,
  loadTournament,
  setTournamentMatches,
  completeTournament,
  clearTournament,
} = tournamentSlice.actions;
export default tournamentSlice.reducer;
