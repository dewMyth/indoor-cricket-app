import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { useAppDispatch } from "@/store/hooks";
import { createMatch } from "@/store/slices/matchSlice";
import { useAuth } from "@/hooks/useAuth";
import { v4 as uuid } from "uuid";

export default function CreateMatch() {
  const { user } = useAuth();

  const location = useLocation();
  const tournamentId = (location.state as { tournamentId?: string } | null)
    ?.tournamentId;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");
  const [venue, setVenue] = useState("");
  const [totalOvers, setTotalOvers] = useState(5);
  const [ballsPerOver, setBallsPerOver] = useState(6);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamAName.trim() || !teamBName.trim()) {
      setError("Both team names are required.");
      return;
    }
    if (totalOvers <= 0 || ballsPerOver <= 0) {
      setError("Overs and balls per over must be greater than zero.");
      return;
    }
    if (!user) return;

    dispatch(
      createMatch({
        ownerUid: user.uid,
        config: {
          teamAName,
          teamBName,
          venue: venue.trim() || undefined,
          totalOvers,
          ballsPerOver,
        },
        teamA: { id: uuid(), name: teamAName.trim(), players: [] },
        teamB: { id: uuid(), name: teamBName.trim(), players: [] },
        tournamentId,
      }),
    );
    navigate("/match/teams");
  };

  return (
    <div className="min-h-screen bg-night-800">
      <Navbar title="Start New Match" showBack />
      <main className="p-4 sm:p-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Team A</label>
              <input
                className="input-field"
                placeholder="e.g. Falcons"
                value={teamAName}
                onChange={(e) => setTeamAName(e.target.value)}
              />
            </div>
            <div>
              <label className="label-field">Team B</label>
              <input
                className="input-field"
                placeholder="e.g. Titans"
                value={teamBName}
                onChange={(e) => setTeamBName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label-field">Venue (optional)</label>
            <input
              className="input-field"
              placeholder="e.g. Central Indoor Arena"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Overs per innings</label>
              <input
                type="number"
                min={1}
                className="input-field"
                value={totalOvers}
                onChange={(e) => setTotalOvers(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label-field">Balls per over</label>
              <input
                type="number"
                min={1}
                className="input-field"
                value={ballsPerOver}
                onChange={(e) => setBallsPerOver(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="card p-4 text-sm text-slate-400">
            Date & time will be recorded automatically as{" "}
            <span className="text-slate-200">
              {new Date().toLocaleString()}
            </span>
          </div>

          {error && <p className="text-stump-400 text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full mt-2">
            Continue to Team Setup
          </button>
        </form>
      </main>
    </div>
  );
}
