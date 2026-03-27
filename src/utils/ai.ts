import { BoardState, Player, PointId, GameState } from '../types';
import { MILLS, ADJACENCY_MAP, POINT_IDS } from '../constants';

/**
 * Morabaraba AI Opponent
 * Uses Minimax algorithm with alpha-beta pruning
 * Difficulty levels control search depth and mistake chance
 */

export interface AIMove {
  point: PointId;
  score: number;
}

export interface AISettings {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ELDER';
  lookAhead: number;
  mistakeChance: number;
}

const DIFFICULTY_SETTINGS: Record<string, AISettings> = {
  EASY: { difficulty: 'EASY', lookAhead: 1, mistakeChance: 0.4 },
  MEDIUM: { difficulty: 'MEDIUM', lookAhead: 2, mistakeChance: 0.2 },
  HARD: { difficulty: 'HARD', lookAhead: 3, mistakeChance: 0.05 },
  ELDER: { difficulty: 'ELDER', lookAhead: 4, mistakeChance: 0 },
};

// Check if a move forms a mill
function checkMill(board: BoardState, point: PointId, player: Player): boolean {
  return MILLS.some(mill => 
    mill.includes(point) && 
    mill.every(p => board[p] === player)
  );
}

// Get all valid moves for current phase
export function getValidMoves(
  board: BoardState,
  player: Player,
  cowsToPlace: number,
  cowsOnBoard: number,
  phase: string,
  mustRemoveOpponentMill: boolean = false
): PointId[] {
  const validMoves: PointId[] = [];

  if (phase === 'PLACING' && cowsToPlace > 0) {
    // Can place on any empty spot
    POINT_IDS.forEach(point => {
      if (board[point] === null) {
        validMoves.push(point);
      }
    });
  } else if (phase === 'MOVING' || phase === 'FLYING') {
    // Find all player's pieces and their valid moves
    const canFly = phase === 'FLYING' || cowsOnBoard === 3;
    
    POINT_IDS.forEach(from => {
      if (board[from] === player) {
        if (canFly) {
          // Can fly to any empty spot
          POINT_IDS.forEach(to => {
            if (board[to] === null && !validMoves.includes(to)) {
              validMoves.push(to);
            }
          });
        } else {
          // Can only move to adjacent spots
          ADJACENCY_MAP[from].forEach(to => {
            if (board[to] === null && !validMoves.includes(to)) {
              validMoves.push(to);
            }
          });
        }
      }
    });
  } else if (phase === 'SHOOTING' || mustRemoveOpponentMill) {
    // Can remove any opponent piece that's not in a mill
    const opponent = player === 1 ? 2 : 1;
    POINT_IDS.forEach(point => {
      if (board[point] === opponent && !checkMill(board, point, opponent)) {
        validMoves.push(point);
      }
    });
    // If all opponent pieces are in mills, can take any
    if (validMoves.length === 0) {
      POINT_IDS.forEach(point => {
        if (board[point] === opponent) {
          validMoves.push(point);
        }
      });
    }
  }

  return validMoves;
}

// Evaluate board state for AI
function evaluateBoard(board: BoardState, aiPlayer: Player): number {
  const opponent = aiPlayer === 1 ? 2 : 1;
  let score = 0;

  // Count pieces
  const aiPieces = POINT_IDS.filter(p => board[p] === aiPlayer).length;
  const opponentPieces = POINT_IDS.filter(p => board[p] === opponent).length;
  
  score += (aiPieces - opponentPieces) * 100;

  // Count mills
  const aiMills = MILLS.filter(mill => mill.every(p => board[p] === aiPlayer)).length;
  const opponentMills = MILLS.filter(mill => mill.every(p => board[p] === opponent)).length;
  
  score += (aiMills - opponentMills) * 500;

  // Count potential mills (2 in a row)
  MILLS.forEach(mill => {
    const aiInMill = mill.filter(p => board[p] === aiPlayer).length;
    const opponentInMill = mill.filter(p => board[p] === opponent).length;
    const emptyInMill = mill.filter(p => board[p] === null).length;
    
    if (aiInMill === 2 && emptyInMill === 1) {
      score += 150; // About to form a mill
    }
    if (opponentInMill === 2 && emptyInMill === 1) {
      score -= 150; // Opponent about to form a mill
    }
  });

  // Position bonus (control center)
  const centerPoints: PointId[] = ['E2', 'E4', 'E6', 'E8', 'R2', 'R4', 'R6', 'R8'];
  centerPoints.forEach(point => {
    if (board[point] === aiPlayer) score += 10;
    if (board[point] === opponent) score -= 10;
  });

  // Mobility bonus
  const aiMoves = getValidMoves(board, aiPlayer, 0, aiPieces, 'MOVING').length;
  const opponentMoves = getValidMoves(board, opponent, 0, opponentPieces, 'MOVING').length;
  score += (aiMoves - opponentMoves) * 5;

  return score;
}

