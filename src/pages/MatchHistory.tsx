import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getMatchHistory } from "@/firebase/firestoreService";
import {
  setHistoryLoading,
  setHistoryMatches,
} from "@/store/slices/historySlice";
import { useAuth } from "@/hooks/useAuth";

export default function MatchHistory() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { matches, isLoading } = useAppSelector((s) => s.history);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    console.log("Fetching match history for user:", user.uid);
    dispatch(setHistoryLoading(true));
    getMatchHistory(user.uid)
      .then((data) => dispatch(setHistoryMatches(data)))
      .catch(() => dispatch(setHistoryMatches([])))
      .finally(() => dispatch(setHistoryLoading(false)));
  }, [user, dispatch]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return matches;
    return matches.filter(
      (m) =>
        m.teamAName.toLowerCase().includes(q) ||
        m.teamBName.toLowerCase().includes(q) ||
        m.venue?.toLowerCase().includes(q) ||
        m.winnerTeamName?.toLowerCase().includes(q),
    );
  }, [matches, search]);

  return (
    <div className="min-h-screen bg-night-800">
      <Navbar title="Match History" showBack />
      <main className="p-4 sm:p-6 max-w-2xl mx-auto">
        <input
          className="input-field mb-4"
          placeholder="Search by team, venue, or winner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {isLoading ? (
          <LoadingScreen message="Loading match history..." />
        ) : filtered.length === 0 ? (
          <p className="text-slate-500 text-center py-10">No matches found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => navigate(`/history/${m.id}`)}
                className="card p-4 text-left flex items-center justify-between active:scale-[0.98] transition-transform"
              >
                <div>
                  <p className="font-display font-semibold text-slate-100">
                    {m.teamAName} vs {m.teamBName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(m.date).toLocaleDateString()}{" "}
                    {m.venue ? `· ${m.venue}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="scoreboard-digit text-slate-200 font-medium">
                    {m.finalScoreLabel}
                  </p>
                  {m.winnerTeamName && (
                    <p className="text-xs text-pitch-400">
                      {m.winnerTeamName} won
                    </p>
                  )}
                  {m.status !== "COMPLETED" && (
                    <p className="text-xs text-sixer-400">In progress</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
