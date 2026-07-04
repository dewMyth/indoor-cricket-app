import type { InningsState, MatchState } from '@/types';
import { calculateRequiredRunRate, calculateRunRate, findPlayerName, formatOvers } from '@/utils/cricketUtils';

export default function ScoreHeader({ match, innings }: { match: MatchState; innings: InningsState }) {
  const battingTeam = innings.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const bowlingTeam = innings.bowlingTeamId === match.teamA.id ? match.teamA : match.teamB;

  const overs = formatOvers(innings.legalBallsBowled, match.config.ballsPerOver);
  const runRate = calculateRunRate(innings.totalRuns, innings.legalBallsBowled, match.config.ballsPerOver);
  const striker = findPlayerName(match.teamA, match.teamB, innings.strikerId ?? undefined);
  const nonStriker = findPlayerName(match.teamA, match.teamB, innings.nonStrikerId ?? undefined);
  const bowler = findPlayerName(match.teamA, match.teamB, innings.currentBowlerId ?? undefined);

  const strikerStats = innings.strikerId ? innings.battingStats[innings.strikerId] : undefined;
  const nonStrikerStats = innings.nonStrikerId ? innings.battingStats[innings.nonStrikerId] : undefined;
  const bowlerStats = innings.currentBowlerId ? innings.bowlingStats[innings.currentBowlerId] : undefined;

  const reqRR =
    innings.inningsNumber === 2 && innings.target
      ? calculateRequiredRunRate(innings.target, innings.totalRuns, innings.legalBallsBowled, match.config.totalOvers, match.config.ballsPerOver)
      : undefined;

  const runsNeeded = innings.target ? innings.target - innings.totalRuns : undefined;

  return (
    <div className="bg-gradient-to-b from-night-700 to-night-800 border-b border-night-600 px-4 pt-4 pb-3">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
        <span className="truncate">{battingTeam.name} batting</span>
        <span className="truncate">vs {bowlingTeam.name}</span>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div className="scoreboard-digit text-5xl font-bold text-slate-50 leading-none">
          {innings.totalRuns}
          <span className="text-3xl text-slate-400">/{innings.totalWickets}</span>
        </div>
        <div className="text-right">
          <p className="scoreboard-digit text-2xl font-semibold text-pitch-400 leading-none">{overs}</p>
          <p className="text-xs text-slate-500">
            of {match.config.totalOvers}.0 overs
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
        <span>CRR: <span className="text-slate-200 font-medium">{runRate.toFixed(2)}</span></span>
        {innings.target && (
          <>
            <span>Target: <span className="text-slate-200 font-medium">{innings.target}</span></span>
            <span>
              Need <span className="text-sixer-400 font-medium">{Math.max(runsNeeded ?? 0, 0)}</span> · RRR{' '}
              <span className="text-slate-200 font-medium">{reqRR?.toFixed(2)}</span>
            </span>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-night-600/70 rounded-xl px-3 py-2 flex items-center justify-between">
          <span className="text-slate-200 font-medium truncate">★ {striker}</span>
          <span className="text-slate-400 scoreboard-digit text-xs">
            {strikerStats?.runs ?? 0} ({strikerStats?.ballsFaced ?? 0})
          </span>
        </div>
        <div className="bg-night-600/70 rounded-xl px-3 py-2 flex items-center justify-between">
          <span className="text-slate-400 truncate">{nonStriker}</span>
          <span className="text-slate-500 scoreboard-digit text-xs">
            {nonStrikerStats?.runs ?? 0} ({nonStrikerStats?.ballsFaced ?? 0})
          </span>
        </div>
        <div className="bg-night-600/70 rounded-xl px-3 py-2 flex items-center justify-between col-span-2">
          <span className="text-slate-300 truncate">🏏 {bowler}</span>
          <span className="text-slate-400 scoreboard-digit text-xs">
            {bowlerStats ? `${bowlerStats.wickets}/${bowlerStats.runsConceded}` : '-'} ·{' '}
            {bowlerStats ? formatOvers(bowlerStats.legalBalls, match.config.ballsPerOver) : '0.0'} ov
          </span>
        </div>
      </div>
    </div>
  );
}
