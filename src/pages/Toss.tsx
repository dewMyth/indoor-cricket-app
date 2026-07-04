import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setToss } from '@/store/slices/matchSlice';

export default function Toss() {
  const match = useAppSelector((s) => s.match.currentMatch);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tossWinner, setTossWinner] = useState<string>('');
  const [decision, setDecision] = useState<'BAT' | 'BOWL' | ''>('');

  useEffect(() => {
    if (!match) navigate('/match/create');
  }, [match, navigate]);

  if (!match) return null;

  const handleContinue = () => {
    if (!tossWinner || !decision) return;
    const battingFirstTeamId =
      decision === 'BAT' ? tossWinner : tossWinner === match.teamA.id ? match.teamB.id : match.teamA.id;
    dispatch(setToss({ tossWinnerTeamId: tossWinner, battingFirstTeamId }));
    navigate('/match/start-innings');
  };

  return (
    <div className="min-h-screen bg-night-800">
      <Navbar title="Toss" showBack />
      <main className="p-4 sm:p-6 max-w-md mx-auto flex flex-col gap-6">
        <div>
          <label className="label-field">Toss won by</label>
          <div className="grid grid-cols-2 gap-3">
            {[match.teamA, match.teamB].map((t) => (
              <button
                key={t.id}
                onClick={() => setTossWinner(t.id)}
                className={`card p-4 font-display font-semibold ${tossWinner === t.id ? 'border-pitch-400 bg-night-500' : ''}`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-field">Elected to</label>
          <div className="grid grid-cols-2 gap-3">
            {(['BAT', 'BOWL'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDecision(d)}
                className={`card p-4 font-display font-semibold ${decision === d ? 'border-pitch-400 bg-night-500' : ''}`}
              >
                {d === 'BAT' ? 'Bat first' : 'Bowl first'}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleContinue} disabled={!tossWinner || !decision} className="btn-primary w-full disabled:opacity-40">
          Continue
        </button>
      </main>
    </div>
  );
}
