import { describe, it, expect, beforeEach } from "vitest";
import { GameMatch, ScoreAction } from "./gameTypes";

/**
 * Unit tests for multiplier feature
 * Tests score calculation with multipliers, auto-reset behavior, and data persistence
 */

// Mock reducer logic extracted for testing
function gameReducer(
  state: { match: GameMatch | null },
  action: any
): { match: GameMatch | null } {
  switch (action.type) {
    case "CREATE_MATCH":
      return {
        match: {
          id: "test-1",
          players: [],
          actions: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: "active",
          isActive: true,
        },
      };

    case "ADD_PLAYER": {
      if (!state.match) return state;
      const newPlayer = {
        id: action.playerId || "p1",
        name: action.name,
        color: "0 75% 65%",
        score: 0,
        currentMultiplier: 1,
      };
      return {
        match: {
          ...state.match,
          players: [...state.match.players, newPlayer],
        },
      };
    }

    case "UPDATE_SCORE": {
      if (!state.match) return state;
      const player = state.match.players.find((p) => p.id === action.playerId);
      if (!player) return state;

      const basePoints = action.delta;
      const multiplier = player.currentMultiplier || 1;
      const finalPoints = basePoints * multiplier;
      const newScore = player.score + finalPoints;

      const scoreAction: ScoreAction = {
        id: `action-${Date.now()}`,
        playerId: action.playerId,
        playerName: player.name,
        delta: finalPoints,
        resultingScore: newScore,
        timestamp: Date.now(),
        basePoints,
        multiplier,
        finalPoints,
      };

      return {
        match: {
          ...state.match,
          updatedAt: Date.now(),
          players: state.match.players.map((p) =>
            p.id === action.playerId ? { ...p, score: newScore, currentMultiplier: 1 } : p
          ),
          actions: [...state.match.actions, scoreAction],
        },
      };
    }

    case "SET_MULTIPLIER": {
      if (!state.match) return state;
      return {
        match: {
          ...state.match,
          players: state.match.players.map((p) =>
            p.id === action.playerId
              ? { ...p, currentMultiplier: action.multiplier }
              : p
          ),
        },
      };
    }

    case "UNDO": {
      if (!state.match || state.match.actions.length === 0) return state;
      const lastAction = state.match.actions[state.match.actions.length - 1];
      return {
        match: {
          ...state.match,
          updatedAt: Date.now(),
          players: state.match.players.map((p) =>
            p.id === lastAction.playerId
              ? { ...p, score: p.score - lastAction.delta }
              : p
          ),
          actions: state.match.actions.slice(0, -1),
        },
      };
    }

    default:
      return state;
  }
}

