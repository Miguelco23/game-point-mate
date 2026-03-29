import { useEffect } from "react";
import { useGame } from "@/store/GameContext";
import { storageService } from "@/lib/storageService";

/**
 * Hook that validates if a saved match still exists in storage.
 * If the match was deleted externally (e.g., from another browser tab),
 * clears the sourceMatchId from context so auto-save is disabled.
 * Checks every 5 seconds while playing a saved match.
 */
export function useValidateSavedMatch(): void {
  const { match, loadMatch } = useGame();

  useEffect(() => {
    // Only check if this is a saved match
    if (!match || !match.sourceMatchId) {
      return;
    }

    // Validate immediately
    const validateMatch = () => {
      const result = storageService.getSavedMatch(match.sourceMatchId!);
      if (!result.success || !result.data) {
        // Saved match was deleted externally, clear sourceMatchId
        loadMatch({
          ...match,
          sourceMatchId: undefined,
        });
      }
    };

    validateMatch();

    // Check every 5 seconds
    const interval = setInterval(validateMatch, 5000);

    return () => clearInterval(interval);
  }, [match?.sourceMatchId]);
}
