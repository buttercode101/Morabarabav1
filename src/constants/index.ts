import { PointId, Achievement, DailyReward, TutorialStep, Player, GamePhase, GameState, BoardState } from '../types';

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
  legal: '#4CAF5066',
};

// Board Themes
export const BOARD_THEMES = {
  classic: {
    name: 'Classic',
    board: '#eaddd7',
    lines: '#5b433b',
    background: 'linear-gradient(180deg, #30221e 0%, #5b433b 100%)',
  },
  forest: {
    name: 'Forest',
    board: '#c8d5b9',
    lines: '#2d4a2d',
    background: 'linear-gradient(180deg, #1a2f1a 0%, #2d4a2d 100%)',
  },
  ocean: {
    name: 'Ocean',
    board: '#b8d4d5',
    lines: '#1a3a4a',
    background: 'linear-gradient(180deg, #0a1f2f 0%, #1a3a4a 100%)',
  },
  sunset: {
    name: 'Sunset',
    board: '#d5c8b8',
    lines: '#4a2d1a',
    background: 'linear-gradient(180deg, #2f1a0a 0%, #4a2d1a 100%)',
  },
  royal: {
    name: 'Royal',
    board: '#d5b8c8',
    lines: '#4a1a3a',
    background: 'linear-gradient(180deg, #2f0a1f 0%, #4a1a3a 100%)',
  },
};

// Piece Themes
export const PIECE_THEMES = {
  classic: {
    name: 'Classic',
    player1: '#30221e',
    player2: '#fdf8f6',
  },
  gold: {
    name: 'Gold Rush',
    player1: '#FFD700',
    player2: '#C0C0C0',
  },
  gem: {
    name: 'Gems',
    player1: '#9b59b6',
    player2: '#3498db',
  },
  nature: {
    name: 'Nature',
    player1: '#27ae60',
    player2: '#e67e22',
  },
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

export const INITIAL_STATE: GameState = {
  board: POINT_IDS.reduce<BoardState>((acc, id) => ({ ...acc, [id]: null }), {} as BoardState),
  currentPlayer: 1 as Player,
  phase: 'PLACING' as GamePhase,
  cowsToPlace: { 1: 12, 2: 12 },
  cowsOnBoard: { 1: 0, 2: 0 },
  cowsLost: { 1: 0, 2: 0 },
  winner: null as Player | null,
  lastMillPoints: null as PointId[] | null,
  lastMillByPlayer: { 1: null, 2: null },
  movesWithoutShot: 0,
};

export const STORAGE_KEYS = {
  WINS: 'morabaraba_wins',
  LOSSES: 'morabaraba_losses',
  DRAWS: 'morabaraba_draws',
  STATS: 'morabaraba_stats',
  ACHIEVEMENTS: 'morabaraba_achievements',
  SETTINGS: 'morabaraba_settings',
  STREAK: 'morabaraba_streak',
  DAILY_REWARDS: 'morabaraba_daily_rewards',
  TUTORIAL: 'morabaraba_tutorial',
  UNLOCKS: 'morabaraba_unlocks',
};

// Achievement Definitions
export const ACHIEVEMENTS: Achievement[] = [
  // First Steps
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Win your first game',
    icon: '🏆',
    category: 'first_steps',
    requirement: 1,
    progress: 0,
    unlocked: false,
    reward: { type: 'coins', value: 50 },
  },
  {
    id: 'century',
    name: 'Century',
    description: 'Play 100 games',
    icon: '💯',
    category: 'first_steps',
    requirement: 100,
    progress: 0,
    unlocked: false,
    reward: { type: 'coins', value: 200 },
  },
  {
    id: 'dedication',
    name: 'Dedication',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'first_steps',
    requirement: 7,
    progress: 0,
    unlocked: false,
    reward: { type: 'coins', value: 100 },
  },
  // Skill
  {
    id: 'perfect_mill',
    name: 'Perfect Mill',
    description: 'Form 10 mills in a single game',
    icon: '✨',
    category: 'skill',
    requirement: 10,
    progress: 0,
    unlocked: false,
    reward: { type: 'coins', value: 150 },
  },
  {
    id: 'fly_like_bird',
    name: 'Fly Like a Bird',
    description: 'Fly 5 times in one game',
    icon: '🦅',
    category: 'skill',
    requirement: 5,
    progress: 0,
    unlocked: false,
    reward: { type: 'coins', value: 100 },
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Win without losing a cow',
    icon: '🛡️',
    category: 'skill',
    requirement: 1,
    progress: 0,
    unlocked: false,
    reward: { type: 'cosmetic', value: 'gold_pieces' },
  },
  {
    id: 'comeback_king',
    name: 'Comeback King',
    description: 'Win after losing 8 cows',
    icon: '👑',
    category: 'skill',
    requirement: 1,
    progress: 0,
    unlocked: false,
    reward: { type: 'coins', value: 250 },
  },
  // Mastery
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    description: 'Beat Elder difficulty AI',
    icon: '🎓',
    category: 'mastery',
    requirement: 1,
    progress: 0,
    unlocked: false,
    reward: { type: 'cosmetic', value: 'elder_board' },
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Win 10 games in a row',
    icon: '⚡',
    category: 'mastery',
    requirement: 10,
    progress: 0,
    unlocked: false,
    reward: { type: 'coins', value: 500 },
  },
  // Dedication
  {
    id: 'legend',
    name: 'Legend',
    description: 'Play 1000 games',
    icon: '🌟',
    category: 'dedication',
    requirement: 1000,
    progress: 0,
    unlocked: false,
    reward: { type: 'title', value: 'Morabaraba Legend' },
  },
];

