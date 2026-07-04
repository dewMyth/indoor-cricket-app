import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { MatchState, MatchHistorySummary } from "@/types";

const MATCHES_COLLECTION = "matches";

/** Save (create or update) the full match document. Called after every ball for auto-save. */
export async function saveMatch(match: MatchState): Promise<void> {
  const ref = doc(db, MATCHES_COLLECTION, match.id);
  await setDoc(
    ref,
    {
      ...match,
      updatedAtISO: new Date().toISOString(),
      serverUpdatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getMatch(matchId: string): Promise<MatchState | null> {
  const ref = doc(db, MATCHES_COLLECTION, matchId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as MatchState;
}

export async function getMatchHistory(
  ownerUid: string,
): Promise<MatchHistorySummary[]> {
  const q = query(
    collection(db, MATCHES_COLLECTION),
    where("ownerUid", "==", ownerUid),
    orderBy("createdAtISO", "desc"),
  );
  console.log("Fetch started match history for", ownerUid, "matches");
  const snap = await getDocs(q).catch((err) => {
    console.error("Error fetching match history for", ownerUid, err);
    throw err;
  });
  console.log("Fetched match history for", ownerUid, snap.size, "matches");
  return snap.docs.map((d) => {
    const data = d.data() as MatchState;
    return summarizeMatch(data);
  });
}

export function summarizeMatch(match: MatchState): MatchHistorySummary {
  const finalInnings = match.innings2 ?? match.innings1;
  const scoreLabel = finalInnings
    ? `${finalInnings.totalRuns}/${finalInnings.totalWickets}`
    : "Not started";
  const winnerName =
    match.winnerTeamId === match.teamA.id
      ? match.teamA.name
      : match.winnerTeamId === match.teamB.id
        ? match.teamB.name
        : undefined;

  return {
    id: match.id,
    ownerUid: match.ownerUid,
    teamAName: match.teamA.name,
    teamBName: match.teamB.name,
    venue: match.config.venue,
    date: match.createdAtISO,
    winnerTeamName: winnerName,
    finalScoreLabel: scoreLabel,
    status: match.status,
  };
}

export async function deleteMatch(matchId: string): Promise<void> {
  await deleteDoc(doc(db, MATCHES_COLLECTION, matchId));
}
