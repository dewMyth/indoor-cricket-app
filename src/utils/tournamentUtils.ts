import type {
  MatchState,
  TournamentPlayerAggregate,
  TournamentStandings,
  TournamentTeamAggregate,
} from "@/types";
import {
  computeBattingScore,
  computeBowlingScore,
  computeFieldingScore,
} from "./cricketUtils";

const nameKey = (s: string) => s.trim().toLowerCase();

export function computeTournamentStandings(
  matches: MatchState[],
): TournamentStandings {
  const teamAgg = new Map<string, TournamentTeamAggregate>();
  const playerAgg = new Map<string, TournamentPlayerAggregate>();

  const ensureTeam = (name: string): TournamentTeamAggregate => {
    const key = nameKey(name);
    let t = teamAgg.get(key);
    if (!t) {
      t = { teamName: name, played: 0, won: 0, lost: 0, tied: 0, points: 0 };
      teamAgg.set(key, t);
    }
    return t;
  };

  const ensurePlayer = (
    playerName: string,
    teamName: string,
  ): TournamentPlayerAggregate => {
    const key = `${nameKey(teamName)}::${nameKey(playerName)}`;
    let p = playerAgg.get(key);
    if (!p) {
      p = {
        playerName,
        teamName,
        matchesPlayed: 0,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        wickets: 0,
        legalBalls: 0,
        runsConceded: 0,
        dots: 0,
        catches: 0,
        runOuts: 0,
        stumpings: 0,
        battingScore: 0,
        bowlingScore: 0,
        fieldingScore: 0,
        totalScore: 0,
      };
      playerAgg.set(key, p);
    }
    return p;
  };

  // Assumes a consistent balls-per-over across the tournament; uses the first
  // completed match's value for the economy-penalty portion of bowling scores.
  const ballsPerOver = matches[0]?.config.ballsPerOver ?? 6;

  for (const match of matches) {
    if (match.status !== "COMPLETED" || !match.innings1 || !match.innings2)
      continue;

    const teamA = ensureTeam(match.teamA.name);
    const teamB = ensureTeam(match.teamB.name);
    teamA.played += 1;
    teamB.played += 1;

    if (!match.winnerTeamId) {
      teamA.tied += 1;
      teamB.tied += 1;
      teamA.points += 1;
      teamB.points += 1;
    } else {
      const winnerName =
        match.winnerTeamId === match.teamA.id
          ? match.teamA.name
          : match.teamB.name;
      const winner = ensureTeam(winnerName);
      const loser = winnerName === match.teamA.name ? teamB : teamA;
      winner.won += 1;
      winner.points += 2;
      loser.lost += 1;
    }

    const teamNameForPlayer = (playerId: string): string =>
      match.teamA.players.some((p) => p.id === playerId)
        ? match.teamA.name
        : match.teamB.name;

    const touched = new Set<string>();
    const touchPlayer = (playerId: string, teamName: string) => {
      const player = [...match.teamA.players, ...match.teamB.players].find(
        (p) => p.id === playerId,
      );
      if (!player) return teamName; // fallback, shouldn't happen
      const agg = ensurePlayer(player.name, teamName);
      const key = `${nameKey(teamName)}::${nameKey(player.name)}`;
      if (!touched.has(key)) {
        agg.matchesPlayed += 1;
        touched.add(key);
      }
      return agg;
    };

    for (const innings of [match.innings1, match.innings2]) {
      Object.values(innings.battingStats).forEach((b) => {
        const teamName = teamNameForPlayer(b.playerId);
        const agg = touchPlayer(b.playerId, teamName);
        if (typeof agg === "string") return;
        agg.runs += b.runs;
        agg.ballsFaced += b.ballsFaced;
        agg.fours += b.fours;
        agg.sixes += b.sixes;
      });
      Object.values(innings.bowlingStats).forEach((bw) => {
        const teamName = teamNameForPlayer(bw.playerId);
        const agg = touchPlayer(bw.playerId, teamName);
        if (typeof agg === "string") return;
        agg.wickets += bw.wickets;
        agg.legalBalls += bw.legalBalls;
        agg.runsConceded += bw.runsConceded;
        agg.dots += bw.dots;
      });
      Object.values(innings.fieldingStats).forEach((f) => {
        const teamName = teamNameForPlayer(f.playerId);
        const agg = touchPlayer(f.playerId, teamName);
        if (typeof agg === "string") return;
        agg.catches += f.catches;
        agg.runOuts += f.runOuts;
        agg.stumpings += f.stumpings;
      });
    }
  }

  // Compute weighted scores using the same formulas as a single match's MVP algorithm.
  for (const p of playerAgg.values()) {
    p.battingScore = computeBattingScore({
      playerId: "",
      runs: p.runs,
      ballsFaced: p.ballsFaced,
      fours: p.fours,
      sixes: p.sixes,
      isOut: false,
    });
    p.bowlingScore = computeBowlingScore(
      {
        playerId: "",
        legalBalls: p.legalBalls,
        runsConceded: p.runsConceded,
        wickets: p.wickets,
        dots: p.dots,
        wides: 0,
        noBalls: 0,
      },
      ballsPerOver,
    );
    p.fieldingScore = computeFieldingScore({
      playerId: "",
      catches: p.catches,
      runOuts: p.runOuts,
      stumpings: p.stumpings,
    });
    p.totalScore =
      Math.round((p.battingScore + p.bowlingScore + p.fieldingScore) * 10) / 10;
  }

  const players = Array.from(playerAgg.values());
  const teams = Array.from(teamAgg.values()).sort(
    (a, b) => b.points - a.points,
  );

  const seriesMvp = [...players].sort((a, b) => b.totalScore - a.totalScore)[0];
  const bestBatsman = [...players].sort(
    (a, b) => b.battingScore - a.battingScore,
  )[0];
  const bestBowler = [...players].sort(
    (a, b) => b.bowlingScore - a.bowlingScore,
  )[0];
  const bestFielder = [...players].sort(
    (a, b) => b.fieldingScore - a.fieldingScore,
  )[0];
  const orangeCap = [...players].sort((a, b) => b.runs - a.runs).slice(0, 5);
  const purpleCap = [...players]
    .sort((a, b) => b.wickets - a.wickets)
    .slice(0, 5);

  return {
    teams,
    seriesWinnerTeamName: teams[0]?.teamName,
    seriesMvp,
    bestBatsman,
    bestBowler,
    bestFielder,
    orangeCap,
    purpleCap,
  };
}
