import { PointId } from '../types';

export const PALETTE = {
  board: '#eaddd7',
  boardDark: '#d4c4b8',
  lines: '#5b433b',
  player1: '#30221e',
  player2: '#fdf8f6',
  accent: '#f27696',
  accentDark: '#e94a74',
  highlight: '#4CAF50',
  selected: '#FFD700',
};

export const POINT_COORDINATES: Record<PointId, { x: number; y: number }> = {
  'A1': { x: 100, y: 100 }, 'A2': { x: 256, y: 100 }, 'A3': { x: 412, y: 100 },
  'A8': { x: 100, y: 256 }, 'A4': { x: 412, y: 256 },
  'A7': { x: 100, y: 412 }, 'A6': { x: 256, y: 412 }, 'A5': { x: 412, y: 412 },
  'R1': { x: 150, y: 150 }, 'R2': { x: 256, y: 150 }, 'R3': { x: 362, y: 150 },
  'R8': { x: 150, y: 256 }, 'R4': { x: 362, y: 256 },
  'R7': { x: 150, y: 362 }, 'R6': { x: 256, y: 362 }, 'R5': { x: 362, y: 362 },
  'E1': { x: 200, y: 200 }, 'E2': { x: 256, y: 200 }, 'E3': { x: 312, y: 200 },
  'E8': { x: 200, y: 256 }, 'E4': { x: 312, y: 256 },
  'E7': { x: 200, y: 312 }, 'E6': { x: 256, y: 312 }, 'E5': { x: 312, y: 312 },
};

export const ADJACENCY_MAP: Record<PointId, PointId[]> = {
  'A1': ['A2', 'A8', 'R1'], 'A2': ['A1', 'A3', 'R2'], 'A3': ['A2', 'A4', 'R3'],
  'A4': ['A3', 'A5', 'R4'], 'A5': ['A4', 'A6', 'R5'], 'A6': ['A5', 'A7', 'R6'],
  'A7': ['A6', 'A8', 'R7'], 'A8': ['A7', 'A1', 'R8'],
  'R1': ['R2', 'R8', 'A1', 'E1'], 'R2': ['R1', 'R3', 'A2', 'E2'],
  'R3': ['R2', 'R4', 'A3', 'E3'], 'R4': ['R3', 'R5', 'A4', 'E4'],
  'R5': ['R4', 'R6', 'A5', 'E5'], 'R6': ['R5', 'R7', 'A6', 'E6'],
  'R7': ['R6', 'R8', 'A7', 'E7'], 'R8': ['R7', 'R1', 'A8', 'E8'],
  'E1': ['E2', 'E8', 'R1'], 'E2': ['E1', 'E3', 'R2'], 'E3': ['E2', 'E4', 'R3'],
  'E4': ['E3', 'E5', 'R4'], 'E5': ['E4', 'E6', 'R5'], 'E6': ['E5', 'E7', 'R6'],
  'E7': ['E6', 'E8', 'R7'], 'E8': ['E7', 'E1', 'R8'],
};

export const MILLS: PointId[][] = [
  ['A1', 'A2', 'A3'], ['A3', 'A4', 'A5'], ['A5', 'A6', 'A7'], ['A7', 'A8', 'A1'],
  ['R1', 'R2', 'R3'], ['R3', 'R4', 'R5'], ['R5', 'R6', 'R7'], ['R7', 'R8', 'R1'],
  ['E1', 'E2', 'E3'], ['E3', 'E4', 'E5'], ['E5', 'E6', 'E7'], ['E7', 'E8', 'E1'],
  ['A2', 'R2', 'E2'], ['A4', 'R4', 'E4'], ['A6', 'R6', 'E6'], ['A8', 'R8', 'E8'],
  ['A1', 'R1', 'E1'], ['A3', 'R3', 'E3'], ['A5', 'R5', 'E5'], ['A7', 'R7', 'E7'],
];

export const POINT_IDS: PointId[] = Object.keys(POINT_COORDINATES) as PointId[];

export const INITIAL_STATE = {
  board: POINT_IDS.reduce((acc, id) => ({ ...acc, [id]: null }), {}),
  currentPlayer: 1 as Player,
  phase: 'PLACING' as GamePhase,
  cowsToPlace: { 1: 12, 2: 12 },
  cowsOnBoard: { 1: 0, 2: 0 },
  cowsLost: { 1: 0, 2: 0 },
  winner: null as Player | null,
  lastMillPoints: null as PointId[] | null,
};

export const STORAGE_KEYS = {
  WINS: 'morabaraba_wins',
  LOSSES: 'morabaraba_losses',
  DRAWS: 'morabaraba_draws',
};
