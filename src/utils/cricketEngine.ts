import { v4 as uuid } from "uuid";
import type {
  BallEvent,
  BallOutcome,
  BattingStats,
  BowlingStats,
  DismissalInfo,
  FieldingStats,
  InningsState,
} from "@/types";

export interface RecordBallParams {
  outcome: BallOutcome;
  /** Runs run by the batsmen in addition to a wide/no-ball penalty (e.g. "2 wides" -> extraRunsOnTop = 2). */
  extraRunsOnTop?: number;
  /** Runs awarded for a bye / leg-bye. */
  byeRuns?: number;
  dismissal?: DismissalInfo;
}

function ensureBatting(innings: InningsState, playerId: string): BattingStats {
  if (!innings.battingStats[playerId]) {
    innings.battingStats[playerId] = {
      playerId,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
    };
  }
  return innings.battingStats[playerId];
}

function ensureBowling(innings: InningsState, playerId: string): BowlingStats {
  if (!innings.bowlingStats[playerId]) {
    innings.bowlingStats[playerId] = {
      playerId,
      legalBalls: 0,
      runsConceded: 0,
      wickets: 0,
      dots: 0,
      wides: 0,
      noBalls: 0,
    };
  }
  return innings.bowlingStats[playerId];
}

function ensureFielding(
  innings: InningsState,
  playerId: string,
): FieldingStats {
  if (!innings.fieldingStats[playerId]) {
    innings.fieldingStats[playerId] = {
      playerId,
      catches: 0,
      runOuts: 0,
      stumpings: 0,
    };
  }
  return innings.fieldingStats[playerId];
}

const RUN_OUTCOME_MAP: Partial<Record<BallOutcome, number>> = {
  DOT: 0,
  RUN_1: 1,
  RUN_2: 2,
  RUN_3: 3,
  RUN_4: 4,
  RUN_5: 5,
  RUN_6: 6,
};

/**
 * Mutates `innings` in place (expected to be called on an Immer draft) to apply a single ball.
 * Returns the BallEvent that was recorded, for history/undo/timeline purposes.
 */
export function applyBallEvent(
  innings: InningsState,
  ballsPerOver: number,
  params: RecordBallParams,
): BallEvent {
  const { outcome, dismissal } = params;
  const extraRunsOnTop = params.extraRunsOnTop ?? 0;
  const byeRuns = params.byeRuns ?? 0;

  if (!innings.strikerId || !innings.nonStrikerId || !innings.currentBowlerId) {
    throw new Error(
      "Striker, non-striker and bowler must be set before recording a ball",
    );
  }

  const strikerId = innings.strikerId;
  const nonStrikerId = innings.nonStrikerId;
  const bowlerId = innings.currentBowlerId;

  const striker = ensureBatting(innings, strikerId);
  const bowler = ensureBowling(innings, bowlerId);

  let runsOffBat = 0;
  let extraRuns = 0;
  let isLegal = true;
  let rotateStrike = false;

  switch (outcome) {
    case "DOT":
    case "RUN_1":
    case "RUN_2":
    case "RUN_3":
    case "RUN_4":
    case "RUN_5":
    case "RUN_6": {
      runsOffBat = RUN_OUTCOME_MAP[outcome] ?? 0;
      striker.runs += runsOffBat;
      striker.ballsFaced += 1;
      if (runsOffBat === 4) striker.fours += 1;
      if (runsOffBat === 6) striker.sixes += 1;
      bowler.legalBalls += 1;
      bowler.runsConceded += runsOffBat;
      if (runsOffBat === 0) bowler.dots += 1;
      rotateStrike = runsOffBat % 2 === 1;
      break;
    }
    case "WICKET": {
      striker.ballsFaced += 1;
      striker.isOut = true;
      bowler.legalBalls += 1;
      if (dismissal) {
        striker.dismissalType = dismissal.type;
        striker.dismissalBowlerId =
          dismissal.type !== "RUN_OUT" ? dismissal.bowlerId : undefined;
        striker.dismissalFielderId = dismissal.fielderId;
        if (dismissal.type !== "RUN_OUT") {
          bowler.wickets += 1;
        }
        if (dismissal.fielderId) {
          const fielder = ensureFielding(innings, dismissal.fielderId);
          if (dismissal.type === "CAUGHT") fielder.catches += 1;
          if (dismissal.type === "RUN_OUT") fielder.runOuts += 1;
          if (dismissal.type === "STUMPED") fielder.stumpings += 1;
        }
      }
      innings.totalWickets += 1;
      break;
    }
    case "WIDE": {
      isLegal = false;
      extraRuns = 1 + extraRunsOnTop;
      innings.extras.wides += 1;
      bowler.runsConceded += extraRuns;
      bowler.wides += 1;
      rotateStrike = extraRunsOnTop % 2 === 1;
      break;
    }
    case "NO_BALL": {
      isLegal = false;
      runsOffBat = extraRunsOnTop;
      striker.runs += runsOffBat;
      striker.ballsFaced += 1;
      if (runsOffBat === 4) striker.fours += 1;
      if (runsOffBat === 6) striker.sixes += 1;
      extraRuns = 1;
      innings.extras.noBalls += 1;
      bowler.runsConceded += extraRuns + runsOffBat;
      bowler.noBalls += 1;
      rotateStrike = runsOffBat % 2 === 1;
      break;
    }
    case "BYE": {
      extraRuns = byeRuns;
      striker.ballsFaced += 1;
      innings.extras.byes += extraRuns;
      bowler.legalBalls += 1;
      rotateStrike = extraRuns % 2 === 1;
      break;
    }
    case "LEG_BYE": {
      extraRuns = byeRuns;
      striker.ballsFaced += 1;
      innings.extras.legByes += extraRuns;
      bowler.legalBalls += 1;
      rotateStrike = extraRuns % 2 === 1;
      break;
    }
    case "DEAD_BALL": {
      isLegal = false;
      break;
    }
  }

  const totalRunsThisBall = runsOffBat + extraRuns;
  innings.totalRuns += totalRunsThisBall;

  if (isLegal) {
    innings.legalBallsBowled += 1;
  }

  const event: BallEvent = {
    id: uuid(),
    inningsNumber: innings.inningsNumber,
    overNumber: Math.floor(innings.legalBallsBowled / ballsPerOver),
    ballInOver:
      innings.legalBallsBowled % ballsPerOver ||
      (isLegal ? ballsPerOver : innings.legalBallsBowled % ballsPerOver),
    outcome,
    runsOffBat,
    extraRuns,
    isLegal,
    strikerId,
    nonStrikerId,
    bowlerId,
    dismissal,
    timestamp: Date.now(),
  };

  innings.ballHistory.push(event);

  // Rotate strike for odd runs
  if (rotateStrike && outcome !== "WICKET") {
    innings.strikerId = nonStrikerId;
    innings.nonStrikerId = strikerId;
  }

  // End of over: rotate strike automatically and require new bowler
  if (isLegal && innings.legalBallsBowled % ballsPerOver === 0) {
    innings.strikerId =
      innings.nonStrikerId === strikerId ? nonStrikerId : innings.nonStrikerId;
    // simplest correct rotation at over-change: swap current striker/non-striker
    const s = innings.strikerId;
    const ns = innings.nonStrikerId;
    innings.strikerId = ns;
    innings.nonStrikerId = s;
    innings.previousBowlerId = innings.currentBowlerId;
    innings.currentBowlerId = null;
  }

  return event;
}

export function totalOversLegalBalls(
  totalOvers: number,
  ballsPerOver: number,
): number {
  return totalOvers * ballsPerOver;
}
