import type { BallOutcome } from '@/types';

interface ScoringButtonsProps {
  onRun: (runs: 0 | 1 | 2 | 3 | 4 | 5 | 6) => void;
  onWicket: () => void;
  onExtra: (outcome: 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE' | 'DEAD_BALL') => void;
  disabled?: boolean;
}

const runButtons: { label: string; value: 0 | 1 | 2 | 3 | 4 | 5 | 6; className: string }[] = [
  { label: '0', value: 0, className: 'bg-night-500 text-slate-100' },
  { label: '1', value: 1, className: 'bg-night-500 text-slate-100' },
  { label: '2', value: 2, className: 'bg-night-500 text-slate-100' },
  { label: '3', value: 3, className: 'bg-night-500 text-slate-100' },
  { label: '4', value: 4, className: 'bg-sky-500 text-white' },
  { label: '5', value: 5, className: 'bg-night-500 text-slate-100' },
  { label: '6', value: 6, className: 'bg-sixer-500 text-night-900' },
];

export default function ScoringButtons({ onRun, onWicket, onExtra, disabled }: ScoringButtonsProps) {
  return (
    <div className={`flex flex-col gap-3 p-4 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="grid grid-cols-4 gap-2.5">
        {runButtons.map((b) => (
          <button
            key={b.label}
            onClick={() => onRun(b.value)}
            className={`btn-score h-16 sm:h-20 text-2xl ${b.className}`}
          >
            {b.label}
          </button>
        ))}
        <button onClick={onWicket} className="btn-score h-16 sm:h-20 bg-stump-500 text-white shadow-glow-red text-xl">
          OUT
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {(
          [
            { label: 'Wide', value: 'WIDE' },
            { label: 'No Ball', value: 'NO_BALL' },
            { label: 'Bye', value: 'BYE' },
            { label: 'Leg Bye', value: 'LEG_BYE' },
            { label: 'Dead Ball', value: 'DEAD_BALL' },
          ] as { label: string; value: Extract<BallOutcome, 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE' | 'DEAD_BALL'> }[]
        ).map((e) => (
          <button
            key={e.value}
            onClick={() => onExtra(e.value)}
            className="btn-score h-12 sm:h-14 bg-night-600 border border-night-400 text-slate-300 text-xs sm:text-sm px-1"
          >
            {e.label}
          </button>
        ))}
      </div>
    </div>
  );
}
