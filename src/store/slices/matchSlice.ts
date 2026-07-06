import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import type {
  DismissalInfo,
  InningsState,
  MatchConfig,
  MatchState,
  Team,
} from "@/types";
import { applyBallEvent, type RecordBallParams } from "@/utils/cricketEngine";
import {
  calculateMatchAwards,
  calculateTarget,
  decideWinner,
  isInningsOver,
} from "@/utils/cricketUtils";

interface MatchSliceState {
  currentMatch: MatchState | null;
  undoStack: InningsState[];
  pendingNewBatsman: boolean;
  pendingNewBowler: boolean;
  pendingBatsmanReplacesStriker: boolean; // add this
  lastDismissedPlayerId?: string;
}

const initialState: MatchSliceState = {
  currentMatch: null,
  undoStack: [],
  pendingNewBatsman: false,
  pendingNewBowler: false,
  pendingBatsmanReplacesStriker: true, // initialize to true
};

function createEmptyInnings(
  inningsNumber: 1 | 2,
  battingTeamId: string,
  bowlingTeamId: string,
  target?: number,
): InningsState {
  return {
    inningsNumber,
    battingTeamId,
    bowlingTeamId,
    totalRuns: 0,
    totalWickets: 0,
    legalBallsBowled: 0,
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
    strikerId: null,
    nonStrikerId: null,
    currentBowlerId: null,
    previousBowlerId: null,
    battingStats: {},
    bowlingStats: {},
    fieldingStats: {},
    ballHistory: [],
    isCompleted: false,
    target,
  };
}

function currentInnings(state: MatchSliceState): InningsState {
  const match = state.currentMatch;
  if (!match) throw new Error("No active match");
  const innings =
    match.currentInningsNumber === 1 ? match.innings1 : match.innings2;
  if (!innings) throw new Error("Current innings not started");
  return innings;
}

function snapshotCurrentInnings(state: MatchSliceState) {
  const innings = currentInnings(state);
  state.undoStack.push(JSON.parse(JSON.stringify(innings)));
  if (state.undoStack.length > 30) state.undoStack.shift();
}

