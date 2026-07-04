import { useState } from 'react';

interface ExtraRunsModalProps {
  kind: 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE';
  onConfirm: (runs: number) => void;
  onCancel: () => void;
}

const titleMap: Record<ExtraRunsModalProps['kind'], string> = {
  WIDE: 'Wide ball',
  NO_BALL: 'No ball',
  BYE: 'Bye',
  LEG_BYE: 'Leg bye',
};

const helpMap: Record<ExtraRunsModalProps['kind'], string> = {
  WIDE: 'How many runs did the batsmen run, in addition to the wide?',
  NO_BALL: 'How many runs were scored off the bat on this no ball?',
  BYE: 'How many byes were run?',
  LEG_BYE: 'How many leg byes were run?',
};

export default function ExtraRunsModal({ kind, onConfirm, onCancel }: ExtraRunsModalProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="card w-full max-w-sm p-5 animate-slide-up">
        <h3 className="font-display text-xl font-semibold text-slate-100 mb-1">{titleMap[kind]}</h3>
        <p className="text-slate-400 text-sm mb-4">{helpMap[kind]}</p>

        <div className="grid grid-cols-4 gap-2 mb-5">
          {[0, 1, 2, 3, 4, 5, 6].map((r) => (
            <button
              key={r}
              onClick={() => setSelected(r)}
              className={`h-12 rounded-xl font-display font-semibold text-lg ${
                selected === r ? 'bg-pitch-400 text-night-900' : 'bg-night-700 text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-primary flex-1" onClick={() => onConfirm(selected)}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
