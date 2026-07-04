import type {
  BattingStats,
  BowlingStats,
  FieldingStats,
  InningsState,
  MatchAwards,
  MatchState,
  Team,
} from "@/types";

/** Convert legal balls bowled into "overs.balls" display, respecting configurable balls-per-over */
export function formatOvers(legalBalls: number, ballsPerOver: number): string {
  const overs = Math.floor(legalBalls / ballsPerOver);
  const balls = legalBalls % ballsPerOver;
  return `${overs}.${balls}`;
}

export function oversAsFloatForRunRate(
  legalBalls: number,
  ballsPerOver: number,
): number {
  return legalBalls / ballsPerOver;
}

export function calculateRunRate(
  runs: number,
  legalBalls: number,
  ballsPerOver: number,
): number {
  const overs = oversAsFloatForRunRate(legalBalls, ballsPerOver);
  if (overs === 0) return 0;
  return Math.round((runs / overs) * 100) / 100;
}

/** Required run rate for a chasing side */
export function calculateRequiredRunRate(
  target: number,
  currentRuns: number,
  legalBallsBowled: number,
  totalOvers: number,
  ballsPerOver: number,
): number {
  const totalLegalBalls = totalOvers * ballsPerOver;
  const ballsRemaining = totalLegalBalls - legalBallsBowled;
  if (ballsRemaining <= 0) return 0;
  const runsNeeded = target - currentRuns;
  if (runsNeeded <= 0) return 0;
  const oversRemaining = ballsRemaining / ballsPerOver;
  return Math.round((runsNeeded / oversRemaining) * 100) / 100;
}

export function calculateTarget(firstInningsRuns: number): number {
  return firstInningsRuns + 1;
}

export function isInningsOver(
  innings: InningsState,
  config: { totalOvers: number; ballsPerOver: number },
  totalPlayers: number,
): boolean {
  const maxLegalBalls = config.totalOvers * config.ballsPerOver;
  const allOut = innings.totalWickets >= totalPlayers; // last man stands: everyone including the last man is out
  const oversUp = innings.legalBallsBowled >= maxLegalBalls;
  const targetChased =
    innings.inningsNumber === 2 &&
    innings.target !== undefined &&
    innings.totalRuns >= innings.target;
  return allOut || oversUp || targetChased;
}

/**
 * Weighted scoring algorithm for MVP / Best Batsman / Best Bowler / Best Fielder.
 *
 * Batting score  = runs*1  + fours*1 + sixes*2 + strikeRateBonus
 * Bowling score  = wickets*20 + dots*1 - (runsConceded * economyPenaltyFactor)
 * Fielding score = catches*10 + runOuts*10 + stumpings*10
 * MVP score      = battingScore + bowlingScore + fieldingScore
 */
export function computeBattingScore(stats: BattingStats): number {
  const strikeRate =
    stats.ballsFaced > 0 ? (stats.runs / stats.ballsFaced) * 100 : 0;
  const strikeRateBonus =
    stats.ballsFaced >= 6 ? Math.max(0, (strikeRate - 100) / 10) : 0;
  return stats.runs * 1 + stats.fours * 1 + stats.sixes * 2 + strikeRateBonus;
}

export function computeBowlingScore(
  stats: BowlingStats,
  ballsPerOver: number,
): number {
  const overs = stats.legalBalls / ballsPerOver;
  const economy = overs > 0 ? stats.runsConceded / overs : 0;
  const economyPenalty = overs >= 1 ? Math.max(0, economy - 6) * 2 : 0;
  return stats.wickets * 20 + stats.dots * 1 - economyPenalty;
}

export function computeFieldingScore(stats: FieldingStats): number {
  return stats.catches * 10 + stats.runOuts * 10 + stats.stumpings * 10;
}

interface PlayerAggregate {
  playerId: string;
  teamId: string;
  battingScore: number;
  bowlingScore: number;
  fieldingScore: number;
}

