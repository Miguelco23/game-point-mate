export interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
}

export interface ScoreAction {
  id: string;
  playerId: string;
  playerName: string;
  delta: number;
  resultingScore: number;
  timestamp: number;
}

export interface GameMatch {
  id: string;
  players: Player[];
  actions: ScoreAction[];
  createdAt: number;
  isActive: boolean;
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
