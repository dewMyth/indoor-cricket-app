import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { calculateTarget } from '@/utils/cricketUtils';

export default function InningsBreak() {
  const match = useAppSelector((s) => s.match.currentMatch);
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!match) navigate('/dashboard');
    else if (match.status !== 'INNINGS_BREAK') navigate('/match/score');
  }, [match, navigate]);

  if (!match || !match.innings1) return null;

  const battingFirstTeam = match.innings1.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const battingSecondTeam = battingFirstTeam.id === match.teamA.id ? match.teamB : match.teamA;
  const target = calculateTarget(match.innings1.totalRuns);

  return (
    <div className="min-h-screen bg-night-800">
      <Navbar title="Innings Break" />
      <main className="p-4 sm:p-6 max-w-md mx-auto flex flex-col gap-6">
        <div className="card p-6 text-center">
          <p className="text-slate-400 text-sm mb-1">{battingFirstTeam.name} scored</p>
          <p className="scoreboard-digit text-4xl font-bold text-slate-50">
            {match.innings1.totalRuns}/{match.innings1.totalWickets}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-slate-300 text-center">
            <span className="font-semibold text-slate-100">{battingSecondTeam.name}</span> need{' '}
            <span className="font-semibold text-sixer-400">{target}</span> runs to win
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input type="checkbox" checked={ready} onChange={(e) => setReady(e.target.checked)} className="accent-pitch-400" />
          Team is ready to begin the second innings
        </label>

        <button disabled={!ready} onClick={() => navigate('/match/start-innings')} className="btn-primary w-full disabled:opacity-40">
          Start 2nd Innings
        </button>
      </main>
    </div>
  );
}
