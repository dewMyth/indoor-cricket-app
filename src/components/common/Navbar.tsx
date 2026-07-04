import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar({ title, showBack = false }: { title: string; showBack?: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-night-800/95 backdrop-blur border-b border-night-600 px-4 py-3 flex items-center gap-3">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-night-600 hover:bg-night-500 text-slate-300"
          aria-label="Go back"
        >
          ←
        </button>
      )}
      <h1 className="font-display font-semibold text-lg text-slate-100 flex-1 truncate">{title}</h1>
      {user?.photoURL && (
        <button onClick={() => navigate('/profile')} aria-label="Profile">
          <img src={user.photoURL} alt="" className="h-9 w-9 rounded-full border border-night-500 object-cover" />
        </button>
      )}
    </header>
  );
}
