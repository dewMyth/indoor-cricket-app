import { useState } from 'react';
import type { Team } from '@/types';
import { useAppDispatch } from '@/store/hooks';
import { addPlayer, editPlayer, removePlayer } from '@/store/slices/matchSlice';

export default function TeamRosterEditor({ team, teamId }: { team: Team; teamId: 'A' | 'B' }) {
  const dispatch = useAppDispatch();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    dispatch(addPlayer({ teamId, name: newName }));
    setNewName('');
  };

  const startEdit = (id: string, current: string) => {
    setEditingId(id);
    setEditingValue(current);
  };

  const commitEdit = () => {
    if (editingId && editingValue.trim()) {
      dispatch(editPlayer({ teamId, playerId: editingId, name: editingValue }));
    }
    setEditingId(null);
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-lg text-slate-100">{team.name}</h3>
        <span className="text-xs text-slate-500">{team.players.length} players</span>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className="input-field flex-1"
          placeholder="Player name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} className="btn-primary px-4 whitespace-nowrap">
          Add
        </button>
      </div>

      <ul className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
        {team.players.map((p, idx) => (
          <li key={p.id} className="flex items-center gap-2 bg-night-700 rounded-xl px-3 py-2">
            <span className="text-slate-500 text-xs w-5">{idx + 1}</span>
            {editingId === p.id ? (
              <input
                autoFocus
                className="input-field flex-1 !py-1.5"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
                onBlur={commitEdit}
              />
            ) : (
              <button className="flex-1 text-left text-slate-200" onClick={() => startEdit(p.id, p.name)}>
                {p.name}
              </button>
            )}
            <button
              onClick={() => dispatch(removePlayer({ teamId, playerId: p.id }))}
              className="text-stump-400 hover:text-stump-500 text-sm px-2"
              aria-label={`Remove ${p.name}`}
            >
              ✕
            </button>
          </li>
        ))}
        {team.players.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-4">No players yet. Add your first player above.</p>
        )}
      </ul>
    </div>
  );
}
