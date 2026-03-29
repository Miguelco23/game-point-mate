import { useState, useCallback, useEffect } from "react";
import { GameMatch } from "@/store/gameTypes";
import { storageService } from "@/lib/storageService";

interface UseSavedMatchesReturn {
  savedMatches: GameMatch[];
  isLoading: boolean;
  error: string | null;
  saveMatch: (match: GameMatch, name?: string) => Promise<boolean>;
  deleteMatch: (matchId: string) => Promise<boolean>;
  loadMatch: (matchId: string) => Promise<GameMatch | null>;
  refreshMatches: () => void;
}

/**
 * Hook for managing saved matches.
 * Provides methods to save, delete, and load matches from storage.
 */
export function useSavedMatches(): UseSavedMatchesReturn {
  const [savedMatches, setSavedMatches] = useState<GameMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all saved matches on mount
  const refreshMatches = useCallback(() => {
    const result = storageService.getSavedMatches();
    if (result.success && result.data) {
      setSavedMatches(result.data);
      setError(null);
    } else {
      setSavedMatches([]);
      if (result.error?.isCorrupted) {
        setError("Saved matches are corrupted. Please clear and start fresh.");
      } else {
        setError(result.error?.message || "Failed to load saved matches");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshMatches();
  }, [refreshMatches]);

  const saveMatch = useCallback(
    async (match: GameMatch, name?: string): Promise<boolean> => {
      try {
        const matchToSave: GameMatch = {
          ...match,
          name: name || match.name,
          status: "paused",
          updatedAt: Date.now(),
        };

        const result = storageService.saveSavedMatch(matchToSave);
        if (result.success) {
          refreshMatches();
          return true;
        } else {
          setError(result.error?.message || "Failed to save match");
          return false;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return false;
      }
    },
    [refreshMatches]
  );

  const deleteMatch = useCallback(
    async (matchId: string): Promise<boolean> => {
      try {
        const result = storageService.deleteSavedMatch(matchId);
        if (result.success) {
          refreshMatches();
          return true;
        } else {
          setError(result.error?.message || "Failed to delete match");
          return false;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return false;
      }
    },
    [refreshMatches]
  );

  const loadMatch = useCallback(async (matchId: string): Promise<GameMatch | null> => {
    try {
      const result = storageService.getSavedMatch(matchId);
      if (result.success && result.data) {
        // Update the match status when loading
        const loadedMatch: GameMatch = {
          ...result.data,
          status: "active",
          updatedAt: Date.now(),
          sourceMatchId: matchId,
        };
        return loadedMatch;
      } else {
        setError(result.error?.message || "Failed to load match");
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    }
  }, []);

  return {
    savedMatches,
    isLoading,
    error,
    saveMatch,
    deleteMatch,
    loadMatch,
    refreshMatches,
  };
}