// Tutorial Steps
export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'place_1',
    title: 'Place Your Cow',
    description: 'Tap on any empty point to place your cow. Player 1 (dark) goes first.',
    action: 'place',
    skipAllowed: false,
  },
  {
    id: 'place_2',
    title: 'Opponent\'s Turn',
    description: 'Wait for your opponent to place their cow. You\'ll take turns placing all 12 cows.',
    action: 'place',
    skipAllowed: true,
  },
  {
    id: 'mill_intro',
    title: 'Form a Mill!',
    description: 'Get 3 cows in a row to form a "mill". This lets you remove an opponent\'s cow!',
    action: 'mill',
    skipAllowed: false,
  },
  {
    id: 'shoot_intro',
    title: 'Remove a Cow',
    description: 'Tap on an opponent\'s cow to remove it. You can\'t take cows that are in a mill (unless all are).',
    action: 'shoot',
    skipAllowed: false,
  },
  {
    id: 'move_intro',
    title: 'Moving Phase',
    description: 'Once all cows are placed, tap your cow then tap an adjacent empty spot to move.',
    action: 'move',
    skipAllowed: true,
  },
  {
    id: 'fly_intro',
    title: 'Flying!',
    description: 'When you only have 3 cows left, you can "fly" - move to ANY empty spot!',
    action: 'move',
    skipAllowed: true,
  },
  {
    id: 'win_condition',
    title: 'How to Win',
    description: 'Reduce your opponent to 2 cows OR block all their moves. Good luck!',
    action: 'move',
    skipAllowed: true,
  },
];

// Daily Rewards (7-day cycle)
export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, coins: 50, claimed: false },
  { day: 2, coins: 75, claimed: false },
  { day: 3, coins: 100, claimed: false },
  { day: 4, coins: 150, claimed: false },
  { day: 5, coins: 200, claimed: false },
  { day: 6, coins: 250, claimed: false },
  { day: 7, coins: 500, item: 'rare_cosmetic', claimed: false },
];

// Cultural Information
export const CULTURAL_INFO = {
  title: 'About Morabaraba',
  history: `Morabaraba is an ancient two-player strategy game that originated in Southern Africa over 1000 years ago. 
    Also known as "Morabaraba", "Umlabalaba", or "Ayo", it belongs to the mancala family of games.`,
  culturalSignificance: `In traditional African societies, cattle represented wealth and status. 
    Morabaraba simulates cattle raiding - a common occurrence in pastoral communities. 
    The game was used to teach young men strategic thinking and planning.`,
  traditionalRules: [
    'The game is traditionally played on a board carved into stone or drawn in dirt',
    'Pieces were originally stones, seeds, or dried cow dung',
    'Games were often played during cattle herding or community gatherings',
    'Elders would teach the game to children as part of cultural education',
  ],
  proverbs: [
    'A wise player plans three moves ahead',
    'The herd belongs to the patient one',
    'One clever move beats ten hasty ones',
  ],
  variations: [
    'In some regions, flying is allowed with 4 cows instead of 3',
    'Some variations allow "doubles" - two mills formed with one move',
    'Certain areas play with 9 cows per player instead of 12',
  ],
};

// AI Difficulty Settings
export const AI_SETTINGS = {
  EASY: {
    name: 'Beginner',
    description: 'Makes random moves, misses opportunities',
    lookAhead: 1,
    mistakeChance: 0.4,
  },
  MEDIUM: {
    name: 'Traditional',
    description: 'Basic strategy, blocks obvious threats',
    lookAhead: 2,
    mistakeChance: 0.2,
  },
  HARD: {
    name: 'Master',
    description: 'Advanced tactics, rarely makes mistakes',
    lookAhead: 3,
    mistakeChance: 0.05,
  },
  ELDER: {
    name: 'Elder',
    description: 'Perfect play, never misses opportunities',
    lookAhead: 4,
    mistakeChance: 0,
  },
};
