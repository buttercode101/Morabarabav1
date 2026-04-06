// Morabaraba Types
export type Player = 1 | 2;
export type GamePhase = 'MENU' | 'TUTORIAL' | 'PLACING' | 'MOVING' | 'FLYING' | 'SHOOTING' | 'GAME_OVER';
export type GameMode = 'SINGLE' | 'HOTSEAT' | 'AI';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'ELDER';

export type PointId =
  | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8'
  | 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7' | 'R8'
  | 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6' | 'E7' | 'E8';

export interface BoardState {
  [key: string]: Player | null;
}

export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  phase: GamePhase;
  cowsToPlace: { [key in Player]: number };
  cowsOnBoard: { [key in Player]: number };
  cowsLost: { [key in Player]: number };
  winner: Player | null;
  lastMillPoints: PointId[] | null;
  lastMillByPlayer: { [key in Player]: string | null };
  movesWithoutShot: number;
}

export interface Point {
  id: PointId;
  x: number;
  y: number;
  occupant: Player | null;
}

export interface GameSettings {
  sound: boolean;
  music: boolean;
  haptics: boolean;
  difficulty: Difficulty;
  boardTheme: string;
  pieceTheme: string;
}

// Achievement System Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'first_steps' | 'skill' | 'mastery' | 'dedication';
  requirement: number;
  progress: number;
  unlocked: boolean;
  reward?: {
    type: 'coins' | 'cosmetic' | 'title';
    value: number | string;
  };
}

// Statistics Types
export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  totalMillsFormed: number;
  totalCowsRemoved: number;
  totalCowsLost: number;
  gamesVsAI: number;
  winsVsAI: number;
  bestGameTime: number;
  totalPlayTime: number;
  favoriteOpening: string;
  winRateByDifficulty: { [key in Difficulty]?: number };
}

// Tutorial Types
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  highlightPoints?: PointId[];
  action: 'place' | 'move' | 'mill' | 'shoot';
  requiredAction?: {
    type: string;
    target?: PointId;
  };
  skipAllowed: boolean;
}

export interface TutorialState {
  currentStep: number;
  completed: boolean;
  skipped: boolean;
}

// Daily Rewards Types
export interface DailyReward {
  day: number;
  coins: number;
  item?: string;
  claimed: boolean;
}

export interface StreakData {
  currentStreak: number;
  lastLogin: string;
  totalLogins: number;
  bestStreak: number;
}

// Particle System Types
export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'spark' | 'dust' | 'glow' | 'confetti';
}
