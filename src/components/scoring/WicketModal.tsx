import { useState } from "react";
import type { DismissalType, Team } from "@/types";

interface WicketModalProps {
  bowlingTeam: Team;
  strikerId: string;
  strikerName: string;
  nonStrikerId: string | null;
  nonStrikerName: string | null;
  onConfirm: (payload: {
    type: DismissalType;
    fielderId?: string;
    batsmanId: string;
    runsCompleted?: number;
  }) => void;
  onCancel: () => void;
}

const dismissalTypes: {
  type: DismissalType;
  label: string;
  needsFielder: boolean;
}[] = [
  { type: "BOWLED", label: "Bowled", needsFielder: false },
  { type: "CAUGHT", label: "Caught", needsFielder: true },
  { type: "LBW", label: "LBW", needsFielder: false },
  { type: "RUN_OUT", label: "Run Out", needsFielder: true },
  { type: "STUMPED", label: "Stumped", needsFielder: true },
  { type: "HIT_WICKET", label: "Hit Wicket", needsFielder: false },
  { type: "RETIRED_HURT", label: "Retired Hurt", needsFielder: false },
];

export default function WicketModal({
  bowlingTeam,
  strikerId,
  strikerName,
  nonStrikerId,
  nonStrikerName,
  onConfirm,
  onCancel,
}: WicketModalProps) {
  const [type, setType] = useState<DismissalType | null>(null);
  const [fielderId, setFielderId] = useState("");
  const [outBatsmanId, setOutBatsmanId] = useState(strikerId);
  const [runsCompleted, setRunsCompleted] = useState(0);

  const selected = dismissalTypes.find((d) => d.type === type);

  const handleConfirm = () => {
    if (!type) return;
    if (selected?.needsFielder && !fielderId) return;
    onConfirm({
      type,
      fielderId: selected?.needsFielder ? fielderId : undefined,
      batsmanId: type === "RUN_OUT" ? outBatsmanId : strikerId,
      runsCompleted: type === "RUN_OUT" ? runsCompleted : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="card w-full max-w-sm p-5 animate-slide-up max-h-[85vh] overflow-y-auto">
        <h3 className="font-display text-xl font-semibold text-slate-100 mb-4">
          How was the batsman out?
        </h3>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {dismissalTypes.map((d) => (
            <button
              key={d.type}
              onClick={() => setType(d.type)}
              className={`rounded-xl py-3 px-2 text-sm font-medium border ${
                type === d.type
                  ? "bg-stump-500 border-stump-400 text-white"
                  : "bg-night-700 border-night-500 text-slate-200"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {type === "RUN_OUT" && (
          <>
            {nonStrikerId && (
              <div className="mb-4">
                <label className="label-field">
                  Which batsman was run out?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOutBatsmanId(strikerId)}
                    className={`rounded-xl py-3 text-sm font-medium border ${
                      outBatsmanId === strikerId
                        ? "bg-stump-500 border-stump-400 text-white"
                        : "bg-night-700 border-night-500 text-slate-200"
                    }`}
                  >
                    {strikerName} (striker)
                  </button>
                  <button
                    onClick={() => setOutBatsmanId(nonStrikerId)}
                    className={`rounded-xl py-3 text-sm font-medium border ${
                      outBatsmanId === nonStrikerId
                        ? "bg-stump-500 border-stump-400 text-white"
                        : "bg-night-700 border-night-500 text-slate-200"
                    }`}
                  >
                    {nonStrikerName} (non-striker)
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="label-field">
                Runs completed before the run out
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRunsCompleted(r)}
                    className={`h-11 rounded-xl font-display font-semibold ${
                      runsCompleted === r
                        ? "bg-pitch-400 text-night-900"
                        : "bg-night-700 text-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {selected?.needsFielder && (
          <div className="mb-4">
            <label className="label-field">
              {type === "RUN_OUT"
                ? "Run out by"
                : type === "STUMPED"
                  ? "Stumped by (wicketkeeper)"
                  : "Caught by"}
            </label>
            <select
              className="input-field"
              value={fielderId}
              onChange={(e) => setFielderId(e.target.value)}
            >
              <option value="">Select fielder</option>
              {bowlingTeam.players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button className="btn-secondary flex-1" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="flex-1 rounded-xl px-5 py-3 font-display font-semibold bg-stump-500 hover:bg-stump-600 text-white active:scale-[0.98]"
            onClick={handleConfirm}
            disabled={!type || (selected?.needsFielder && !fielderId)}
          >
            Confirm Out
          </button>
        </div>
      </div>
    </div>
  );
}
