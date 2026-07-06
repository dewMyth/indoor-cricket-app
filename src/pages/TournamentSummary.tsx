import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearTournament } from "@/store/slices/tournamentSlice";

export default function TournamentSummary() {
  const tournament = useAppSelector((s) => s.tournament.currentTournament);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!tournament || tournament.status !== "COMPLETED")
      navigate("/tournament/create");
  }, [tournament, navigate]);

  if (!tournament?.standings) return null;
  const s = tournament.standings;

  return (
    <div className="min-h-screen bg-night-800">
      <Navbar title={`${tournament.name} — Final`} />
      <main className="p-4 sm:p-6 max-w-2xl mx-auto flex flex-col gap-5">
        <div className="card p-6 text-center bg-gradient-to-b from-pitch-500/20 to-transparent border-pitch-400/40">
          <p className="text-slate-400 text-sm mb-1">Series Winner</p>
          <p className="font-display text-3xl font-bold text-slate-50">
            {s.seriesWinnerTeamName ?? "-"}
          </p>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-lg text-slate-100 mb-3">
            Standings
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-left">
                <th className="font-normal pb-1">Team</th>
                <th className="font-normal pb-1 text-right">P</th>
                <th className="font-normal pb-1 text-right">W</th>
                <th className="font-normal pb-1 text-right">L</th>
                <th className="font-normal pb-1 text-right">T</th>
                <th className="font-normal pb-1 text-right">Pts</th>
              </tr>
            </thead>
            <tbody>
              {s.teams.map((t) => (
                <tr key={t.teamName} className="border-t border-night-500/60">
                  <td className="py-1.5 text-slate-200">{t.teamName}</td>
                  <td className="py-1.5 text-right text-slate-400">
                    {t.played}
                  </td>
                  <td className="py-1.5 text-right text-slate-400">{t.won}</td>
                  <td className="py-1.5 text-right text-slate-400">{t.lost}</td>
                  <td className="py-1.5 text-right text-slate-400">{t.tied}</td>
                  <td className="py-1.5 text-right text-slate-100 font-medium">
                    {t.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-lg text-slate-100 mb-3">
            Awards
          </h3>
          <div className="flex flex-col gap-3 text-sm">
            {s.seriesMvp && <AwardRow label="🏆 Series MVP" a={s.seriesMvp} />}
            {s.bestBatsman && (
              <AwardRow label="🏏 Best Batsman" a={s.bestBatsman} />
            )}
            {s.bestBowler && (
              <AwardRow label="🎯 Best Bowler" a={s.bestBowler} />
            )}
            {s.bestFielder && (
              <AwardRow label="🧤 Best Fielder" a={s.bestFielder} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4">
            <p className="text-xs text-slate-500 mb-2">🧡 Orange Cap (runs)</p>
            {s.orangeCap.map((p) => (
              <div
                key={p.playerName + p.teamName}
                className="flex justify-between text-sm py-1"
              >
                <span className="text-slate-200">{p.playerName}</span>
                <span className="text-slate-400">{p.runs}</span>
              </div>
            ))}
          </div>
          <div className="card p-4">
            <p className="text-xs text-slate-500 mb-2">
              💜 Purple Cap (wickets)
            </p>
            {s.purpleCap.map((p) => (
              <div
                key={p.playerName + p.teamName}
                className="flex justify-between text-sm py-1"
              >
                <span className="text-slate-200">{p.playerName}</span>
                <span className="text-slate-400">{p.wickets}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            dispatch(clearTournament());
            navigate("/dashboard");
          }}
          className="btn-primary w-full"
        >
          Back to Dashboard
        </button>
      </main>
    </div>
  );
}

function AwardRow({
  label,
  a,
}: {
  label: string;
  a: {
    playerName: string;
    teamName: string;
    totalScore?: number;
    battingScore?: number;
    bowlingScore?: number;
    fieldingScore?: number;
  };
}) {
  const score =
    a.totalScore ?? a.battingScore ?? a.bowlingScore ?? a.fieldingScore ?? 0;
  return (
    <div className="flex items-center justify-between bg-night-700 rounded-xl px-4 py-3">
      <span className="text-slate-300">{label}</span>
      <span className="text-slate-100 font-medium">
        {a.playerName}{" "}
        <span className="text-slate-500 text-xs">
          ({a.teamName}, {Math.round(score * 10) / 10} pts)
        </span>
      </span>
    </div>
  );
}
