// ---------- Auth ----------
export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

// ---------- Players / Teams ----------
export interface Player {
  id: string;
  name: string;
  isPlaying: boolean; // on the field / in the lineup
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

// ---------- Ball events ----------
export type BallOutcome =
  | "DOT"
  | "RUN_1"
  | "RUN_2"
  | "RUN_3"
  | "RUN_4"
  | "RUN_5"
  | "RUN_6"
  | "WICKET"
  | "WIDE"
  | "NO_BALL"
  | "BYE"
  | "LEG_BYE"
  | "DEAD_BALL";

export type DismissalType =
  | "BOWLED"
  | "CAUGHT"
  | "LBW"
  | "RUN_OUT"
  | "STUMPED"
  | "HIT_WICKET"
  | "RETIRED_HURT";

export interface DismissalInfo {
  type: DismissalType;
  batsmanId: string; // player dismissed
  bowlerId?: string; // credited bowler (not for run-out)
  fielderId?: string; // catch taken by / run-out by / stumped by
}

export interface BallEvent {
  id: string;
  inningsNumber: 1 | 2;
  overNumber: number;
  ballInOver: number;
  outcome: BallOutcome;
  runsOffBat: number;
  extraRuns: number;
  isLegal: boolean;
  strikerId: string;
  nonStrikerId: string | null; // was: string
  bowlerId: string;
  dismissal?: DismissalInfo;
  timestamp: number;
}

// ---------- Player stats ----------
export interface BattingStats {
  playerId: string;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  dismissalType?: DismissalType;
  dismissalBowlerId?: string; // add this
  dismissalFielderId?: string; // add this
  howOut?: string; // (already existed, unused — can keep or drop)
}

export interface BowlingStats {
  playerId: string;
  legalBalls: number;
  runsConceded: number;
  wickets: number;
  dots: number;
  wides: number;
  noBalls: number;
}

export interface FieldingStats {
  playerId: string;
  catches: number;
  runOuts: number;
  stumpings: number;
}

// ---------- Innings ----------
export interface InningsState {
  inningsNumber: 1 | 2;
  battingTeamId: string;
  bowlingTeamId: string;
  totalRuns: number;
  totalWickets: number;
  legalBallsBowled: number; // used to derive overs
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
  };
  strikerId: string | null;
  nonStrikerId: string | null;
  currentBowlerId: string | null;
  previousBowlerId: string | null;
  battingStats: Record<string, BattingStats>;
  bowlingStats: Record<string, BowlingStats>;
  fieldingStats: Record<string, FieldingStats>;
  ballHistory: BallEvent[];
  isCompleted: boolean;
  target?: number; // set for 2nd innings
}

// ---------- Match ----------
export type MatchStatus =
  | "SETUP"
  | "IN_PROGRESS"
  | "INNINGS_BREAK"
  | "COMPLETED";

export interface MatchConfig {
  teamAName: string;
  teamBName: string;
  venue?: string;
  totalOvers: number;
  ballsPerOver: number;
}

export interface MatchAwards {
  mvp: { playerId: string; teamId: string; score: number };
  bestBatsman: { playerId: string; teamId: string; score: number };
  bestBowler: { playerId: string; teamId: string; score: number };
  bestFielder: { playerId: string; teamId: string; score: number };
}

export interface MatchState {
  id: string;
  ownerUid: string;
  config: MatchConfig;
  teamA: Team;
  teamB: Team;
  tossWinnerTeamId?: string;
  battingFirstTeamId?: string;
  status: MatchStatus;
  currentInningsNumber: 1 | 2;
  innings1?: InningsState;
  innings2?: InningsState;
  winnerTeamId?: string;
  winnerMargin?: string;
  awards?: MatchAwards;
  createdAtISO: string;
  createdTimeLabel: string;
  updatedAtISO: string;
  completedAtISO?: string;
}

// ---------- Match history summary (Firestore doc) ----------
export interface MatchHistorySummary {
  id: string;
  ownerUid: string;
  teamAName: string;
  teamBName: string;
  venue?: string;
  date: string;
  winnerTeamName?: string;
  finalScoreLabel: string;
  status: MatchStatus;
}
