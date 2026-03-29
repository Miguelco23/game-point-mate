export interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
  currentMultiplier?: number; // Multiplier for this player's next score action
}

export interface ScoreAction {
  id: string;
  playerId: string;
  playerName: string;
  delta: number;
  resultingScore: number;
  timestamp: number;
  basePoints?: number; // Points before multiplier (for display and calculation)
  multiplier?: number; // Multiplier applied (1, 2, 3, 5, etc.)
  finalPoints?: number; // Calculated points sent to player (basePoints * multiplier)
}

export type MatchStatus = "active" | "paused" | "finished";

export interface GameMatch {
  id: string;
  name?: string;
  players: Player[];
  actions: ScoreAction[];
  createdAt: number;
  updatedAt: number;
  status: MatchStatus;
  isActive: boolean;
  sourceMatchId?: string;
}

export interface GameSettings {
  language: "en" | "es";
}

export const PLAYER_COLORS = [
  "0 75% 65%",     // coral
  "200 80% 60%",   // blue
  "142 60% 50%",   // green
  "38 92% 60%",    // amber
  "270 70% 65%",   // purple
  "180 60% 50%",   // teal
  "330 70% 60%",   // pink
  "20 90% 55%",    // orange
  "60 70% 50%",    // yellow-green
  "210 80% 55%",   // royal blue
  "350 65% 55%",   // crimson
  "160 50% 50%",   // sage
];
