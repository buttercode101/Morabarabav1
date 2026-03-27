// Morabaraba Types
export type Player = 1 | 2;
export type GamePhase = 'MENU' | 'PLACING' | 'MOVING' | 'FLYING' | 'SHOOTING' | 'GAME_OVER';
export type GameMode = 'SINGLE' | 'HOTSEAT';

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
}

export interface Point {
  id: PointId;
  x: number;
  y: number;
  occupant: Player | null;
}

export interface GameSettings {
  sound: boolean;
  haptics: boolean;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}
