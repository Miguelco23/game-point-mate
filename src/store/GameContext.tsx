import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { GameMatch, Player, ScoreAction, PLAYER_COLORS } from "./gameTypes";
import { storageService } from "@/lib/storageService";

interface GameState {
  match: GameMatch | null;
}

type GameAction =
  | { type: "CREATE_MATCH" }
  | { type: "ADD_PLAYER"; name: string; color: string }
  | { type: "REMOVE_PLAYER"; playerId: string }
  | { type: "EDIT_PLAYER"; playerId: string; name: string; color: string }
  | { type: "UPDATE_SCORE"; playerId: string; delta: number }
  | { type: "UNDO" }
  | { type: "RESET_SCORES" }
  | { type: "END_MATCH" }
  | { type: "LOAD"; match: GameMatch }
  | { type: "SET_MULTIPLIER"; playerId: string; multiplier: number };

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

interface GameContextType {
  match: GameMatch | null;
  createMatch: () => void;
  addPlayer: (name: string, color: string) => void;
  removePlayer: (id: string) => void;
  editPlayer: (id: string, name: string, color: string) => void;
  updateScore: (playerId: string, delta: number) => void;
  undo: () => void;
  resetScores: () => void;
  endMatch: () => void;
  loadMatch: (match: GameMatch) => void;
  getNextColor: () => string;
  setMultiplier: (playerId: string, multiplier: number) => void;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "CREATE_MATCH":
      return {
        match: {
          id: generateId(),
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
      if (state.match.players.length >= 12) return state;
      const newPlayer: Player = {
        id: generateId(),
        name: action.name,
        color: action.color,
        score: 0,
        currentMultiplier: 1,
      };
      return {
        match: { ...state.match, players: [...state.match.players, newPlayer] },
      };
    }

    case "REMOVE_PLAYER": {
      if (!state.match) return state;
      return {
        match: {
          ...state.match,
          players: state.match.players.filter((p) => p.id !== action.playerId),
          actions: state.match.actions.filter((a) => a.playerId !== action.playerId),
        },
      };
    }

    case "EDIT_PLAYER": {
      if (!state.match) return state;
      return {
        match: {
          ...state.match,
          players: state.match.players.map((p) =>
            p.id === action.playerId ? { ...p, name: action.name, color: action.color } : p
          ),
          actions: state.match.actions.map((a) =>
            a.playerId === action.playerId ? { ...a, playerName: action.name } : a
          ),
        },
      };
    }

    case "UPDATE_SCORE": {
      if (!state.match) return state;
      const player = state.match.players.find((p) => p.id === action.playerId);
      if (!player) return state;
      
      // Calculate multiplied score
      const basePoints = action.delta;
      const multiplier = player.currentMultiplier || 1;
      const finalPoints = basePoints * multiplier;
      const newScore = player.score + finalPoints;
      
      const scoreAction: ScoreAction = {
        id: generateId(),
        playerId: action.playerId,
        playerName: player.name,
        delta: finalPoints, // Store actual delta used
        resultingScore: newScore,
        timestamp: Date.now(),
        basePoints, // Store base (before multiplier) for reference
        multiplier, // Store multiplier used
        finalPoints, // Store final calculated points
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

    case "RESET_SCORES": {
      if (!state.match) return state;
      return {
        match: {
          ...state.match,
          players: state.match.players.map((p) => ({ ...p, score: 0 })),
          actions: [],
        },
      };
    }

    case "END_MATCH":
      return { match: null };

    case "LOAD":
      return { match: action.match };

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

    default:
      return state;
  }
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, { match: null }, () => {
    try {
      const result = storageService.getCurrentMatch();
      if (result.success && result.data) {
        return { match: result.data };
      }
    } catch {}
    return { match: null };
  });

  useEffect(() => {
    const result = storageService.setCurrentMatch(state.match);
    if (!result.success) {
      console.error("Failed to persist match:", result.error);
    }
  }, [state.match]);

  const getNextColor = useCallback(() => {
    const usedColors = state.match?.players.map((p) => p.color) ?? [];
    return PLAYER_COLORS.find((c) => !usedColors.includes(c)) ?? PLAYER_COLORS[0];
  }, [state.match]);

  const value: GameContextType = {
    match: state.match,
    createMatch: () => dispatch({ type: "CREATE_MATCH" }),
    addPlayer: (name, color) => dispatch({ type: "ADD_PLAYER", name, color }),
    removePlayer: (id) => dispatch({ type: "REMOVE_PLAYER", playerId: id }),
    editPlayer: (id, name, color) => dispatch({ type: "EDIT_PLAYER", playerId: id, name, color }),
    updateScore: (playerId, delta) => dispatch({ type: "UPDATE_SCORE", playerId, delta }),
    undo: () => dispatch({ type: "UNDO" }),
    resetScores: () => dispatch({ type: "RESET_SCORES" }),
    endMatch: () => dispatch({ type: "END_MATCH" }),
    loadMatch: (match) => dispatch({ type: "LOAD", match }),
    getNextColor,
    setMultiplier: (playerId, multiplier) => dispatch({ type: "SET_MULTIPLIER", playerId, multiplier }),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
