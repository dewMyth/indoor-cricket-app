import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { saveMatch } from "@/firebase/firestoreService";
import { MatchState } from "@/types";

/**
 * Watches the current match in Redux and persists it to Firestore shortly after
 * every change (new ball, wicket, bowler change, innings transition, etc).
 * Debounced by 600ms so a rapid burst of taps results in one write.
 */
export function useAutoSaveMatch() {
  const match = useAppSelector((state) => state.match.currentMatch);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!match) return;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      saveMatch(match).catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Auto-save failed", err);
      });
    }, 600);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [match]);
}
