import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import { useAuth } from '@/hooks/useAuth';

const options = [
  { label: 'Start New Match', desc: 'Set up teams and begin scoring', icon: '🏏', path: '/match/create', accent: 'pitch' },
  { label: 'Match History', desc: 'Browse completed & saved matches', icon: '📜', path: '/history', accent: 'sixer' },
  { label: 'Profile', desc: 'Your account and preferences', icon: '👤', path: '/profile', accent: 'stump' },
] as const;

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-night-800">
      <Navbar title="Dashboard" />
      <main className="p-4 sm:p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <p className="text-slate-400 text-sm">Welcome back,</p>
          <p className="font-display text-2xl font-bold text-slate-50">{user?.displayName ?? 'Umpire'}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {options.map((opt) => (
            <button
              key={opt.path}
              onClick={() => navigate(opt.path)}
              className="card p-5 text-left flex flex-col gap-3 hover:border-pitch-400/60 transition-colors active:scale-[0.98]"
            >
              <span className="text-3xl">{opt.icon}</span>
              <div>
                <p className="font-display font-semibold text-lg text-slate-100">{opt.label}</p>
                <p className="text-slate-400 text-sm mt-1">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
