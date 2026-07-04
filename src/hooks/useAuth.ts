import { useEffect } from 'react';
import { subscribeToAuthChanges } from '@/firebase/authService';
import { setUser } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function useAuthListener() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      dispatch(setUser(user));
    });
    return unsubscribe;
  }, [dispatch]);
}

export function useAuth() {
  return useAppSelector((state) => state.auth);
}