export function calculateMatchAwards(
  match: MatchState,
): MatchAwards | undefined {
  const { innings1, innings2, config, teamA, teamB } = match;
  if (!innings1) return undefined;

  const aggregates = new Map<string, PlayerAggregate>();

  const teamIdForPlayer = (playerId: string): string => {
    if (teamA.players.some((p) => p.id === playerId)) return teamA.id;
    if (teamB.players.some((p) => p.id === playerId)) return teamB.id;
    return "";
  };

  const ensure = (playerId: string): PlayerAggregate => {
    let agg = aggregates.get(playerId);
    if (!agg) {
      agg = {
        playerId,
        teamId: teamIdForPlayer(playerId),
        battingScore: 0,
        bowlingScore: 0,
        fieldingScore: 0,
      };
      aggregates.set(playerId, agg);
    }
    return agg;
  };

  const inningsList = [innings1, innings2].filter(Boolean) as InningsState[];

  for (const innings of inningsList) {
    Object.values(innings.battingStats).forEach((bs) => {
      const agg = ensure(bs.playerId);
      agg.battingScore += computeBattingScore(bs);
    });
    Object.values(innings.bowlingStats).forEach((bw) => {
      const agg = ensure(bw.playerId);
      agg.bowlingScore += computeBowlingScore(bw, config.ballsPerOver);
    });
    Object.values(innings.fieldingStats).forEach((fs) => {
      const agg = ensure(fs.playerId);
      agg.fieldingScore += computeFieldingScore(fs);
    });
  }

  if (aggregates.size === 0) return undefined;

  const list = Array.from(aggregates.values());

  const bestBatsman = [...list].sort(
    (a, b) => b.battingScore - a.battingScore,
  )[0];
  const bestBowler = [...list].sort(
    (a, b) => b.bowlingScore - a.bowlingScore,
  )[0];
  const bestFielder = [...list].sort(
    (a, b) => b.fieldingScore - a.fieldingScore,
  )[0];
  const mvp = [...list].sort(
    (a, b) =>
      b.battingScore +
      b.bowlingScore +
      b.fieldingScore -
      (a.battingScore + a.bowlingScore + a.fieldingScore),
  )[0];

  return {
    mvp: {
      playerId: mvp.playerId,
      teamId: mvp.teamId,
      score: round1(mvp.battingScore + mvp.bowlingScore + mvp.fieldingScore),
    },
    bestBatsman: {
      playerId: bestBatsman.playerId,
      teamId: bestBatsman.teamId,
      score: round1(bestBatsman.battingScore),
    },
    bestBowler: {
      playerId: bestBowler.playerId,
      teamId: bestBowler.teamId,
      score: round1(bestBowler.bowlingScore),
    },
    bestFielder: {
      playerId: bestFielder.playerId,
      teamId: bestFielder.teamId,
      score: round1(bestFielder.fieldingScore),
    },
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function findPlayerName(
  teamA: Team,
  teamB: Team,
  playerId?: string,
): string {
  if (!playerId) return "-";
  const player = [...teamA.players, ...teamB.players].find(
    (p) => p.id === playerId,
  );
  return player?.name ?? "Unknown";
}

export function decideWinner(match: MatchState): {
  winnerTeamId?: string;
  margin?: string;
} {
  const { innings1, innings2 } = match;
  if (!innings1 || !innings2) return {};

  if (innings2.totalRuns > innings1.totalRuns) {
    const totalPlayersBatting2 =
      match.teamA.id === innings2.battingTeamId
        ? match.teamA.players.length
        : match.teamB.players.length;
    const wicketsInHand = totalPlayersBatting2 - 1 - innings2.totalWickets;
    return {
      winnerTeamId: innings2.battingTeamId,
      margin: `${Math.max(wicketsInHand, 0)} wicket${wicketsInHand === 1 ? "" : "s"}`,
    };
  }
  if (innings1.totalRuns > innings2.totalRuns) {
    return {
      winnerTeamId: innings1.battingTeamId,
      margin: `${innings1.totalRuns - innings2.totalRuns} run${innings1.totalRuns - innings2.totalRuns === 1 ? "" : "s"}`,
    };
  }
  return { winnerTeamId: undefined, margin: "Match tied" };
}

export function formatDismissal(
  stats: BattingStats,
  teamA: Team,
  teamB: Team,
): string {
  if (!stats.isOut) return "not out";
  if (!stats.dismissalType) return "out";

  const bowlerName = stats.dismissalBowlerId
    ? findPlayerName(teamA, teamB, stats.dismissalBowlerId)
    : undefined;
  const fielderName = stats.dismissalFielderId
    ? findPlayerName(teamA, teamB, stats.dismissalFielderId)
    : undefined;

  switch (stats.dismissalType) {
    case "CAUGHT":
      return `c ${fielderName ?? "?"} b ${bowlerName ?? "?"}`;
    case "BOWLED":
      return `b ${bowlerName ?? "?"}`;
    case "LBW":
      return `lbw b ${bowlerName ?? "?"}`;
    case "STUMPED":
      return `st ${fielderName ?? "?"} b ${bowlerName ?? "?"}`;
    case "RUN_OUT":
      return `run out (${fielderName ?? "?"})`;
    case "HIT_WICKET":
      return `hit wicket b ${bowlerName ?? "?"}`;
    case "RETIRED_HURT":
      return "retired hurt";
    default:
      return "out";
  }
}
