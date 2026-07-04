import type { BallEvent } from '@/types';

function ballLabel(event: BallEvent): { text: string; className: string } {
  switch (event.outcome) {
    case 'DOT':
      return { text: '•', className: 'bg-night-500 text-slate-300' };
    case 'WICKET':
      return { text: 'W', className: 'bg-stump-500 text-white' };
    case 'WIDE':
      return { text: `Wd${event.extraRuns > 1 ? '+' + (event.extraRuns - 1) : ''}`, className: 'bg-sixer-500/80 text-night-900' };
    case 'NO_BALL':
      return { text: `Nb${event.runsOffBat ? '+' + event.runsOffBat : ''}`, className: 'bg-sixer-500/80 text-night-900' };
    case 'BYE':
      return { text: `B${event.extraRuns}`, className: 'bg-night-400 text-slate-100' };
    case 'LEG_BYE':
      return { text: `LB${event.extraRuns}`, className: 'bg-night-400 text-slate-100' };
    case 'DEAD_BALL':
      return { text: 'DB', className: 'bg-night-400 text-slate-400' };
    default: {
      const runs = event.runsOffBat;
      return {
        text: String(runs),
        className:
          runs === 4 ? 'bg-sky-500 text-white' : runs === 6 ? 'bg-sixer-500 text-night-900' : 'bg-pitch-400 text-night-900',
      };
    }
  }
}

export default function BallTimeline({ history, ballsPerOver }: { history: BallEvent[]; ballsPerOver: number }) {
  if (history.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-4">No balls bowled yet.</p>;
  }

  // Group by over number for readability
  const overs = new Map<number, BallEvent[]>();
  history.forEach((e) => {
    const list = overs.get(e.overNumber) ?? [];
    list.push(e);
    overs.set(e.overNumber, list);
  });

  const overNumbers = Array.from(overs.keys()).sort((a, b) => b - a);

  return (
    <div className="flex flex-col gap-3">
      {overNumbers.map((overNum) => (
        <div key={overNum} className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 w-14 shrink-0">Over {overNum + 1}</span>
          <div className="flex gap-1.5 flex-wrap">
            {overs.get(overNum)!.map((e) => {
              const { text, className } = ballLabel(e);
              return (
                <span
                  key={e.id}
                  className={`h-8 min-w-8 px-1.5 rounded-full flex items-center justify-center text-xs font-semibold ${className}`}
                >
                  {text}
                </span>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-[11px] text-slate-600 mt-1">{ballsPerOver} balls per over</p>
    </div>
  );
}