const matchSlice = createSlice({
  name: "match",
  initialState,
  reducers: {
    createMatch(
      state,
      action: PayloadAction<{
        ownerUid: string;
        config: MatchConfig;
        teamA: Team;
        teamB: Team;
        tournamentId?: string;
      }>,
    ) {
      const { ownerUid, config, teamA, teamB, tournamentId } = action.payload;
      const now = new Date();
      const match: MatchState = {
        id: uuid(),
        ownerUid,
        tournamentId,
        config,
        teamA,
        teamB,
        status: "SETUP",
        currentInningsNumber: 1,
        createdAtISO: now.toISOString(),
        createdTimeLabel: now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        updatedAtISO: now.toISOString(),
      };
      state.currentMatch = match;
      state.undoStack = [];
      state.pendingNewBatsman = false;
      state.pendingNewBowler = false;
      state.pendingBatsmanReplacesStriker = true; // add this
    },

    rematchSameTeams(state) {
      const match = state.currentMatch;
      if (!match) return;
      const now = new Date();

      state.currentMatch = {
        id: uuid(),
        ownerUid: match.ownerUid,
        config: { ...match.config },
        teamA: JSON.parse(JSON.stringify(match.teamA)),
        teamB: JSON.parse(JSON.stringify(match.teamB)),
        status: "SETUP",
        currentInningsNumber: 1,
        createdAtISO: now.toISOString(),
        createdTimeLabel: now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        updatedAtISO: now.toISOString(),
        // tossWinnerTeamId, battingFirstTeamId, innings1, innings2, winnerTeamId,
        // winnerMargin, awards, completedAtISO are all intentionally omitted/reset
      };

      state.undoStack = [];
      state.pendingNewBatsman = false;
      state.pendingNewBowler = false;
      state.pendingBatsmanReplacesStriker = true; // add this
    },

    loadMatch(state, action: PayloadAction<MatchState>) {
      state.currentMatch = action.payload;
      state.undoStack = [];
      state.pendingNewBatsman = false;
      state.pendingNewBowler = false;
      state.pendingBatsmanReplacesStriker = true; // add this
    },

    clearMatch(state) {
      state.currentMatch = null;
      state.undoStack = [];
    },

    setToss(
      state,
      action: PayloadAction<{
        tossWinnerTeamId: string;
        battingFirstTeamId: string;
      }>,
    ) {
      if (!state.currentMatch) return;
      state.currentMatch.tossWinnerTeamId = action.payload.tossWinnerTeamId;
      state.currentMatch.battingFirstTeamId = action.payload.battingFirstTeamId;
    },

    startInnings(
      state,
      action: PayloadAction<{
        inningsNumber: 1 | 2;
        battingTeamId: string;
        bowlingTeamId: string;
        strikerId: string;
        nonStrikerId: string;
        bowlerId: string;
      }>,
    ) {
      const match = state.currentMatch;
      if (!match) return;
      const {
        inningsNumber,
        battingTeamId,
        bowlingTeamId,
        strikerId,
        nonStrikerId,
        bowlerId,
      } = action.payload;

      let target: number | undefined;
      if (inningsNumber === 2 && match.innings1) {
        target = calculateTarget(match.innings1.totalRuns);
      }

      const innings = createEmptyInnings(
        inningsNumber,
        battingTeamId,
        bowlingTeamId,
        target,
      );
      innings.strikerId = strikerId;
      innings.nonStrikerId = nonStrikerId;
      innings.currentBowlerId = bowlerId;

      if (inningsNumber === 1) {
        match.innings1 = innings;
      } else {
        match.innings2 = innings;
      }
      match.currentInningsNumber = inningsNumber;
      match.status = "IN_PROGRESS";
      state.undoStack = [];
      state.pendingNewBatsman = false;
      state.pendingNewBowler = false;
      state.pendingBatsmanReplacesStriker = true; // add this
    },

    recordBall(state, action: PayloadAction<RecordBallParams>) {
      const match = state.currentMatch;
      if (!match) return;
      const innings = currentInnings(state);
      if (innings.isCompleted) return;

      snapshotCurrentInnings(state);

      const event = applyBallEvent(
        innings,
        match.config.ballsPerOver,
        action.payload,
      );
      const battingTeam =
        innings.battingTeamId === match.teamA.id ? match.teamA : match.teamB;

      if (event.outcome === "WICKET") {
        const dismissedId = event.dismissal?.batsmanId ?? event.strikerId;

        const dismissedIds = new Set(
          Object.values(innings.battingStats)
            .filter((b) => b.isOut)
            .map((b) => b.playerId),
        );
        const currentCreaseIds = new Set(
          [innings.strikerId, innings.nonStrikerId].filter(Boolean) as string[],
        );
        const remainingPlayers = battingTeam.players.filter(
          (p) => !dismissedIds.has(p.id) && !currentCreaseIds.has(p.id),
        );

        if (remainingPlayers.length === 0) {
          const survivorId =
            innings.strikerId === dismissedId
              ? innings.nonStrikerId
              : innings.strikerId;
          if (survivorId) {
            // Last man stands: promote the survivor, no replacement needed.
            innings.strikerId = survivorId;
            innings.nonStrikerId = null;
            state.pendingNewBatsman = false;
          } else {
            finalizeInnings(match, innings);
            match.updatedAtISO = new Date().toISOString();
            return;
          }
        } else {
          state.lastDismissedPlayerId = dismissedId;
          state.pendingBatsmanReplacesStriker =
            innings.strikerId === dismissedId;
          state.pendingNewBatsman = true;
        }
      }

      if (!innings.currentBowlerId) {
        state.pendingNewBowler = true;
      }

      if (
        isInningsOver(innings, match.config, battingTeam.players.length) &&
        !state.pendingNewBatsman
      ) {
        finalizeInnings(match, innings);
      }

      match.updatedAtISO = new Date().toISOString();
    },

    confirmNewBatsman(
      state,
      action: PayloadAction<{ playerId: string; replacesStriker: boolean }>,
    ) {
      const innings = currentInnings(state);
      const match = state.currentMatch!;
      if (action.payload.replacesStriker) {
        innings.strikerId = action.payload.playerId;
      } else {
        innings.nonStrikerId = action.payload.playerId;
      }
      state.pendingNewBatsman = false;
      state.pendingBatsmanReplacesStriker = false;
      const battingTeam =
        innings.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
      if (isInningsOver(innings, match.config, battingTeam.players.length)) {
        finalizeInnings(match, innings);
      }
    },

    selectBowler(state, action: PayloadAction<{ bowlerId: string }>) {
      const innings = currentInnings(state);
      innings.currentBowlerId = action.payload.bowlerId;
      state.pendingNewBowler = false;
    },

    swapStrikers(state) {
      const innings = currentInnings(state);
      if (!innings.nonStrikerId) return; // nothing to swap with when the last man is batting alone
      const s = innings.strikerId;
      innings.strikerId = innings.nonStrikerId;
      innings.nonStrikerId = s;
    },

    undoLastBall(state) {
      const match = state.currentMatch;
      if (!match) return;
      const snapshot = state.undoStack.pop();
      if (!snapshot) return;
      if (match.currentInningsNumber === 1) {
        match.innings1 = snapshot;
      } else {
        match.innings2 = snapshot;
      }
      state.pendingNewBatsman = false;
      state.pendingNewBowler = !snapshot.currentBowlerId;
      state.pendingBatsmanReplacesStriker = false;
      match.status = "IN_PROGRESS";
    },

    addPlayer(
      state,
      action: PayloadAction<{ teamId: "A" | "B"; name: string }>,
    ) {
      const match = state.currentMatch;
      if (!match) return;
      const team = action.payload.teamId === "A" ? match.teamA : match.teamB;
      team.players.push({
        id: uuid(),
        name: action.payload.name.trim(),
        isPlaying: true,
      });
    },

    removePlayer(
      state,
      action: PayloadAction<{ teamId: "A" | "B"; playerId: string }>,
    ) {
      const match = state.currentMatch;
      if (!match) return;
      const team = action.payload.teamId === "A" ? match.teamA : match.teamB;
      team.players = team.players.filter(
        (p) => p.id !== action.payload.playerId,
      );
    },

    editPlayer(
      state,
      action: PayloadAction<{
        teamId: "A" | "B";
        playerId: string;
        name: string;
      }>,
    ) {
      const match = state.currentMatch;
      if (!match) return;
      const team = action.payload.teamId === "A" ? match.teamA : match.teamB;
      const player = team.players.find((p) => p.id === action.payload.playerId);
      if (player) player.name = action.payload.name.trim();
    },

    endInningsManually(state) {
      const match = state.currentMatch;
      if (!match) return;
      const innings = currentInnings(state);
      finalizeInnings(match, innings);
    },

    finishMatchManually(state) {
      const match = state.currentMatch;
      if (!match) return;
      finalizeMatch(match);
    },
  },
});

function finalizeInnings(match: MatchState, innings: InningsState) {
  innings.isCompleted = true;
  if (innings.inningsNumber === 1) {
    match.status = "INNINGS_BREAK";
  } else {
    finalizeMatch(match);
  }
}

function finalizeMatch(match: MatchState) {
  match.status = "COMPLETED";
  if (match.innings1) match.innings1.isCompleted = true;
  if (match.innings2) match.innings2.isCompleted = true;
  const { winnerTeamId, margin } = decideWinner(match);
  match.winnerTeamId = winnerTeamId;
  match.winnerMargin = margin;
  match.awards = calculateMatchAwards(match);
  match.completedAtISO = new Date().toISOString();
}

export const {
  createMatch,
  rematchSameTeams,
  loadMatch,
  clearMatch,
  setToss,
  startInnings,
  recordBall,
  confirmNewBatsman,
  selectBowler,
  swapStrikers,
  undoLastBall,
  addPlayer,
  removePlayer,
  editPlayer,
  endInningsManually,
  finishMatchManually,
} = matchSlice.actions;

export default matchSlice.reducer;
