import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import TeamRosterEditor from '@/components/team/TeamRosterEditor';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { pushToast } from '@/store/slices/uiSlice';

export default function TeamSetup() {
  const match = useAppSelector((s) => s.match.currentMatch);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!match) navigate('/match/create');
  }, [match, navigate]);

  if (!match) return null;

  const canContinue = match.teamA.players.length >= 2 && match.teamB.players.length >= 2;

  const handleContinue = () => {
    if (!canContinue) {
      dispatch(pushToast({ message: 'Each team needs at least 2 players.', type: 'error' }));
      return;
    }
    navigate('/match/toss');
  };

  return (
    <div className="min-h-screen bg-night-800">
      <Navbar title="Team Setup" showBack />
      <main className="p-4 sm:p-6 max-w-3xl mx-auto flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <TeamRosterEditor team={match.teamA} teamId="A" />
          <TeamRosterEditor team={match.teamB} teamId="B" />
        </div>

        <button onClick={handleContinue} className="btn-primary w-full mt-2">
          Continue to Toss
        </button>
      </main>
    </div>
  );
}
