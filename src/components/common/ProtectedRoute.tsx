import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return <LoadingScreen message="Checking your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
