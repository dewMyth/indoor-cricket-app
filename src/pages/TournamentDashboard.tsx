import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAuth } from "@/hooks/useAuth";
import {
  getTournamentMatches,
  saveTournament,
} from "@/firebase/firestoreService";
import {
  completeTournament,
  setTournamentMatches,
} from "@/store/slices/tournamentSlice";
import { computeTournamentStandings } from "@/utils/tournamentUtils";

export default function TournamentDashboard() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const tournament = useAppSelector((s) => s.tournament.currentTournament);
  const matches = useAppSelector((s) => s.tournament.tournamentMatches);
  const [confirmEnd, setConfirmEnd] = useState(false);

  useEffect(() => {
    if (!tournament) navigate("/tournament/create");
  }, [tournament, navigate]);

  // Refresh match list whenever this screen is focused (e.g. after finishing a match).
  useEffect(() => {
    if (!tournament || !user) return;
    getTournamentMatches(tournament.id, user.uid).then((m) =>
      dispatch(setTournamentMatches(m)),
    );
  }, [tournament, user, dispatch]);

  if (!tournament) return null;

  const completedMatches = matches.filter((m) => m.status === "COMPLETED");

  const handleEndTournament = async () => {
    const standings = computeTournamentStandings(completedMatches);
    dispatch(completeTournament(standings));
    await saveTournament({
      ...tournament,
      status: "COMPLETED",
      completedAtISO: new Date().toISOString(),
      standings,
    });
    setConfirmEnd(false);
    navigate("/tournament/summary");
  };

  return (
    <div className="min-h-screen bg-night-800">
      <Navbar title={tournament.name} showBack />
      <main className="p-4 sm:p-6 max-w-2xl mx-auto flex flex-col gap-4">
        <div className="card p-4 text-sm text-slate-400">
          {completedMatches.length} match
          {completedMatches.length === 1 ? "" : "es"} played so far
        </div>

        <button
          onClick={() =>
            navigate("/match/create", {
              state: { tournamentId: tournament.id },
            })
          }
          className="btn-primary w-full"
        >
          + Add Match
        </button>

        <div className="flex flex-col gap-2">
          {completedMatches.map((m) => (
            <div
              key={m.id}
              className="card p-4 flex items-center justify-between"
            >
              <span className="text-slate-200">
                {m.teamA.name} vs {m.teamB.name}
              </span>
              <span className="text-xs text-pitch-400">
                {m.winnerTeamId === m.teamA.id ? m.teamA.name : m.teamB.name}{" "}
                won
              </span>
            </div>
          ))}
          {completedMatches.length === 0 && (
            <p className="text-slate-500 text-center py-6 text-sm">
              No completed matches yet.
            </p>
          )}
        </div>

        <button
          onClick={() => setConfirmEnd(true)}
          className="btn-secondary w-full mt-2"
        >
          End Tournament
        </button>
      </main>

      {confirmEnd && (
        <ConfirmModal
          title="End this tournament?"
          message="This will calculate the final standings, series MVP, and top performers from all matches played so far. This can't be undone."
          confirmLabel="End Tournament"
          danger
          onConfirm={handleEndTournament}
          onCancel={() => setConfirmEnd(false)}
        />
      )}
    </div>
  );
}
