import { useState } from 'react';
import type { Team } from '@/types';

interface NewBatsmanModalProps {
  battingTeam: Team;
  outPlayerName: string;
  unavailablePlayerIds: string[];
  onConfirm: (playerId: string) => void;
}

export default function NewBatsmanModal({ battingTeam, outPlayerName, unavailablePlayerIds, onConfirm }: NewBatsmanModalProps) {
  const [playerId, setPlayerId] = useState('');
  const available = battingTeam.players.filter((p) => !unavailablePlayerIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="card w-full max-w-sm p-5 animate-slide-up">
        <h3 className="font-display text-xl font-semibold text-slate-100 mb-1">Wicket!</h3>
        <p className="text-slate-400 text-sm mb-4">{outPlayerName} is out. Who's coming in to bat?</p>

        <select className="input-field mb-5" value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
          <option value="">Select next batsman</option>
          {available.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <button className="btn-primary w-full disabled:opacity-40" disabled={!playerId} onClick={() => onConfirm(playerId)}>
          Confirm Batsman
        </button>
      </div>
    </div>
  );
}