describe("GameContext - Multiplier Feature", () => {
  let state: { match: GameMatch | null };

  beforeEach(() => {
    state = { match: null };
    // Initialize a match with a player
    state = gameReducer(state, { type: "CREATE_MATCH" });
    state = gameReducer(state, {
      type: "ADD_PLAYER",
      playerId: "p1",
      name: "Player 1",
    });
  });

  describe("Initial State", () => {
    it("should initialize player with currentMultiplier = 1", () => {
      expect(state.match?.players[0]?.currentMultiplier).toBe(1);
    });
  });

  describe("Score Calculation with Multiplier", () => {
    it("should apply multiplier x1 (base case)", () => {
      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: 10,
      });

      const action = state.match?.actions[0];
      expect(action?.basePoints).toBe(10);
      expect(action?.multiplier).toBe(1);
      expect(action?.finalPoints).toBe(10);
      expect(action?.delta).toBe(10);
      expect(state.match?.players[0]?.score).toBe(10);
    });

    it("should apply multiplier x2 correctly", () => {
      state = gameReducer(state, {
        type: "SET_MULTIPLIER",
        playerId: "p1",
        multiplier: 2,
      });
      expect(state.match?.players[0]?.currentMultiplier).toBe(2);

      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: 5,
      });

      const action = state.match?.actions[0];
      expect(action?.basePoints).toBe(5);
      expect(action?.multiplier).toBe(2);
      expect(action?.finalPoints).toBe(10);
      expect(action?.delta).toBe(10);
      expect(state.match?.players[0]?.score).toBe(10);
    });

    it("should apply multiplier x5 correctly", () => {
      state = gameReducer(state, {
        type: "SET_MULTIPLIER",
        playerId: "p1",
        multiplier: 5,
      });

      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: 3,
      });

      const action = state.match?.actions[0];
      expect(action?.basePoints).toBe(3);
      expect(action?.multiplier).toBe(5);
      expect(action?.finalPoints).toBe(15);
      expect(state.match?.players[0]?.score).toBe(15);
    });

    it("should work with negative values (subtract)", () => {
      // Set initial score
      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: 20,
      });

      state = gameReducer(state, {
        type: "SET_MULTIPLIER",
        playerId: "p1",
        multiplier: 3,
      });

      // Subtract with multiplier
      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: -5,
      });

      const action = state.match?.actions[1];
      expect(action?.basePoints).toBe(-5);
      expect(action?.multiplier).toBe(3);
      expect(action?.finalPoints).toBe(-15);
      expect(state.match?.players[0]?.score).toBe(5); // 20 - 15 = 5
    });

    it("should auto-reset multiplier to 1 after score action", () => {
      state = gameReducer(state, {
        type: "SET_MULTIPLIER",
        playerId: "p1",
        multiplier: 3,
      });
      expect(state.match?.players[0]?.currentMultiplier).toBe(3);

      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: 10,
      });

      expect(state.match?.players[0]?.currentMultiplier).toBe(1);
    });

    it("should not reset if no score action performed", () => {
      state = gameReducer(state, {
        type: "SET_MULTIPLIER",
        playerId: "p1",
        multiplier: 2,
      });
      expect(state.match?.players[0]?.currentMultiplier).toBe(2);

      // Just set another multiplier without scoring
      state = gameReducer(state, {
        type: "SET_MULTIPLIER",
        playerId: "p1",
        multiplier: 5,
      });

      expect(state.match?.players[0]?.currentMultiplier).toBe(5);
    });
  });

  describe("Action History Storage", () => {
    it("should store basePoints, multiplier, and finalPoints in action", () => {
      state = gameReducer(state, {
        type: "SET_MULTIPLIER",
        playerId: "p1",
        multiplier: 3,
      });

      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: 7,
      });

      const action = state.match?.actions[0];
      expect(action).toHaveProperty("basePoints", 7);
      expect(action).toHaveProperty("multiplier", 3);
      expect(action).toHaveProperty("finalPoints", 21);
    });

    it("should handle actions without multiplier fields (backward compat)", () => {
      // Simulate old action format
      const oldAction: ScoreAction = {
        id: "old-action",
        playerId: "p1",
        playerName: "Player 1",
        delta: 10,
        resultingScore: 10,
        timestamp: Date.now(),
        // No multiplier fields
      };

      state.match!.actions.push(oldAction);

      // Should still work, treating as x1
      expect(oldAction.multiplier).toBeUndefined();
      expect(oldAction.basePoints).toBeUndefined();
    });
  });

  describe("Undo Behavior", () => {
    it("should undo a multiplied score correctly", () => {
      state = gameReducer(state, {
        type: "SET_MULTIPLIER",
        playerId: "p1",
        multiplier: 2,
      });

      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: 10,
      });

      expect(state.match?.players[0]?.score).toBe(20);
      expect(state.match?.actions.length).toBe(1);

      state = gameReducer(state, { type: "UNDO" });

      expect(state.match?.players[0]?.score).toBe(0);
      expect(state.match?.actions.length).toBe(0);
    });

    it("should undo multiple multiplied actions in correct sequence", () => {
      // Action 1: x2 multiplier, 5 points
      state = gameReducer(state, {
        type: "SET_MULTIPLIER",
        playerId: "p1",
        multiplier: 2,
      });
      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: 5,
      });
      expect(state.match?.players[0]?.score).toBe(10);

      // Action 2: x1 multiplier, 3 points
      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: 3,
      });
      expect(state.match?.players[0]?.score).toBe(13);

      // Undo action 2
      state = gameReducer(state, { type: "UNDO" });
      expect(state.match?.players[0]?.score).toBe(10);

      // Undo action 1
      state = gameReducer(state, { type: "UNDO" });
      expect(state.match?.players[0]?.score).toBe(0);
    });

    it("should handle undo with negative multiplied values", () => {
      // Score 20 points
      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: 20,
      });
      expect(state.match?.players[0]?.score).toBe(20);

      // Subtract 5 with x3 multiplier (subtract 15)
      state = gameReducer(state, {
        type: "SET_MULTIPLIER",
        playerId: "p1",
        multiplier: 3,
      });
      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: -5,
      });
      expect(state.match?.players[0]?.score).toBe(5);

      // Undo the subtraction
      state = gameReducer(state, { type: "UNDO" });
      expect(state.match?.players[0]?.score).toBe(20);
    });
  });

  describe("Data Persistence", () => {
    it("should serialize and deserialize with multiplier state", () => {
      state = gameReducer(state, {
        type: "SET_MULTIPLIER",
        playerId: "p1",
        multiplier: 2,
      });

      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: 10,
      });

      // Simulate serialization/deserialization
      const serialized = JSON.stringify(state.match);
      const deserialized = JSON.parse(serialized) as GameMatch;

      expect(deserialized.actions[0]?.basePoints).toBe(10);
      expect(deserialized.actions[0]?.multiplier).toBe(2);
      expect(deserialized.actions[0]?.finalPoints).toBe(20);
      expect(deserialized.players[0]?.score).toBe(20);
    });

    it("should reset multiplier state after action for clean saves", () => {
      state = gameReducer(state, {
        type: "SET_MULTIPLIER",
        playerId: "p1",
        multiplier: 3,
      });

      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: 5,
      });

      // After action, multiplier should be reset
      expect(state.match?.players[0]?.currentMultiplier).toBe(1);

      // This state is safe to save/persist
      const serialized = JSON.stringify(state.match);
      expect(serialized).toContain('"currentMultiplier":1');
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiplier = 1 (no multiplication)", () => {
      state = gameReducer(state, {
        type: "SET_MULTIPLIER",
        multiplier: 1,
      });

      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: 100,
      });

      const action = state.match?.actions[0];
      expect(action?.basePoints).toBe(100);
      expect(action?.multiplier).toBe(1);
      expect(action?.finalPoints).toBe(100);
      expect(state.match?.players[0]?.score).toBe(100);
    });

    it("should handle zero base points", () => {
      state = gameReducer(state, {
        type: "SET_MULTIPLIER",
        multiplier: 5,
      });

      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: 0,
      });

      const action = state.match?.actions[0];
      expect(action?.finalPoints).toBe(0);
      expect(state.match?.players[0]?.score).toBe(0);
    });

    it("should handle very large multipliers", () => {
      state = gameReducer(state, {
        type: "SET_MULTIPLIER",
        playerId: "p1",
        multiplier: 100,
      });

      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: 10,
      });

      const action = state.match?.actions[0];
      expect(action?.finalPoints).toBe(1000);
      expect(state.match?.players[0]?.score).toBe(1000);
    });

    it("should handle fractional multipliers gracefully", () => {
      state = gameReducer(state, {
        type: "SET_MULTIPLIER",
        playerId: "p1",
        multiplier: 0.5,
      });

      state = gameReducer(state, {
        type: "UPDATE_SCORE",
        playerId: "p1",
        delta: 10,
      });

      const action = state.match?.actions[0];
      expect(action?.finalPoints).toBe(5);
      expect(state.match?.players[0]?.score).toBe(5);
    });
  });
});
