import { useState } from 'react';
import type { Team } from '@/types';

interface NewBowlerModalProps {
  bowlingTeam: Team;
  previousBowlerId?: string | null;
  onConfirm: (playerId: string) => void;
}

export default function NewBowlerModal({ bowlingTeam, previousBowlerId, onConfirm }: NewBowlerModalProps) {
  const [playerId, setPlayerId] = useState('');

  return (
    <div className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="card w-full max-w-sm p-5 animate-slide-up">
        <h3 className="font-display text-xl font-semibold text-slate-100 mb-1">Over complete</h3>
        <p className="text-slate-400 text-sm mb-4">Select the bowler for the next over.</p>

        <select className="input-field mb-2" value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
          <option value="">Select bowler</option>
          {bowlingTeam.players.map((p) => (
            <option key={p.id} value={p.id} disabled={p.id === previousBowlerId}>
              {p.name} {p.id === previousBowlerId ? '(bowled last over)' : ''}
            </option>
          ))}
        </select>

        <button className="btn-primary w-full mt-3 disabled:opacity-40" disabled={!playerId} onClick={() => onConfirm(playerId)}>
          Confirm Bowler
        </button>
      </div>
    </div>
  );
}
