import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSavedMatches } from "./useSavedMatches";
import { storageService } from "@/lib/storageService";
import { GameMatch } from "@/store/gameTypes";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const createMockMatch = (overrides?: Partial<GameMatch>): GameMatch => ({
  id: "match-1",
  name: "Test Match",
  players: [
    { id: "p1", name: "Player 1", color: "0 75% 65%", score: 0 },
    { id: "p2", name: "Player 2", color: "200 80% 60%", score: 0 },
  ],
  actions: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  status: "active" as const,
  isActive: true,
  ...overrides,
});

describe("useSavedMatches", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should initialize with empty matches", async () => {
    const { result } = renderHook(() => useSavedMatches());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.savedMatches).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should load saved matches on mount", async () => {
    const match = createMockMatch({ id: "match-1" });
    storageService.saveSavedMatch(match);

    const { result } = renderHook(() => useSavedMatches());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.savedMatches).toHaveLength(1);
    expect(result.current.savedMatches[0].id).toBe("match-1");
  });

  it("should save a match and refresh list", async () => {
    const { result } = renderHook(() => useSavedMatches());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const match = createMockMatch({ id: "new-match" });

    let success = false;
    await act(async () => {
      success = await result.current.saveMatch(match, "My Match");
    });

    expect(success).toBe(true);

    await waitFor(() => {
      expect(result.current.savedMatches).toHaveLength(1);
      expect(result.current.savedMatches[0].name).toBe("My Match");
      expect(result.current.savedMatches[0].status).toBe("paused");
    });
  });

  it("should delete a match and refresh list", async () => {
    const match = createMockMatch({ id: "match-to-delete" });
    storageService.saveSavedMatch(match);

    const { result } = renderHook(() => useSavedMatches());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.savedMatches).toHaveLength(1);
    });

    let success = false;
    await act(async () => {
      success = await result.current.deleteMatch("match-to-delete");
    });

    expect(success).toBe(true);

    await waitFor(() => {
      expect(result.current.savedMatches).toHaveLength(0);
    });
  });

  it("should load a specific match with correct metadata", async () => {
    const match = createMockMatch({
      id: "match-to-load",
      name: "Saved Game",
    });
    storageService.saveSavedMatch(match);

    const { result } = renderHook(() => useSavedMatches());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let loadedMatch: GameMatch | null = null;
    await act(async () => {
      loadedMatch = await result.current.loadMatch("match-to-load");
    });

    expect(loadedMatch).not.toBeNull();
    expect(loadedMatch?.status).toBe("active");
    expect(loadedMatch?.sourceMatchId).toBe("match-to-load");
  });

  it("should handle corrupted storage gracefully", async () => {
    localStorage.setItem("gamepoint-saved-matches", "invalid json");

    const { result } = renderHook(() => useSavedMatches());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error).toContain("corrupted");
    expect(result.current.savedMatches).toEqual([]);
  });

  it("should refresh matches on demand", async () => {
    const { result } = renderHook(() => useSavedMatches());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.savedMatches).toHaveLength(0);

    // Add a match directly to storage
    const match = createMockMatch({ id: "external-match" });
    storageService.saveSavedMatch(match);

    // Refresh
    await act(async () => {
      result.current.refreshMatches();
    });

    await waitFor(() => {
      expect(result.current.savedMatches).toHaveLength(1);
    });
  });
});
