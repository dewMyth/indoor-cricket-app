import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import CreateMatch from '@/pages/CreateMatch';
import TeamSetup from '@/pages/TeamSetup';
import Toss from '@/pages/Toss';
import StartInnings from '@/pages/StartInnings';
import Scoring from '@/pages/Scoring';
import InningsBreak from '@/pages/InningsBreak';
import MatchSummary from '@/pages/MatchSummary';
import MatchHistory from '@/pages/MatchHistory';
import MatchDetail from '@/pages/MatchDetail';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      <Route path="/match/create" element={<ProtectedRoute><CreateMatch /></ProtectedRoute>} />
      <Route path="/match/teams" element={<ProtectedRoute><TeamSetup /></ProtectedRoute>} />
      <Route path="/match/toss" element={<ProtectedRoute><Toss /></ProtectedRoute>} />
      <Route path="/match/start-innings" element={<ProtectedRoute><StartInnings /></ProtectedRoute>} />
      <Route path="/match/score" element={<ProtectedRoute><Scoring /></ProtectedRoute>} />
      <Route path="/match/innings-break" element={<ProtectedRoute><InningsBreak /></ProtectedRoute>} />
      <Route path="/match/summary" element={<ProtectedRoute><MatchSummary /></ProtectedRoute>} />

      <Route path="/history" element={<ProtectedRoute><MatchHistory /></ProtectedRoute>} />
      <Route path="/history/:matchId" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
