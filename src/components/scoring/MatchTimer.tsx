import { useEffect, useState } from 'react';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function MatchTimer({ startedAtISO }: { startedAtISO: string }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsed = now - new Date(startedAtISO).getTime();

  return (
    <span className="scoreboard-digit text-xs text-slate-400">
      ⏱ {formatDuration(Math.max(elapsed, 0))}
    </span>
  );
}
