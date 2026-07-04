import { BrowserRouter } from 'react-router-dom';
import { useAuthListener } from '@/hooks/useAuth';
import AppRoutes from '@/routes/AppRoutes';
import ToastContainer from '@/components/common/ToastContainer';
import { useAppSelector } from '@/store/hooks';

function AppShell() {
  useAuthListener();
  const isLoading = useAppSelector((s) => s.ui.isLoading);
  const loadingMessage = useAppSelector((s) => s.ui.loadingMessage);

  return (
    <>
      <AppRoutes />
      <ToastContainer />
      {isLoading && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-night-500 border-t-pitch-400 animate-spin" />
          {loadingMessage && <p className="text-slate-300 text-sm">{loadingMessage}</p>}
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
