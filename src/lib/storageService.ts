import { GameMatch } from "@/store/gameTypes";

const SAVED_MATCHES_KEY = "gamepoint-saved-matches";
const CURRENT_MATCH_KEY = "gamepoint-match";

interface StorageError {
  message: string;
  isCorrupted: boolean;
}

/**
 * Storage service for managing game matches.
 * Provides a clean abstraction over localStorage operations.
 * All errors are caught and reported gracefully.
 */
export const storageService = {
  /**
   * Save a match to the list of saved matches.
   * Updates updatedAt timestamp automatically.
   */
  saveSavedMatch(match: GameMatch): { success: boolean; error?: StorageError } {
    try {
      const matches = this.getSavedMatches().success
        ? this.getSavedMatches().data || []
        : [];

      // Update timestamp
      const matchToSave: GameMatch = {
        ...match,
        updatedAt: Date.now(),
        name: match.name || `Match ${new Date(match.createdAt).toLocaleDateString()}`,
      };

      // Replace if exists, otherwise add
      const index = matches.findIndex((m) => m.id === match.id);
      if (index >= 0) {
        matches[index] = matchToSave;
      } else {
        matches.push(matchToSave);
      }

      localStorage.setItem(SAVED_MATCHES_KEY, JSON.stringify(matches));
      return { success: true };
    } catch (err) {
      const error: StorageError = {
        message: err instanceof Error ? err.message : "Failed to save match",
        isCorrupted: false,
      };
      console.error("Storage error:", error);
      return { success: false, error };
    }
  },

  /**
   * Get all saved matches.
   * Returns empty array if storage is cleared or empty.
   */
  getSavedMatches(): {
    success: boolean;
    data?: GameMatch[];
    error?: StorageError;
  } {
    try {
      const stored = localStorage.getItem(SAVED_MATCHES_KEY);
      if (!stored) {
        return { success: true, data: [] };
      }

      const matches = JSON.parse(stored) as GameMatch[];

      // Validate that all items are valid matches
      const isValid = Array.isArray(matches) && matches.every((m) => m.id && m.players);
      if (!isValid) {
        return {
          success: false,
          error: {
            message: "Saved matches are corrupted",
            isCorrupted: true,
          },
        };
      }

      return { success: true, data: matches };
    } catch (err) {
      const error: StorageError = {
        message: err instanceof Error ? err.message : "Failed to read saved matches",
        isCorrupted: true,
      };
      console.error("Storage error:", error);
      return { success: false, error };
    }
  },

  /**
   * Get a specific saved match by ID.
   */
  getSavedMatch(matchId: string): {
    success: boolean;
    data?: GameMatch;
    error?: StorageError;
  } {
    try {
      const result = this.getSavedMatches();
      if (!result.success || !result.data) {
        return result as any;
      }

      const match = result.data.find((m) => m.id === matchId);
      if (!match) {
        return {
          success: false,
          error: {
            message: `Match with ID ${matchId} not found`,
            isCorrupted: false,
          },
        };
      }

      return { success: true, data: match };
    } catch (err) {
      const error: StorageError = {
        message: err instanceof Error ? err.message : "Failed to get match",
        isCorrupted: false,
      };
      console.error("Storage error:", error);
      return { success: false, error };
    }
  },

  /**
   * Delete a saved match by ID.
   */
  deleteSavedMatch(matchId: string): { success: boolean; error?: StorageError } {
    try {
      const result = this.getSavedMatches();
      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const filtered = result.data.filter((m) => m.id !== matchId);
      localStorage.setItem(SAVED_MATCHES_KEY, JSON.stringify(filtered));

      return { success: true };
    } catch (err) {
      const error: StorageError = {
        message: err instanceof Error ? err.message : "Failed to delete match",
        isCorrupted: false,
      };
      console.error("Storage error:", error);
      return { success: false, error };
    }
  },

  /**
   * Save the currently active match.
   * This is separate from saved matches and represents the game in progress.
   */
  setCurrentMatch(match: GameMatch | null): { success: boolean; error?: StorageError } {
    try {
      if (match) {
        localStorage.setItem(CURRENT_MATCH_KEY, JSON.stringify(match));
      } else {
        localStorage.removeItem(CURRENT_MATCH_KEY);
      }
      return { success: true };
    } catch (err) {
      const error: StorageError = {
        message: err instanceof Error ? err.message : "Failed to set current match",
        isCorrupted: false,
      };
      console.error("Storage error:", error);
      return { success: false, error };
    }
  },

  /**
   * Get the currently active match, if any.
   */
  getCurrentMatch(): {
    success: boolean;
    data?: GameMatch | null;
    error?: StorageError;
  } {
    try {
      const stored = localStorage.getItem(CURRENT_MATCH_KEY);
      if (!stored) {
        return { success: true, data: null };
      }

      const match = JSON.parse(stored) as GameMatch;
      return { success: true, data: match };
    } catch (err) {
      const error: StorageError = {
        message: err instanceof Error ? err.message : "Failed to get current match",
        isCorrupted: true,
      };
      console.error("Storage error:", error);
      return { success: false, error };
    }
  },

  /**
   * Clear all storage (for testing or reset).
   */
  clear(): { success: boolean; error?: StorageError } {
    try {
      localStorage.removeItem(SAVED_MATCHES_KEY);
      localStorage.removeItem(CURRENT_MATCH_KEY);
      return { success: true };
    } catch (err) {
      const error: StorageError = {
        message: err instanceof Error ? err.message : "Failed to clear storage",
        isCorrupted: false,
      };
      console.error("Storage error:", error);
      return { success: false, error };
    }
  },
};
