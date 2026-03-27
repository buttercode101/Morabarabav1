import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { useAudio, useLocalStorage } from './hooks';
import { POINT_COORDINATES, POINT_IDS, ADJACENCY_MAP, MILLS, INITIAL_STATE, PALETTE, STORAGE_KEYS } from './constants';
import { GamePhase, GameMode, Player, PointId, BoardState } from './types';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('MENU');
  const [mode, setMode] = useState<GameMode>('SINGLE');
  const [sound, setSound] = useState(true);
  const audio = useAudio(sound);
  
  const [wins, setWins] = useLocalStorage<number>(STORAGE_KEYS.WINS, 0);
  const [losses, setLosses] = useLocalStorage<number>(STORAGE_KEYS.LOSSES, 0);
  
  const [gameState, setGameState] = useState(INITIAL_STATE);
  const [selectedPoint, setSelectedPoint] = useState<PointId | null>(null);
  const [message, setMessage] = useState('');

  const { board, currentPlayer, cowsToPlace, cowsOnBoard, winner, lastMillPoints } = gameState;

  // Check if a point forms a mill
  const checkMill = useCallback((boardState: BoardState, point: PointId, player: Player): PointId[] | null => {
    for (const mill of MILLS) {
      if (mill.includes(point) && mill.every(p => boardState[p] === player)) {
        return mill;
      }
    }
    return null;
  }, []);

  // Check win condition
  const checkWin = useCallback((state: typeof INITIAL_STATE): Player | null => {
    if (state.cowsOnBoard[1] < 3) return 2;
    if (state.cowsOnBoard[2] < 3) return 1;
    
    // Check if current player has legal moves
    const hasLegalMove = POINT_IDS.some(point => {
      if (state.board[point] !== state.currentPlayer) return false;
      if (state.cowsOnBoard[state.currentPlayer] === 3) return true; // Can fly
      return ADJACENCY_MAP[point].some(adj => state.board[adj] === null);
    });
    
    if (!hasLegalMove) return state.currentPlayer === 1 ? 2 : 1;
    return null;
  }, []);

  // Handle point click
  const handlePointClick = useCallback((point: PointId) => {
    if (winner) return;
    
    const occupant = board[point];
    
    // PLACING PHASE
    if (gameState.phase === 'PLACING') {
      if (occupant !== null) return; // Point occupied
      if (cowsToPlace[currentPlayer] <= 0) return; // No cows left to place
      
      const newBoard = { ...board, [point]: currentPlayer };
      const mill = checkMill(newBoard, point, currentPlayer);
      
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        cowsToPlace: { ...prev.cowsToPlace, [currentPlayer]: prev.cowsToPlace[currentPlayer] - 1 },
        cowsOnBoard: { ...prev.cowsOnBoard, [currentPlayer]: prev.cowsOnBoard[currentPlayer] + 1 },
        phase: mill ? 'SHOOTING' : (cowsToPlace[1] === 1 && cowsToPlace[2] === 1 ? 'MOVING' : prev.phase),
        lastMillPoints: mill || null,
      }));
      
      audio.place();
      if (mill) {
        audio.mill();
        setMessage(`Player ${currentPlayer} formed a mill!`);
        setTimeout(() => setMessage(''), 2000);
      }
      
      // Check if all cows placed
      if (cowsToPlace[1] === 1 && cowsToPlace[2] === 1 && !mill) {
        setGameState(prev => ({ ...prev, phase: 'MOVING', currentPlayer: prev.currentPlayer === 1 ? 2 : 1 }));
      } else if (!mill) {
        setGameState(prev => ({ ...prev, currentPlayer: prev.currentPlayer === 1 ? 2 : 1 }));
      }
      return;
    }
    
    // SHOOTING PHASE
    if (gameState.phase === 'SHOOTING') {
      const opponent = currentPlayer === 1 ? 2 : 1;
      if (occupant !== opponent) return; // Can only shoot opponent's cow
      if (checkMill(board, point, opponent)) return; // Can't shoot cow in mill (unless all are in mills)
      
      const newBoard = { ...board, [point]: null };
      const newCowsLost = { ...gameState.cowsLost, [opponent]: gameState.cowsLost[opponent] + 1 };
      const newCowsOnBoard = { ...gameState.cowsOnBoard, [opponent]: gameState.cowsOnBoard[opponent] - 1 };
      
      const win = checkWin({ ...gameState, board: newBoard, cowsOnBoard: newCowsOnBoard });
      
      if (win) {
        setGameState(prev => ({ ...prev, board: newBoard, cowsLost: newCowsLost, cowsOnBoard: newCowsOnBoard, winner: win }));
        audio.win();
        if (win === 1) setWins(w => w + 1);
        else setLosses(l => l + 1);
        setPhase('GAME_OVER');
      } else {
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          cowsLost: newCowsLost,
          cowsOnBoard: newCowsOnBoard,
          phase: 'PLACING',
          lastMillPoints: null,
          currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
        }));
      }
      
      audio.place();
      return;
    }
    
    // MOVING/FLYING PHASE
    if (gameState.phase === 'MOVING' || gameState.phase === 'FLYING') {
      // Select own cow
      if (occupant === currentPlayer) {
        setSelectedPoint(point);
        audio.click();
        return;
      }
      
      // Move to empty point
      if (occupant === null && selectedPoint) {
        const canFly = gameState.phase === 'FLYING' || cowsOnBoard[currentPlayer] === 3;
        const isAdjacent = canFly || ADJACENCY_MAP[selectedPoint].includes(point);
        
        if (!isAdjacent) return;
        
        const newBoard = { ...board, [selectedPoint]: null, [point]: currentPlayer };
        const mill = checkMill(newBoard, point, currentPlayer);
        
        const win = checkWin({ ...gameState, board: newBoard });
        
        if (win) {
          setGameState(prev => ({ ...prev, board: newBoard, winner: win }));
          audio.win();
          if (win === 1) setWins(w => w + 1);
          else setLosses(l => l + 1);
          setPhase('GAME_OVER');
        } else if (mill) {
          setGameState(prev => ({
            ...prev,
            board: newBoard,
            phase: 'SHOOTING',
            lastMillPoints: mill,
          }));
          audio.mill();
          setMessage(`Player ${currentPlayer} formed a mill!`);
          setTimeout(() => setMessage(''), 2000);
        } else {
          setGameState(prev => ({
            ...prev,
            board: newBoard,
            currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
          }));
          audio.move();
        }
        
        setSelectedPoint(null);
        return;
      }
    }
  }, [board, currentPlayer, cowsToPlace, cowsOnBoard, gameState, winner, checkMill, checkWin, audio, setWins, setLosses]);

  const startGame = (selectedMode: GameMode) => {
    audio.click();
    setMode(selectedMode);
    setGameState(INITIAL_STATE);
    setSelectedPoint(null);
    setPhase('PLAYING');
    setMessage('');
  };

  const quitToMenu = () => {
    audio.click();
    setPhase('MENU');
    setGameState(INITIAL_STATE);
    setSelectedPoint(null);
  };

  // Render Menu
  if (phase === 'MENU') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#30221e] to-[#5b433b] text-[#fdf8f6] p-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 tracking-tighter">MORABARABA</h1>
          <p className="text-[#bfa094] text-lg italic">"The Game of the Herd"</p>
        </motion.div>
        
        <div className="flex flex-col gap-4 w-full max-w-md mb-8">
          <button onClick={() => startGame('SINGLE')} className="bg-[#f27696] hover:bg-[#e94a74] text-white px-8 py-4 rounded-xl font-bold text-xl transition-all hover:scale-105 flex items-center justify-center gap-3">
            <Play className="w-6 h-6" /> SINGLE PLAYER
          </button>
          <button onClick={() => startGame('HOTSEAT')} className="border-2 border-[#bfa094] text-[#bfa094] hover:bg-[#bfa094] hover:text-[#30221e] px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3">
            <Users className="w-6 h-6" /> 2 PLAYER
          </button>
          <button onClick={() => setSound(s => !s)} className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition-all self-center">
            {sound ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        </div>
        
        <div className="text-center text-sm text-[#bfa094]/60">
          <p>Wins: {wins} | Losses: {losses}</p>
        </div>
      </div>
    );
  }

  // Render Game Over
  if (phase === 'GAME_OVER' || winner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#30221e] to-[#5b433b] text-[#fdf8f6] p-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8">
          <h1 className="text-5xl font-bold mb-4">{winner === 1 ? 'PLAYER 1 WINS!' : winner === 2 ? 'PLAYER 2 WINS!' : 'DRAW!'}</h1>
          <p className="text-[#bfa094] text-lg">The herd has been mastered</p>
        </motion.div>
        <div className="flex gap-4">
          <button onClick={() => startGame(mode)} className="bg-[#f27696] hover:bg-[#e94a74] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3">
            <RotateCcw className="w-6 h-6" /> REMATCH
          </button>
          <button onClick={quitToMenu} className="border-2 border-[#bfa094] text-[#bfa094] hover:bg-[#bfa094] hover:text-[#30221e] px-8 py-4 rounded-xl font-bold flex items-center gap-3">
            <Home className="w-6 h-6" /> MENU
          </button>
        </div>
      </div>
    );
  }

  // Render Game
  return (
    <div className="min-h-screen bg-[#eaddd7] flex flex-col">
      {/* Header */}
      <header className="bg-[#5b433b] text-[#fdf8f6] px-6 py-4 flex items-center justify-between">
        <button onClick={quitToMenu} className="text-[#f27696] hover:text-[#f27696]/80 font-bold">← MENU</button>
        <h1 className="text-xl font-bold tracking-wider">MORABARABA</h1>
        <div className="w-16" />
      </header>

      {/* Game Info */}
      <div className="bg-[#846358]/20 px-6 py-4 flex items-center justify-between">
        <div className="text-center">
          <p className="text-xs text-[#5b433b] font-bold">PLAYER 1</p>
          <div className="flex gap-1 mt-1">
            {Array.from({ length: cowsOnBoard[1] }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-[#30221e]" />
            ))}
          </div>
          <p className="text-xs text-[#5b433b] mt-1">To place: {cowsToPlace[1]}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-[#5b433b] font-bold">{gameState.phase}</p>
          <p className="text-xs text-[#f27696] font-bold">Player {currentPlayer}'s turn</p>
          {message && <p className="text-xs text-[#4CAF50] font-bold mt-1">{message}</p>}
        </div>
        <div className="text-center">
          <p className="text-xs text-[#5b433b] font-bold">PLAYER 2</p>
          <div className="flex gap-1 mt-1">
            {Array.from({ length: cowsOnBoard[2] }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-[#fdf8f6] border border-[#5b433b]" />
            ))}
          </div>
          <p className="text-xs text-[#5b433b] mt-1">To place: {cowsToPlace[2]}</p>
        </div>
      </div>

      {/* Board */}
      <main className="flex-1 flex items-center justify-center p-4">
        <svg viewBox="0 0 512 512" className="w-full max-w-[500px] h-auto">
          {/* Outer square */}
          <rect x="100" y="100" width="312" height="312" fill="none" stroke={PALETTE.lines} strokeWidth="8" strokeLinejoin="round" />
          {/* Middle square */}
          <rect x="150" y="150" width="212" height="212" fill="none" stroke={PALETTE.lines} strokeWidth="8" strokeLinejoin="round" />
          {/* Inner square */}
          <rect x="200" y="200" width="112" height="112" fill="none" stroke={PALETTE.lines} strokeWidth="8" strokeLinejoin="round" />
          
          {/* Connecting lines */}
          <line x1="256" y1="100" x2="256" y2="200" stroke={PALETTE.lines} strokeWidth="8" strokeLinecap="round" />
          <line x1="256" y1="312" x2="256" y2="412" stroke={PALETTE.lines} strokeWidth="8" strokeLinecap="round" />
          <line x1="100" y1="256" x2="200" y2="256" stroke={PALETTE.lines} strokeWidth="8" strokeLinecap="round" />
          <line x1="312" y1="256" x2="412" y2="256" stroke={PALETTE.lines} strokeWidth="8" strokeLinecap="round" />
          <line x1="100" y1="100" x2="200" y2="200" stroke={PALETTE.lines} strokeWidth="8" strokeLinecap="round" />
          <line x1="412" y1="100" x2="312" y2="200" stroke={PALETTE.lines} strokeWidth="8" strokeLinecap="round" />
          <line x1="100" y1="412" x2="200" y2="312" stroke={PALETTE.lines} strokeWidth="8" strokeLinecap="round" />
          <line x1="412" y1="412" x2="312" y2="312" stroke={PALETTE.lines} strokeWidth="8" strokeLinecap="round" />
          
          {/* Mill highlights */}
          {lastMillPoints && lastMillPoints.map(point => {
            const { x, y } = POINT_COORDINATES[point];
            return (
              <circle key={`mill-${point}`} cx={x} cy={y} r="40" fill={PALETTE.highlight} opacity="0.3" />
            );
          })}
          
          {/* Points and cows */}
          {POINT_IDS.map(point => {
            const { x, y } = POINT_COORDINATES[point];
            const occupant = board[point];
            const isSelected = selectedPoint === point;
            const isLegalMove = selectedPoint && !occupant && (gameState.phase === 'FLYING' || cowsOnBoard[currentPlayer] === 3 || ADJACENCY_MAP[selectedPoint].includes(point));
            
            return (
              <g key={point} onClick={() => handlePointClick(point)} className="cursor-pointer">
                {/* Legal move indicator */}
                {isLegalMove && <circle cx={x} cy={y} r="20" fill={PALETTE.highlight} opacity="0.5" className="animate-pulse" />}
                
                {/* Point marker */}
                <circle cx={x} cy={y} r="12" fill={isSelected ? PALETTE.selected : PALETTE.lines} />
                
                {/* Cow piece */}
                {occupant && (
                  <motion.circle
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    cx={x}
                    cy={y}
                    r="28"
                    fill={occupant === 1 ? PALETTE.player1 : PALETTE.player2}
                    stroke={PALETTE.lines}
                    strokeWidth="4"
                    className="drop-shadow-lg"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </main>

      {/* Instructions */}
      <div className="bg-[#5b433b]/20 px-6 py-4 text-center">
        <p className="text-sm text-[#5b433b]">
          {gameState.phase === 'PLACING' && 'Place your cow on an empty point'}
          {gameState.phase === 'MOVING' && 'Select a cow, then tap an adjacent empty point'}
          {gameState.phase === 'FLYING' && 'Select a cow, then tap any empty point'}
          {gameState.phase === 'SHOOTING' && 'Tap an opponent\'s cow to remove it'}
        </p>
      </div>
    </div>
  );
}
