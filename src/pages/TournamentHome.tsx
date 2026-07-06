import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import {
  getTournaments,
  getTournamentMatches,
} from "@/firebase/firestoreService";
import { useAppDispatch } from "@/store/hooks";
import { loadTournament } from "@/store/slices/tournamentSlice";
import type { TournamentState } from "@/types";

export default function TournamentHome() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<TournamentState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getTournaments(user.uid)
      .then(setTournaments)
      .finally(() => setLoading(false));
  }, [user]);

  const openTournament = async (t: TournamentState) => {
    if (!user) return;
    const matches = await getTournamentMatches(t.id, user.uid);
    dispatch(loadTournament({ tournament: t, matches }));
    navigate(
      t.status === "COMPLETED"
        ? "/tournament/summary"
        : "/tournament/dashboard",
    );
  };

  return (
    <div className="min-h-screen bg-night-800">
      <Navbar title="Tournaments" showBack />
      <main className="p-4 sm:p-6 max-w-2xl mx-auto flex flex-col gap-4">
        <button
          onClick={() => navigate("/tournament/create")}
          className="btn-primary w-full"
        >
          + New Tournament
        </button>

        {loading ? (
          <LoadingScreen message="Loading tournaments..." />
        ) : tournaments.length === 0 ? (
          <p className="text-slate-500 text-center py-10">
            No tournaments yet.
          </p>
        ) : (
          tournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => openTournament(t)}
              className="card p-4 text-left flex items-center justify-between"
            >
              <div>
                <p className="font-display font-semibold text-slate-100">
                  {t.name}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(t.createdAtISO).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`text-xs ${t.status === "ACTIVE" ? "text-sixer-400" : "text-pitch-400"}`}
              >
                {t.status === "ACTIVE" ? "In progress" : "Completed"}
              </span>
            </button>
          ))
        )}
      </main>
    </div>
  );
}
