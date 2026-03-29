import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { storageService } from "./storageService";
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

describe("storageService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("saveSavedMatch", () => {
    it("should save a new match", () => {
      const match = createMockMatch();
      const result = storageService.saveSavedMatch(match);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should update an existing match", () => {
      const match = createMockMatch();
      storageService.saveSavedMatch(match);

      const updatedMatch = createMockMatch({
        id: "match-1",
        name: "Updated Match",
      });
      const result = storageService.saveSavedMatch(updatedMatch);

      expect(result.success).toBe(true);
      const saved = storageService.getSavedMatches();
      expect(saved.data).toHaveLength(1);
      expect(saved.data![0].name).toBe("Updated Match");
    });

    it("should set updatedAt timestamp", () => {
      const match = createMockMatch({ updatedAt: 1000 });
      const beforeSave = Date.now();
      storageService.saveSavedMatch(match);
      const afterSave = Date.now();

      const saved = storageService.getSavedMatches();
      const timestamp = saved.data![0].updatedAt;
      expect(timestamp).toBeGreaterThanOrEqual(beforeSave);
      expect(timestamp).toBeLessThanOrEqual(afterSave);
    });

    it("should generate default name if none provided", () => {
      const match = createMockMatch({ name: undefined });
      storageService.saveSavedMatch(match);

      const saved = storageService.getSavedMatches();
      expect(saved.data![0].name).toBeDefined();
      expect(saved.data![0].name).toContain("Match");
    });
  });

  describe("getSavedMatches", () => {
    it("should return empty array if storage is empty", () => {
      const result = storageService.getSavedMatches();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should return all saved matches", () => {
      const match1 = createMockMatch({ id: "match-1" });
      const match2 = createMockMatch({ id: "match-2" });

      storageService.saveSavedMatch(match1);
      storageService.saveSavedMatch(match2);

      const result = storageService.getSavedMatches();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it("should detect corrupted data", () => {
      localStorage.setItem("gamepoint-saved-matches", '{"invalid": "data"}');

      const result = storageService.getSavedMatches();
      expect(result.success).toBe(false);
      expect(result.error?.isCorrupted).toBe(true);
    });

    it("should handle invalid JSON", () => {
      localStorage.setItem("gamepoint-saved-matches", "invalid json");

      const result = storageService.getSavedMatches();
      expect(result.success).toBe(false);
      expect(result.error?.isCorrupted).toBe(true);
    });
  });

  describe("getSavedMatch", () => {
    it("should return a specific match by ID", () => {
      const match = createMockMatch({ id: "match-123" });
      storageService.saveSavedMatch(match);

      const result = storageService.getSavedMatch("match-123");
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe("match-123");
    });

    it("should return error if match not found", () => {
      const result = storageService.getSavedMatch("nonexistent");
      expect(result.success).toBe(false);
      expect(result.error?.isCorrupted).toBe(false);
    });
  });

  describe("deleteSavedMatch", () => {
    it("should delete a match by ID", () => {
      const match1 = createMockMatch({ id: "match-1" });
      const match2 = createMockMatch({ id: "match-2" });

      storageService.saveSavedMatch(match1);
      storageService.saveSavedMatch(match2);

      const result = storageService.deleteSavedMatch("match-1");
      expect(result.success).toBe(true);

      const remaining = storageService.getSavedMatches();
      expect(remaining.data).toHaveLength(1);
      expect(remaining.data![0].id).toBe("match-2");
    });

    it("should handle deletion when storage is empty", () => {
      const result = storageService.deleteSavedMatch("nonexistent");
      expect(result.success).toBe(true);
    });
  });

  describe("setCurrentMatch and getCurrentMatch", () => {
    it("should save and retrieve current match", () => {
      const match = createMockMatch();
      storageService.setCurrentMatch(match);

      const result = storageService.getCurrentMatch();
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe("match-1");
    });

    it("should return null if no current match", () => {
      const result = storageService.getCurrentMatch();
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("should clear current match when set to null", () => {
      const match = createMockMatch();
      storageService.setCurrentMatch(match);
      storageService.setCurrentMatch(null);

      const result = storageService.getCurrentMatch();
      expect(result.data).toBeNull();
    });
  });

  describe("clear", () => {
    it("should clear all storage", () => {
      const match = createMockMatch();
      storageService.saveSavedMatch(match);
      storageService.setCurrentMatch(match);

      storageService.clear();

      expect(storageService.getSavedMatches().data).toEqual([]);
      expect(storageService.getCurrentMatch().data).toBeNull();
    });
  });
});
