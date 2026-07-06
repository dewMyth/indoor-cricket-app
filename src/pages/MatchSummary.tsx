import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { findPlayerName } from "@/utils/cricketUtils";
import { saveMatch } from "@/firebase/firestoreService";
import { uploadMatchReport } from "@/firebase/storageService";
import { pushToast, setLoading } from "@/store/slices/uiSlice";
import { clearMatch } from "@/store/slices/matchSlice";
import { rematchSameTeams } from "@/store/slices/matchSlice";
import AIInsightsComponent from "@/components/common/AIInsights";
import AIRoastGothayaComponent from "@/components/common/AIRoastGothaya";

export default function MatchSummary() {
  const match = useAppSelector((s) => s.match.currentMatch);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);

  const tournament = useAppSelector((s) => s.tournament.currentTournament);

  useEffect(() => {
    if (!match) navigate("/dashboard");
    else if (match.status !== "COMPLETED") navigate("/match/score");
    else {
      console.log("Saving match to history...", match);
      saveMatch(match).catch(() =>
        dispatch(
          pushToast({
            message: "Could not save final match to history.",
            type: "error",
          }),
        ),
      );
    }
  }, [match, navigate, dispatch]);

  if (!match || !match.innings1 || !match.innings2) return null;

  const {
    teamA,
    teamB,
    innings1,
    innings2,
    awards,
    winnerTeamId,
    winnerMargin,
  } = match;
  const winnerName =
    winnerTeamId === teamA.id
      ? teamA.name
      : winnerTeamId === teamB.id
        ? teamB.name
        : undefined;

  const handleRematch = () => {
    dispatch(rematchSameTeams());
    navigate("/match/toss");
  };

  const findWorstPlayerName = () => {
    console.log("Finding worst player from teams:", teamA, teamB);
    const players = [...teamA.players, ...teamB.players].filter(
      (p) =>
        p.name.toLowerCase().startsWith("jani") ||
        p.name.toLowerCase().startsWith("goth"),
    );
    console.log("Worst player candidates:", players);
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    console.log("Worst player candidates:", players, "Selected:", randomPlayer);
    return randomPlayer ? randomPlayer.name : "Unknown Player";
  };

  const handleExport = async () => {
    setIsExporting(true);
    dispatch(
      setLoading({ isLoading: true, message: "Exporting match report..." }),
    );
    try {
      const report = JSON.stringify(match, null, 2);
      console.log("Exporting match report:", report);
      const url = await uploadMatchReport(match.id, report);
      dispatch(
        pushToast({
          message: "Report exported successfully.",
          type: "success",
        }),
      );
      window.open(url, "_blank");
    } catch {
      dispatch(
        pushToast({
          message: "Export failed. Please try again.",
          type: "error",
        }),
      );
    } finally {
      setIsExporting(false);
      dispatch(setLoading({ isLoading: false }));
    }
  };

  console.log("Tournament ID:", "Tournament:", tournament);
  console.log("Match tournament ID:", match.tournamentId);

  return (
    <div className="min-h-screen bg-night-800">
      <Navbar title="Match Summary" />
      <main className="p-4 sm:p-6 max-w-lg mx-auto flex flex-col gap-5">
        <div className="card p-6 text-center bg-gradient-to-b from-pitch-500/20 to-transparent border-pitch-400/40">
          <p className="text-slate-400 text-sm mb-1">
            {winnerName ? "Match Winner" : "Match Result"}
          </p>
          <p className="font-display text-3xl font-bold text-slate-50 mb-1">
            {winnerName ? `${winnerName} won` : "Match Tied"}
          </p>
          {winnerMargin && (
            <p className="text-slate-400">
              {winnerMargin.includes("run") || winnerMargin.includes("wicket")
                ? `by ${winnerMargin}`
                : winnerMargin}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4 text-center">
            <p className="text-slate-400 text-xs mb-1">{teamA.name}</p>
            <p className="scoreboard-digit text-2xl font-bold text-slate-100">
              {
                (innings1.battingTeamId === teamA.id ? innings1 : innings2)
                  .totalRuns
              }
              /
              {
                (innings1.battingTeamId === teamA.id ? innings1 : innings2)
                  .totalWickets
              }
            </p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-slate-400 text-xs mb-1">{teamB.name}</p>
            <p className="scoreboard-digit text-2xl font-bold text-slate-100">
              {
                (innings1.battingTeamId === teamB.id ? innings1 : innings2)
                  .totalRuns
              }
              /
              {
                (innings1.battingTeamId === teamB.id ? innings1 : innings2)
                  .totalWickets
              }
            </p>
          </div>
        </div>

        {awards && (
          <div className="card p-5">
            <h3 className="font-display font-semibold text-lg text-slate-100 mb-3">
              Awards
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <AwardRow
                label="🏆 Player of the Match"
                name={findPlayerName(teamA, teamB, awards.mvp.playerId)}
                score={awards.mvp.score}
              />
              <AwardRow
                label="🏏 Best Batsman"
                name={findPlayerName(teamA, teamB, awards.bestBatsman.playerId)}
                score={awards.bestBatsman.score}
              />
              <AwardRow
                label="🎯 Best Bowler"
                name={findPlayerName(teamA, teamB, awards.bestBowler.playerId)}
                score={awards.bestBowler.score}
              />
              <AwardRow
                label="🧤 Best Fielder"
                name={findPlayerName(teamA, teamB, awards.bestFielder.playerId)}
                score={awards.bestFielder.score}
              />
              <AwardRow
                label="🤢 Worst Player"
                name={findWorstPlayerName()}
                score={0}
                isWorst={true}
              />
            </div>
          </div>
        )}

        {/* <button
          onClick={handleExport}
          disabled={isExporting}
          className="btn-secondary w-full disabled:opacity-50"
        >
          {isExporting ? "Exporting..." : "Export Match Report"}
        </button> */}

        <AIInsightsComponent matchData={JSON.stringify(match, null, 2)} />

        <button
          onClick={() => navigate(`/history/${match.id}`)}
          className="btn-secondary w-full"
        >
          View Full Scorecard
        </button>

        <button onClick={handleRematch} className="btn-secondary w-full">
          Rematch with Same Teams
        </button>

        {match.tournamentId && tournament && (
          <button
            onClick={() => navigate("/tournament/dashboard")}
            className="btn-primary w-full"
          >
            Back to {tournament.name}
          </button>
        )}

        <button
          onClick={() => {
            dispatch(clearMatch());
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
  name,
  score,
  isWorst = false,
}: {
  label: string;
  name: string;
  score: number;
  isWorst?: boolean;
}) {
  const listOfTrashTalks = [
    "This player needs to step up their game!",
    "Coach just can't walk the talk",
    "If effort scored runs, you'd still need a review.",
    "You're our secret weapon. We keep it secret because it's useless.",
    "This player is a legend... in their own mind.",
    "If cricket was a video game, this player would be on the tutorial level.",
  ];

  const match = useAppSelector((s) => s.match.currentMatch);

  return (
    <div className="flex items-center justify-between rounded-xl bg-night-700 px-4 py-3">
      <span className="text-slate-300">{label}</span>

      <div className="flex flex-col items-end">
        <span className="text-slate-100 font-medium">
          {name} <span className="text-slate-500 text-xs">({score} pts)</span>
        </span>

        {isWorst && (
          <span className="mt-1 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs italic text-red-300">
            💀{" "}
            <AIRoastGothayaComponent
              matchData={JSON.stringify(match, null, 2)}
              worstPlayer={name}
            />
          </span>
        )}
      </div>
    </div>
  );
}
