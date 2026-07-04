import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { startInnings } from "@/store/slices/matchSlice";
import type { Team } from "@/types";

export default function StartInnings() {
  const match = useAppSelector((s) => s.match.currentMatch);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // const inningsNumber = match ? match.currentInningsNumber : 1;
  const inningsNumber: 1 | 2 = match?.innings1 ? 2 : 1;

  const battingTeam: Team | undefined =
    inningsNumber === 1
      ? (match &&
          (match.battingFirstTeamId === match.teamA.id
            ? match.teamA
            : match.teamB)) ||
        undefined
      : (match &&
          (match.battingFirstTeamId === match.teamA.id
            ? match.teamB
            : match.teamA)) ||
        undefined;

  const bowlingTeam: Team | undefined =
    match && battingTeam
      ? battingTeam.id === match.teamA.id
        ? match.teamB
        : match.teamA
      : undefined;

  const [striker, setStriker] = useState("");
  const [nonStriker, setNonStriker] = useState("");
  const [bowler, setBowler] = useState("");

  useEffect(() => {
    if (!match) navigate("/match/create");
    else if (inningsNumber === 1 && !match.battingFirstTeamId)
      navigate("/match/toss");
  }, [match, inningsNumber, navigate]);

  if (!match || !battingTeam || !bowlingTeam) return null;

  const handleStart = () => {
    if (!striker || !nonStriker || !bowler || striker === nonStriker) return;
    dispatch(
      startInnings({
        inningsNumber,
        battingTeamId: battingTeam.id,
        bowlingTeamId: bowlingTeam.id,
        strikerId: striker,
        nonStrikerId: nonStriker,
        bowlerId: bowler,
      }),
    );
    navigate("/match/score");
  };

  return (
    <div className="min-h-screen bg-night-800">
      <Navbar title={`Innings ${inningsNumber} Setup`} showBack />
      <main className="p-4 sm:p-6 max-w-md mx-auto flex flex-col gap-6">
        <div className="card p-4 text-sm text-slate-300">
          <span className="font-semibold text-slate-100">
            {battingTeam.name}
          </span>{" "}
          bat first, bowled by{" "}
          <span className="font-semibold text-slate-100">
            {bowlingTeam.name}
          </span>
          .
        </div>

        <div>
          <label className="label-field">Opening striker</label>
          <select
            className="input-field"
            value={striker}
            onChange={(e) => setStriker(e.target.value)}
          >
            <option value="">Select player</option>
            {battingTeam.players.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === nonStriker}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-field">Opening non-striker</label>
          <select
            className="input-field"
            value={nonStriker}
            onChange={(e) => setNonStriker(e.target.value)}
          >
            <option value="">Select player</option>
            {battingTeam.players.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === striker}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-field">Opening bowler</label>
          <select
            className="input-field"
            value={bowler}
            onChange={(e) => setBowler(e.target.value)}
          >
            <option value="">Select player</option>
            {bowlingTeam.players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleStart}
          disabled={
            !striker || !nonStriker || !bowler || striker === nonStriker
          }
          className="btn-primary w-full disabled:opacity-40"
        >
          Start Innings
        </button>
      </main>
    </div>
  );
}
