import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import { useAppDispatch } from "@/store/hooks";
import { createTournament } from "@/store/slices/tournamentSlice";
import { useAuth } from "@/hooks/useAuth";

export default function CreateTournament() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    dispatch(createTournament({ ownerUid: user.uid, name }));
    navigate("/tournament/dashboard");
  };

  return (
    <div className="min-h-screen bg-night-800">
      <Navbar title="New Tournament" showBack />
      <main className="p-4 sm:p-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="label-field">Tournament name</label>
            <input
              className="input-field"
              placeholder="e.g. Friday Night League"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <p className="text-slate-500 text-sm">
            You can add as many matches as you like and end the tournament
            whenever you're done.
          </p>
          <button type="submit" className="btn-primary w-full">
            Create Tournament
          </button>
        </form>
      </main>
    </div>
  );
}