// Minimax algorithm with alpha-beta pruning
function minimax(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  aiPlayer: Player,
  phase: string,
  cowsToPlace: { [key in Player]: number },
  cowsOnBoard: { [key in Player]: number }
): number {
  if (depth === 0) {
    return evaluateBoard(board, aiPlayer);
  }

  const currentPlayer = maximizingPlayer ? aiPlayer : (aiPlayer === 1 ? 2 : 1);
  const validMoves = getValidMoves(
    board,
    currentPlayer,
    cowsToPlace[currentPlayer],
    cowsOnBoard[currentPlayer],
    phase
  );

  if (validMoves.length === 0) {
    return maximizingPlayer ? -10000 : 10000;
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of validMoves) {
      const newBoard = { ...board, [move]: currentPlayer };
      const evalScore = minimax(
        newBoard,
        depth - 1,
        alpha,
        beta,
        false,
        aiPlayer,
        phase,
        cowsToPlace,
        cowsOnBoard
      );
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of validMoves) {
      const newBoard = { ...board, [move]: currentPlayer };
      const evalScore = minimax(
        newBoard,
        depth - 1,
        alpha,
        beta,
        true,
        aiPlayer,
        phase,
        cowsToPlace,
        cowsOnBoard
      );
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// Get best move for AI
export function getAIMove(
  gameState: GameState,
  aiPlayer: Player,
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ELDER' = 'MEDIUM'
): AIMove | null {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const { board, currentPlayer, phase, cowsToPlace, cowsOnBoard } = gameState;

  // Check if it's AI's turn
  if (currentPlayer !== aiPlayer) return null;

  const validMoves = getValidMoves(
    board,
    aiPlayer,
    cowsToPlace[aiPlayer],
    cowsOnBoard[aiPlayer],
    phase
  );

  if (validMoves.length === 0) return null;

  // Easy difficulty: sometimes make random mistakes
  if (difficulty === 'EASY' && Math.random() < settings.mistakeChance) {
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    return { point: randomMove, score: 0 };
  }

  // Check for immediate winning moves (form mill or win game)
  for (const move of validMoves) {
    const newBoard = { ...board, [move]: aiPlayer };
    
    // Check if this forms a mill
    if (checkMill(newBoard, move, aiPlayer)) {
      return { point: move, score: 10000 };
    }

    // Check if this blocks opponent's mill
    const opponent = aiPlayer === 1 ? 2 : 1;
    const opponentCanWin = POINT_IDS.some(p => {
      if (board[p] === null) {
        const testBoard = { ...board, [p]: opponent };
        return checkMill(testBoard, p, opponent);
      }
      return false;
    });

    if (opponentCanWin) {
      const blockingMove = validMoves.find(m => {
        const testBoard = { ...board, [m]: aiPlayer };
        return !POINT_IDS.some(p => {
          if (testBoard[p] === null) {
            const oppTestBoard = { ...testBoard, [p]: opponent };
            return checkMill(oppTestBoard, p, opponent);
          }
          return false;
        });
      });
      if (blockingMove) {
        return { point: blockingMove, score: 5000 };
      }
    }
  }

  // Use minimax for deeper analysis
  let bestMove: PointId = validMoves[0];
  let bestScore = -Infinity;

  for (const move of validMoves) {
    const newBoard = { ...board, [move]: aiPlayer };
    const score = minimax(
      newBoard,
      settings.lookAhead,
      -Infinity,
      Infinity,
      false,
      aiPlayer,
      phase,
      cowsToPlace,
      cowsOnBoard
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return { point: bestMove, score: bestScore };
}

// Get hint for human player
export function getHint(
  gameState: GameState,
  player: Player
): PointId | null {
  const move = getAIMove(gameState, player, 'HARD');
  return move ? move.point : null;
}
