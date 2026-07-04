import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { signInWithGoogle } from '@/firebase/authService';
import { useAuth } from '@/hooks/useAuth';
import Spinner from '@/components/common/Spinner';

export default function Login() {
  const { user, isInitializing } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isInitializing && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Sign-in failed. Please try again.');
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-night-800 px-6 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-pitch-400/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sixer-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        <div className="h-16 w-16 rounded-2xl bg-pitch-400 flex items-center justify-center shadow-glow mb-6">
          <span className="text-3xl">🏏</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-50 tracking-tight text-center">
          Indoor Cricket Scorer
        </h1>
        <p className="text-slate-400 text-center mt-2 mb-10">
          Fast, accurate ball-by-ball scoring built for umpires on the move.
        </p>

        <button
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="w-full flex items-center justify-center gap-3 bg-white text-night-900 font-display
            font-semibold rounded-xl px-5 py-3.5 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-70"
        >
          {isSigningIn ? (
            <Spinner size={20} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6 29.5 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.4 0 10.3-1.9 14-5.4l-6.5-5.4C29.4 34.9 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5c3.3 6.4 9.9 10.9 17.8 10.9z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5v.1l6.5 5.4C37.4 39.4 44 34 44 24c0-1.3-.1-2.3-.4-3.5z" />
            </svg>
          )}
          Sign in with Google
        </button>

        {error && <p className="text-stump-400 text-sm mt-4 text-center">{error}</p>}

        <p className="text-slate-600 text-xs text-center mt-10">
          Only signed-in umpires can create and score matches.
        </p>
      </div>
    </div>
  );
}
