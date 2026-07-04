import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import LoadingScreen from '@/components/common/LoadingScreen';
import { getMatch } from '@/firebase/firestoreService';
import type { InningsState, MatchState } from '@/types';
import { formatOvers } from '@/utils/cricketUtils';

export default function MatchDetail() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<MatchState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) return;
    getMatch(matchId)
      .then(setMatch)
      .finally(() => setLoading(false));
  }, [matchId]);

  if (loading) return <LoadingScreen message="Loading scorecard..." />;
  if (!match) {
    return (
      <div className="min-h-screen bg-night-800">
        <Navbar title="Scorecard" showBack />
        <p className="text-slate-500 text-center py-10">Match not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-800">
      <Navbar title={`${match.teamA.name} vs ${match.teamB.name}`} showBack />
      <main className="p-4 sm:p-6 max-w-2xl mx-auto flex flex-col gap-5">
        <div className="card p-4 text-sm text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
          <span>{new Date(match.createdAtISO).toLocaleString()}</span>
          {match.config.venue && <span>· {match.config.venue}</span>}
          <span>· {match.config.totalOvers} overs</span>
        </div>

        {match.winnerTeamId && (
          <div className="card p-4 text-center bg-pitch-500/10 border-pitch-400/40">
            <p className="font-display font-semibold text-slate-100">
              {match.winnerTeamId === match.teamA.id ? match.teamA.name : match.teamB.name} won{' '}
              {match.winnerMargin ? `by ${match.winnerMargin}` : ''}
            </p>
          </div>
        )}

        {[match.innings1, match.innings2].filter(Boolean).map((innings) => (
          <InningsCard key={innings!.inningsNumber} match={match} innings={innings!} />
        ))}

        <button onClick={() => navigate('/history')} className="btn-secondary w-full">
          Back to History
        </button>
      </main>
    </div>
  );
}

function InningsCard({ match, innings }: { match: MatchState; innings: InningsState }) {
  const battingTeam = innings.battingTeamId === match.teamA.id ? match.teamA : match.teamB;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-lg text-slate-100">{battingTeam.name}</h3>
        <span className="scoreboard-digit text-slate-200">
          {innings.totalRuns}/{innings.totalWickets} ({formatOvers(innings.legalBallsBowled, match.config.ballsPerOver)} ov)
        </span>
      </div>

      <table className="w-full text-sm mb-3">
        <thead>
          <tr className="text-slate-500 text-left">
            <th className="font-normal pb-1">Batsman</th>
            <th className="font-normal pb-1 text-right">R</th>
            <th className="font-normal pb-1 text-right">B</th>
            <th className="font-normal pb-1 text-right">4s</th>
            <th className="font-normal pb-1 text-right">6s</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(innings.battingStats).map((b) => {
            const player = battingTeam.players.find((p) => p.id === b.playerId);
            return (
              <tr key={b.playerId} className="border-t border-night-500/60">
                <td className="py-1.5 text-slate-200">
                  {player?.name ?? 'Unknown'} {!b.isOut && <span className="text-pitch-400 text-xs">*</span>}
                </td>
                <td className="py-1.5 text-right text-slate-200">{b.runs}</td>
                <td className="py-1.5 text-right text-slate-400">{b.ballsFaced}</td>
                <td className="py-1.5 text-right text-slate-400">{b.fours}</td>
                <td className="py-1.5 text-right text-slate-400">{b.sixes}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="text-xs text-slate-500 mb-3">
        Extras: {innings.extras.wides + innings.extras.noBalls + innings.extras.byes + innings.extras.legByes} (wd{' '}
        {innings.extras.wides}, nb {innings.extras.noBalls}, b {innings.extras.byes}, lb {innings.extras.legByes})
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 text-left">
            <th className="font-normal pb-1">Bowler</th>
            <th className="font-normal pb-1 text-right">O</th>
            <th className="font-normal pb-1 text-right">R</th>
            <th className="font-normal pb-1 text-right">W</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(innings.bowlingStats).map((bw) => {
            const bowlingTeam = innings.bowlingTeamId === match.teamA.id ? match.teamA : match.teamB;
            const player = bowlingTeam.players.find((p) => p.id === bw.playerId);
            return (
              <tr key={bw.playerId} className="border-t border-night-500/60">
                <td className="py-1.5 text-slate-200">{player?.name ?? 'Unknown'}</td>
                <td className="py-1.5 text-right text-slate-400">{formatOvers(bw.legalBalls, match.config.ballsPerOver)}</td>
                <td className="py-1.5 text-right text-slate-400">{bw.runsConceded}</td>
                <td className="py-1.5 text-right text-slate-200">{bw.wickets}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
