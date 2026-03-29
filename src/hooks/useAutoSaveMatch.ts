import { useEffect, useRef } from "react";
import { useGame } from "@/store/GameContext";
import { storageService } from "@/lib/storageService";

/**
 * Hook that automatically saves the current match to saved matches
 * every 2.5 seconds when scores are updated.
 *
 * Only saves if the match has a sourceMatchId (meaning it was loaded from saved matches).
 * This prevents auto-saving of newly created matches that haven't been explicitly saved yet.
 */
export function useAutoSaveMatch(): void {
  const { match } = useGame();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only auto-save if this match came from a saved match (has sourceMatchId)
    if (!match || !match.sourceMatchId) {
      return;
    }

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set up new timeout with debounce
    timeoutRef.current = setTimeout(() => {
      const matchToSave = {
        ...match,
        status: "paused" as const,
        updatedAt: Date.now(),
      };

      const result = storageService.saveSavedMatch(matchToSave);
      if (!result.success) {
        console.error("Failed to auto-save match:", result.error);
      }
    }, 2500); // 2.5 second debounce

    // Cleanup: clear timeout on unmount or when match changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [match?.actions.length, match?.sourceMatchId]); // Re-trigger on new actions
}
