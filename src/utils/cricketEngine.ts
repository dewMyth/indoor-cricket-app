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
  extraRunsOnTop?: number;
  byeRuns?: number;
  /** Runs completed by the batsmen before a run-out occurred. */
  runsCompleted?: number;
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

  if (!innings.strikerId || !innings.currentBowlerId) {
    throw new Error("Striker and bowler must be set before recording a ball");
  }

  const strikerId = innings.strikerId;
  const nonStrikerId = innings.nonStrikerId; // may be null when the last man is batting alone
  const bowlerId = innings.currentBowlerId;

  // Snapshot the ball count *before* this delivery - this over/ball position
  // belongs to the over currently in progress, regardless of whether this
  // particular ball ends up being the last legal one in it.
  const ballsBeforeThisDelivery = innings.legalBallsBowled;

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
      bowler.legalBalls += 1;

      const isRunOut = dismissal?.type === "RUN_OUT";
      const runsCompleted = isRunOut ? (params.runsCompleted ?? 0) : 0;

      if (runsCompleted > 0) {
        // Runs completed before a run-out are credited to whoever was on strike,
        // same as normal running between wickets, and count against the bowler.
        runsOffBat = runsCompleted;
        striker.runs += runsOffBat;
        bowler.runsConceded += runsOffBat;
        if (runsOffBat === 4) striker.fours += 1;
        if (runsOffBat === 6) striker.sixes += 1;
      }

      // The batsmen cross ends once per completed run - mirror that so we can
      // work out which physical end (striker/non-striker slot) is now vacant.
      if (isRunOut && runsCompleted % 2 === 1 && nonStrikerId) {
        innings.strikerId = nonStrikerId;
        innings.nonStrikerId = strikerId;
      }

      if (dismissal) {
        const dismissedBatting = ensureBatting(innings, dismissal.batsmanId);
        dismissedBatting.isOut = true;
        dismissedBatting.dismissalType = dismissal.type;
        dismissedBatting.dismissalBowlerId =
          dismissal.type !== "RUN_OUT" ? dismissal.bowlerId : undefined;
        dismissedBatting.dismissalFielderId = dismissal.fielderId;

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
    overNumber: Math.floor(ballsBeforeThisDelivery / ballsPerOver),
    ballInOver: (ballsBeforeThisDelivery % ballsPerOver) + 1,
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
  if (rotateStrike && outcome !== "WICKET" && nonStrikerId) {
    innings.strikerId = nonStrikerId;
    innings.nonStrikerId = strikerId;
  }

  // End of over: rotate strike automatically and require new bowler
  if (isLegal && innings.legalBallsBowled % ballsPerOver === 0) {
    if (!rotateStrike && nonStrikerId) {
      const s = innings.strikerId;
      const ns = innings.nonStrikerId;
      innings.strikerId = ns;
      innings.nonStrikerId = s;
    }
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
