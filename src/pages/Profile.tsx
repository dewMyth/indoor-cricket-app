import Navbar from '@/components/common/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { signOutUser } from '@/firebase/authService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleDarkMode } from '@/store/slices/uiSlice';

export default function Profile() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);

  return (
    <div className="min-h-screen bg-night-800">
      <Navbar title="Profile" showBack />
      <main className="p-4 sm:p-6 max-w-md mx-auto">
        <div className="card p-6 flex flex-col items-center text-center mb-6">
          {user?.photoURL && (
            <img src={user.photoURL} alt="" className="h-20 w-20 rounded-full border-2 border-pitch-400 mb-4" />
          )}
          <p className="font-display text-xl font-bold text-slate-100">{user?.displayName}</p>
          <p className="text-slate-400 text-sm">{user?.email}</p>
        </div>

        <div className="card p-4 flex items-center justify-between mb-6">
          <div>
            <p className="font-medium text-slate-100">Dark mode</p>
            <p className="text-slate-500 text-xs">Optimized for indoor lighting & courts</p>
          </div>
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${isDarkMode ? 'bg-pitch-400 justify-end' : 'bg-night-500 justify-start'}`}
          >
            <span className="h-5 w-5 rounded-full bg-white block" />
          </button>
        </div>

        <button
          onClick={() => signOutUser()}
          className="w-full rounded-xl px-5 py-3 font-display font-semibold bg-stump-500 hover:bg-stump-600 text-white active:scale-[0.98] transition-transform"
        >
          Sign Out
        </button>
      </main>
    </div>
  );
}
