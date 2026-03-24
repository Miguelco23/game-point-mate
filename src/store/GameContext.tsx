import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { GameMatch, Player, ScoreAction, PLAYER_COLORS } from "./gameTypes";

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
  | { type: "LOAD"; match: GameMatch };

function generateId() {
  return Math.random().toString(36).slice(2, 10);
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
      const newScore = player.score + action.delta;
      const scoreAction: ScoreAction = {
        id: generateId(),
        playerId: action.playerId,
        playerName: player.name,
        delta: action.delta,
        resultingScore: newScore,
        timestamp: Date.now(),
      };
      return {
        match: {
          ...state.match,
          players: state.match.players.map((p) =>
            p.id === action.playerId ? { ...p, score: newScore } : p
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

    default:
      return state;
  }
}

const STORAGE_KEY = "gamepoint-match";

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
  getNextColor: () => string;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, { match: null }, () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { match: JSON.parse(stored) as GameMatch };
    } catch {}
    return { match: null };
  });

  useEffect(() => {
    if (state.match) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.match));
    } else {
      localStorage.removeItem(STORAGE_KEY);
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
    getNextColor,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
