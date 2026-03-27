import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, RotateCcw, Home, Volume2, VolumeX, Trophy, Brain, HelpCircle, Settings, Sparkles, Clock } from 'lucide-react';
import { useAudio, useStatistics, useAchievements, useDailyRewards, useParticles, useHaptics, useGameTimer, useLocalStorage } from './hooks';
import { POINT_COORDINATES, POINT_IDS, ADJACENCY_MAP, MILLS, INITIAL_STATE, PALETTE, STORAGE_KEYS, ACHIEVEMENTS, TUTORIAL_STEPS, BOARD_THEMES, PIECE_THEMES, CULTURAL_INFO, AI_SETTINGS } from './constants';
import { GamePhase, GameMode, Player, PointId, BoardState, Difficulty, Particle, TutorialState, Achievement } from './types';
import { getAIMove, getValidMoves, getHint } from './utils/ai';

export default function App() {
  // Game State
  const [phase, setPhase] = useState<GamePhase>('MENU');
  const [mode, setMode] = useState<GameMode>('SINGLE');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [sound, setSound] = useLocalStorage<boolean>(STORAGE_KEYS.SETTINGS, true);
  const [music, setMusic] = useLocalStorage<boolean>(STORAGE_KEYS.SETTINGS + '_music', true);
  const [haptics, setHaptics] = useLocalStorage<boolean>(STORAGE_KEYS.SETTINGS + '_haptics', true);
  const [boardTheme, setBoardTheme] = useLocalStorage<string>(STORAGE_KEYS.SETTINGS + '_board', 'classic');
  const [pieceTheme, setPieceTheme] = useLocalStorage<string>(STORAGE_KEYS.SETTINGS + '_piece', 'classic');
  
  const audio = useAudio(sound, music);
  const haptic = useHaptics(haptics);
  const { stats, recordGame } = useStatistics();
  const { achievements, checkAchievement, unlockAchievement, getUnlockedCount, getTotalProgress, unlockedThisSession } = useAchievements();
  const { streak, coins, claimDailyReward, checkDailyReward, addCoins } = useDailyRewards();
  const { particles, spawnParticles, updateParticles } = useParticles();
  const { elapsed, start: startTimer, stop: stopTimer, reset: resetTimer, formatTime } = useGameTimer();

  const [gameState, setGameState] = useState(INITIAL_STATE);
  const [selectedPoint, setSelectedPoint] = useState<PointId | null>(null);
  const [message, setMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintPoint, setHintPoint] = useState<PointId | null>(null);
  const [millsThisGame, setCowsRemovedThisGame] = useState(0);
  const [flyingThisGame, setFlyingThisGame] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  // Tutorial State
  const [tutorialState, setTutorialState] = useLocalStorage<TutorialState>(STORAGE_KEYS.TUTORIAL, {
    currentStep: 0,
    completed: false,
    skipped: false,
  });

  // Settings Panel
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);

  const { board, currentPlayer, cowsToPlace, cowsOnBoard, winner, lastMillPoints } = gameState;

  // Check daily reward on mount
  useEffect(() => {
    const check = checkDailyReward();
    if (check.available) {
      setShowDailyReward(true);
    }
  }, []);

  // Update particles
  useEffect(() => {
    const interval = setInterval(() => {
      updateParticles(0.016);
    }, 16);
    return () => clearInterval(interval);
  }, [updateParticles]);

  // Show achievement notifications
  useEffect(() => {
    if (unlockedThisSession.length > 0) {
      const lastUnlocked = unlockedThisSession[unlockedThisSession.length - 1];
      const achievement = achievements.find(a => a.id === lastUnlocked);
      if (achievement) {
        setMessage(`🏆 Achievement: ${achievement.name}!`);
        audio.achievement();
        haptic.success();
        setTimeout(() => setMessage(''), 3000);
      }
    }
  }, [unlockedThisSession, achievements, audio, haptic]);

  // AI Move Effect
  useEffect(() => {
    if (mode === 'AI' && currentPlayer === 2 && phase !== 'GAME_OVER' && phase !== 'MENU') {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(gameState, 2, difficulty);
        if (aiMove) {
          handlePointClick(aiMove.point);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, mode, phase, gameState, difficulty]);

  // Hint calculation
  useEffect(() => {
    if (showHint && phase !== 'GAME_OVER' && phase !== 'MENU') {
      const hint = getHint(gameState, currentPlayer);
      setHintPoint(hint);
    } else {
      setHintPoint(null);
    }
  }, [showHint, gameState, currentPlayer, phase]);

  // Check mill
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

    const hasLegalMove = POINT_IDS.some(point => {
      if (state.board[point] !== state.currentPlayer) return false;
      if (state.cowsOnBoard[state.currentPlayer] === 3) return true;
      return ADJACENCY_MAP[point].some(adj => state.board[adj] === null);
    });

    if (!hasLegalMove) return state.currentPlayer === 1 ? 2 : 1;
    return null;
  }, []);

  // Handle point click
  const handlePointClick = useCallback((point: PointId) => {
    if (winner) return;

    const occupant = board[point];

    // Tutorial mode - guide player
    if (phase === 'TUTORIAL' && !tutorialState.completed) {
      const currentTutorialStep = TUTORIAL_STEPS[tutorialState.currentStep];
      if (currentTutorialStep) {
        if (currentTutorialStep.highlightPoints && !currentTutorialStep.highlightPoints.includes(point)) {
          setMessage('Follow the highlighted spots!');
          return;
        }
      }
    }

    // PLACING PHASE
    if (gameState.phase === 'PLACING') {
      if (occupant !== null) return;
      if (cowsToPlace[currentPlayer] <= 0) return;

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

      const coords = POINT_COORDINATES[point];
      spawnParticles(coords.x, coords.y, 'dust', 8);
      audio.place();
      haptic.light();
      
      if (mill) {
        spawnParticles(coords.x, coords.y, 'glow', 20, ['#4CAF50', '#8BC34A', '#FFD700']);
        audio.mill();
        setMessage(`Player ${currentPlayer} formed a mill!`);
        haptic.success();
        checkAchievement('perfect_mill', millsThisGame + 1);
        setCowsRemovedThisGame(prev => prev + 1);
        setTimeout(() => setMessage(''), 2000);
      }

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
      if (occupant !== opponent) return;
      if (checkMill(board, point, opponent)) return;

      const newBoard = { ...board, [point]: null };
      const newCowsLost = { ...gameState.cowsLost, [opponent]: gameState.cowsLost[opponent] + 1 };
      const newCowsOnBoard = { ...gameState.cowsOnBoard, [opponent]: gameState.cowsOnBoard[opponent] - 1 };

      const win = checkWin({ ...gameState, board: newBoard, cowsOnBoard: newCowsOnBoard });

      const coords = POINT_COORDINATES[point];
      spawnParticles(coords.x, coords.y, 'spark', 15, ['#f27696', '#FFD700']);

      if (win) {
        setGameState(prev => ({ ...prev, board: newBoard, cowsLost: newCowsLost, cowsOnBoard: newCowsOnBoard, winner: win }));
        audio.win();
        haptic.success();
        if (win === 1) {
          addCoins(100);
          checkAchievement('first_blood', stats.wins + 1);
        }
        setPhase('GAME_OVER');
        recordGame('win', millsThisGame, cowsOnBoard[opponent], cowsOnBoard[currentPlayer], elapsed, mode === 'AI');
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
        audio.shoot();
        haptic.medium();
      }
      return;
    }

    // MOVING/FLYING PHASE
    if (gameState.phase === 'MOVING' || gameState.phase === 'FLYING') {
      if (occupant === currentPlayer) {
        setSelectedPoint(point);
        audio.click();
        haptic.light();
        return;
      }

      if (occupant === null && selectedPoint) {
        const canFly = gameState.phase === 'FLYING' || cowsOnBoard[currentPlayer] === 3;
        const isAdjacent = canFly || ADJACENCY_MAP[selectedPoint].includes(point);

        if (!isAdjacent) return;

        const newBoard = { ...board, [selectedPoint]: null, [point]: currentPlayer };
        const mill = checkMill(newBoard, point, currentPlayer);

        if (canFly && !gameState.phase === 'FLYING') {
          setFlyingThisGame(prev => prev + 1);
          checkAchievement('fly_like_bird', flyingThisGame + 1);
        }

        const win = checkWin({ ...gameState, board: newBoard });

        const coords = POINT_COORDINATES[point];
        spawnParticles(coords.x, coords.y, 'dust', 6);

        if (win) {
          setGameState(prev => ({ ...prev, board: newBoard, winner: win }));
          audio.win();
          haptic.success();
          addCoins(100);
          setPhase('GAME_OVER');
          recordGame('win', millsThisGame, cowsOnBoard[3 - currentPlayer], cowsOnBoard[currentPlayer], elapsed, mode === 'AI');
        } else if (mill) {
          setGameState(prev => ({
            ...prev,
            board: newBoard,
            phase: 'SHOOTING',
            lastMillPoints: mill,
          }));
          spawnParticles(coords.x, coords.y, 'glow', 20);
          audio.mill();
          haptic.success();
          setMessage(`Player ${currentPlayer} formed a mill!`);
          checkAchievement('perfect_mill', millsThisGame + 1);
          setCowsRemovedThisGame(prev => prev + 1);
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
  }, [board, currentPlayer, cowsToPlace, cowsOnBoard, gameState, winner, checkMill, checkWin, audio, haptic, spawnParticles, addCoins, checkAchievement, recordGame, elapsed, mode, stats.wins, millsThisGame, flyingThisGame, phase, tutorialState]);

  const startGame = (selectedMode: GameMode) => {
    audio.click();
    haptic.light();
    setMode(selectedMode);
    setGameState(INITIAL_STATE);
    setSelectedPoint(null);
    setPhase(selectedMode === 'AI' ? 'PLAYING' : 'PLAYING');
    setMessage('');
    setCowsRemovedThisGame(0);
    setFlyingThisGame(0);
    setStartTime(Date.now());
    startTimer();
  };

  const startTutorial = () => {
    audio.click();
    haptic.light();
    setTutorialState({ currentStep: 0, completed: false, skipped: false });
    setGameState(INITIAL_STATE);
    setPhase('TUTORIAL');
    setMessage(TUTORIAL_STEPS[0].description);
  };

  const quitToMenu = () => {
    audio.click();
    haptic.light();
    stopTimer();
    resetTimer();
    setPhase('MENU');
    setGameState(INITIAL_STATE);
    setSelectedPoint(null);
    setShowHint(false);
  };

  const claimReward = () => {
    const reward = claimDailyReward();
    if (reward) {
      setMessage(`🎁 Claimed ${reward.coins} coins!`);
      audio.achievement();
      haptic.success();
      setTimeout(() => setMessage(''), 2000);
    }
    setShowDailyReward(false);
  };

  const currentTheme = BOARD_THEMES[boardTheme as keyof typeof BOARD_THEMES] || BOARD_THEMES.classic;
  const currentPieces = PIECE_THEMES[pieceTheme as keyof typeof PIECE_THEMES] || PIECE_THEMES.classic;

  // Render Daily Reward Modal
  if (showDailyReward) {
    const check = checkDailyReward();
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-b from-[#30221e] to-[#5b433b] rounded-2xl p-8 max-w-md w-full text-center border-2 border-[#f27696]"
        >
          <div className="text-6xl mb-4">🎁</div>
          <h2 className="text-3xl font-bold text-white mb-2">Daily Reward!</h2>
          <p className="text-[#bfa094] mb-6">Day {check.streak} of your streak!</p>
          <div className="bg-white/10 rounded-xl p-4 mb-6">
            <div className="text-4xl font-bold text-[#f27696]">+{check.reward?.coins} Coins</div>
          </div>
          <button 
            onClick={claimReward}
            className="w-full bg-[#f27696] hover:bg-[#e94a74] text-white px-8 py-4 rounded-xl font-bold text-xl transition-all hover:scale-105"
          >
            Claim Reward
          </button>
        </motion.div>
      </div>
    );
  }

  // Render Menu
  if (phase === 'MENU') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#30221e] to-[#5b433b] text-[#fdf8f6] p-6 relative">
        {/* Header Stats */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 rounded-full px-4 py-2 flex items-center gap-2">
              <span className="text-xl">🪙</span>
              <span className="font-bold">{coins}</span>
            </div>
            <div className="bg-white/10 rounded-full px-4 py-2 flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span className="font-bold">{streak.currentStreak} day streak</span>
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-12 mt-8"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-4 tracking-tighter">MORABARABA</h1>
          <p className="text-[#bfa094] text-lg italic">"The Game of the Herd"</p>
        </motion.div>

        <div className="flex flex-col gap-4 w-full max-w-md mb-8">
          <button 
            onClick={() => startGame('AI')} 
            className="bg-[#f27696] hover:bg-[#e94a74] text-white px-8 py-4 rounded-xl font-bold text-xl transition-all hover:scale-105 flex items-center justify-center gap-3"
          >
            <Brain className="w-6 h-6" /> VS COMPUTER
          </button>
          <button 
            onClick={() => startGame('HOTSEAT')} 
            className="border-2 border-[#bfa094] text-[#bfa094] hover:bg-[#bfa094] hover:text-[#30221e] px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3"
          >
            <Users className="w-6 h-6" /> 2 PLAYER
          </button>
          <button 
            onClick={startTutorial}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3"
          >
            <HelpCircle className="w-6 h-6" /> TUTORIAL
          </button>
        </div>

        <div className="flex gap-4 justify-center mb-8">
          <button 
            onClick={() => setShowAchievements(true)}
            className="bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all"
            title="Achievements"
          >
            <Trophy className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setShowStats(true)}
            className="bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all"
            title="Statistics"
          >
            <Clock className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setSound(s => !s)} 
            className="bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all"
          >
            {sound ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        </div>

        <div className="text-center text-sm text-[#bfa094]/60">
          <p>Wins: {stats.wins} | Losses: {stats.losses} | Win Rate: {stats.winRate.toFixed(1)}%</p>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-b from-[#30221e] to-[#5b433b] rounded-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#fdf8f6]">Sound Effects</span>
                  <button 
                    onClick={() => setSound(!sound)}
                    className={`w-14 h-8 rounded-full transition-all ${sound ? 'bg-[#f27696]' : 'bg-white/20'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-all ${sound ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[#fdf8f6]">Haptics</span>
                  <button 
                    onClick={() => setHaptics(!haptics)}
                    className={`w-14 h-8 rounded-full transition-all ${haptics ? 'bg-[#f27696]' : 'bg-white/20'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-all ${haptics ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#fdf8f6]">Board Theme</span>
                  <select 
                    value={boardTheme}
                    onChange={(e) => setBoardTheme(e.target.value)}
                    className="bg-white/10 rounded-lg px-4 py-2 text-white"
                  >
                    {Object.entries(BOARD_THEMES).map(([key, theme]) => (
                      <option key={key} value={key} className="bg-[#30221e]">{theme.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#fdf8f6]">Piece Theme</span>
                  <select 
                    value={pieceTheme}
                    onChange={(e) => setPieceTheme(e.target.value)}
                    className="bg-white/10 rounded-lg px-4 py-2 text-white"
                  >
                    {Object.entries(PIECE_THEMES).map(([key, theme]) => (
                      <option key={key} value={key} className="bg-[#30221e]">{theme.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#fdf8f6]">AI Difficulty</span>
                  <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="bg-white/10 rounded-lg px-4 py-2 text-white"
                  >
                    {Object.entries(AI_SETTINGS).map(([key, settings]) => (
                      <option key={key} value={key} className="bg-[#30221e]">{settings.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full mt-8 bg-[#f27696] hover:bg-[#e94a74] text-white px-8 py-4 rounded-xl font-bold transition-all"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}

        {/* Achievements Modal */}
        {showAchievements && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-b from-[#30221e] to-[#5b433b] rounded-2xl p-8 max-w-2xl w-full my-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Achievements ({getUnlockedCount()}/{ACHIEVEMENTS.length})
              </h2>
              <div className="mb-6 bg-white/10 rounded-lg p-3">
                <div className="text-sm text-[#bfa094]">Overall Progress</div>
                <div className="w-full bg-white/20 rounded-full h-4 mt-2">
                  <div 
                    className="bg-[#f27696] h-4 rounded-full transition-all"
                    style={{ width: `${getTotalProgress()}%` }}
                  />
                </div>
                <div className="text-right text-xs text-[#bfa094] mt-1">{getTotalProgress().toFixed(1)}%</div>
              </div>
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {achievements.map(achievement => (
                  <div 
                    key={achievement.id}
                    className={`p-4 rounded-xl border-2 transition-all ${achievement.unlocked ? 'border-[#f27696] bg-[#f27696]/20' : 'border-white/20 bg-white/5 opacity-60'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-white">{achievement.name}</div>
                        <div className="text-sm text-[#bfa094]">{achievement.description}</div>
                        {!achievement.unlocked && (
                          <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                            <div 
                              className="bg-[#f27696] h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(100, (achievement.progress / achievement.requirement) * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                      {achievement.unlocked && <span className="text-2xl">✅</span>}
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowAchievements(false)}
                className="w-full mt-6 bg-[#f27696] hover:bg-[#e94a74] text-white px-8 py-4 rounded-xl font-bold transition-all"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}

        {/* Statistics Modal */}
        {showStats && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-b from-[#30221e] to-[#5b433b] rounded-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#f27696]">{stats.totalGames}</div>
                  <div className="text-sm text-[#bfa094]">Games Played</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#4CAF50]">{stats.wins}</div>
                  <div className="text-sm text-[#bfa094]">Wins</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#E53935]">{stats.losses}</div>
                  <div className="text-sm text-[#bfa094]">Losses</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#FFD700]">{stats.winRate.toFixed(1)}%</div>
                  <div className="text-sm text-[#bfa094]">Win Rate</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#f27696]">{stats.currentStreak}</div>
                  <div className="text-sm text-[#bfa094]">Current Streak</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#f27696]">{stats.bestStreak}</div>
                  <div className="text-sm text-[#bfa094]">Best Streak</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#4CAF50]">{stats.totalMillsFormed}</div>
                  <div className="text-sm text-[#bfa094]">Mills Formed</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#FFD700]">{formatTime(stats.totalPlayTime)}</div>
                  <div className="text-sm text-[#bfa094]">Play Time</div>
                </div>
              </div>
              <button 
                onClick={() => setShowStats(false)}
                className="w-full mt-6 bg-[#f27696] hover:bg-[#e94a74] text-white px-8 py-4 rounded-xl font-bold transition-all"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // Render Game Over
  if (phase === 'GAME_OVER' || winner) {
    stopTimer();
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#30221e] to-[#5b433b] text-[#fdf8f6] p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="mb-8 mt-20"
        >
          <div className="text-6xl mb-4">{winner === 1 ? '🏆' : winner === 2 ? '😔' : '🤝'}</div>
          <h1 className="text-5xl font-bold mb-4">{winner === 1 ? 'VICTORY!' : winner === 2 ? 'DEFEAT' : 'DRAW!'}</h1>
          <p className="text-[#bfa094] text-lg mb-4">Game Time: {formatTime(elapsed)}</p>
          <p className="text-[#bfa094] text-lg">Mills Formed: {millsThisGame}</p>
        </motion.div>
        <div className="flex gap-4 justify-center flex-wrap">
          <button 
            onClick={() => startGame(mode)} 
            className="bg-[#f27696] hover:bg-[#e94a74] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3"
          >
            <RotateCcw className="w-6 h-6" /> REMATCH
          </button>
          <button 
            onClick={quitToMenu} 
            className="border-2 border-[#bfa094] text-[#bfa094] hover:bg-[#bfa094] hover:text-[#30221e] px-8 py-4 rounded-xl font-bold flex items-center gap-3"
          >
            <Home className="w-6 h-6" /> MENU
          </button>
        </div>
      </div>
    );
  }

  // Render Game
  return (
    <div className="min-h-screen flex flex-col" style={{ background: currentTheme.background }}>
      {/* Header */}
      <header className="bg-[#5b433b]/90 text-[#fdf8f6] px-6 py-4 flex items-center justify-between backdrop-blur-sm">
        <button onClick={quitToMenu} className="text-[#f27696] hover:text-[#f27696]/80 font-bold flex items-center gap-2">
          <Home className="w-5 h-5" /> MENU
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
            <span className="text-xl">🪙</span>
            <span className="font-bold">{coins}</span>
          </div>
          <button 
            onClick={() => setShowHint(!showHint)}
            className={`p-2 rounded-full transition-all ${showHint ? 'bg-[#f27696]' : 'bg-white/10 hover:bg-white/20'}`}
            title="Show hint"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Game Info */}
      <div className="bg-[#846358]/20 px-6 py-4 flex items-center justify-between backdrop-blur-sm">
        <div className="text-center">
          <p className="text-xs text-[#fdf8f6] font-bold">PLAYER 1</p>
          <div className="flex gap-1 mt-1">
            {Array.from({ length: cowsOnBoard[1] }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full" style={{ background: currentPieces.player1 }} />
            ))}
          </div>
          <p className="text-xs text-[#fdf8f6]/80 mt-1">To place: {cowsToPlace[1]}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-[#fdf8f6] font-bold">{mode === 'AI' ? `VS ${AI_SETTINGS[difficulty].name}` : '2 PLAYER'}</p>
          <p className="text-xs text-[#f27696] font-bold">Player {currentPlayer}'s turn</p>
          {message && <p className="text-xs text-[#4CAF50] font-bold mt-1 animate-pulse">{message}</p>}
          <div className="text-xs text-[#fdf8f6]/60 mt-1">{formatTime(elapsed)}</div>
        </div>
        <div className="text-center">
          <p className="text-xs text-[#fdf8f6] font-bold">PLAYER 2</p>
          <div className="flex gap-1 mt-1">
            {Array.from({ length: cowsOnBoard[2] }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full" style={{ background: currentPieces.player2 }} />
            ))}
          </div>
          <p className="text-xs text-[#fdf8f6]/80 mt-1">To place: {cowsToPlace[2]}</p>
        </div>
      </div>

      {/* Board */}
      <main className="flex-1 flex items-center justify-center p-4 relative">
        <svg viewBox="0 0 512 512" className="w-full max-w-[500px] h-auto">
          {/* Board background */}
          <rect x="80" y="80" width="352" height="352" fill={currentTheme.board} rx="10" />
          
          {/* Outer square */}
          <rect x="100" y="100" width="312" height="312" fill="none" stroke={currentTheme.lines} strokeWidth="8" strokeLinejoin="round" />
          {/* Middle square */}
          <rect x="150" y="150" width="212" height="212" fill="none" stroke={currentTheme.lines} strokeWidth="8" strokeLinejoin="round" />
          {/* Inner square */}
          <rect x="200" y="200" width="112" height="112" fill="none" stroke={currentTheme.lines} strokeWidth="8" strokeLinejoin="round" />

          {/* Connecting lines */}
          <line x1="256" y1="100" x2="256" y2="200" stroke={currentTheme.lines} strokeWidth="8" strokeLinecap="round" />
          <line x1="256" y1="312" x2="256" y2="412" stroke={currentTheme.lines} strokeWidth="8" strokeLinecap="round" />
          <line x1="100" y1="256" x2="200" y2="256" stroke={currentTheme.lines} strokeWidth="8" strokeLinecap="round" />
          <line x1="312" y1="256" x2="412" y2="256" stroke={currentTheme.lines} strokeWidth="8" strokeLinecap="round" />
          <line x1="100" y1="100" x2="200" y2="200" stroke={currentTheme.lines} strokeWidth="8" strokeLinecap="round" />
          <line x1="412" y1="100" x2="312" y2="200" stroke={currentTheme.lines} strokeWidth="8" strokeLinecap="round" />
          <line x1="100" y1="412" x2="200" y2="312" stroke={currentTheme.lines} strokeWidth="8" strokeLinecap="round" />
          <line x1="412" y1="412" x2="312" y2="312" stroke={currentTheme.lines} strokeWidth="8" strokeLinecap="round" />

          {/* Mill highlights */}
          {lastMillPoints && lastMillPoints.map(point => {
            const { x, y } = POINT_COORDINATES[point];
            return (
              <circle key={`mill-${point}`} cx={x} cy={y} r="40" fill={PALETTE.highlight} opacity="0.3" />
            );
          })}

          {/* Hint indicator */}
          {hintPoint && (
            <circle 
              cx={POINT_COORDINATES[hintPoint].x} 
              cy={POINT_COORDINATES[hintPoint].y} 
              r="35" 
              fill="#FFD700" 
              opacity="0.5"
              className="animate-pulse"
            />
          )}

          {/* Legal move indicators */}
          {POINT_IDS.map(point => {
            const { x, y } = POINT_COORDINATES[point];
            const occupant = board[point];
            const isSelected = selectedPoint === point;
            const canFly = gameState.phase === 'FLYING' || cowsOnBoard[currentPlayer] === 3;
            const isLegalMove = selectedPoint && !occupant && (canFly || ADJACENCY_MAP[selectedPoint].includes(point));

            return (
              <g key={point} onClick={() => handlePointClick(point)} className="cursor-pointer">
                {isLegalMove && (
                  <circle cx={x} cy={y} r="25" fill={PALETTE.legal} className="animate-pulse" />
                )}
                <circle cx={x} cy={y} r="12" fill={isSelected ? PALETTE.selected : currentTheme.lines} />
                {occupant && (
                  <motion.circle
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    cx={x}
                    cy={y}
                    r="28"
                    fill={occupant === 1 ? currentPieces.player1 : currentPieces.player2}
                    stroke={currentTheme.lines}
                    strokeWidth="4"
                    className="drop-shadow-lg"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${(p.x / 512) * 100}%`,
              top: `${(p.y / 512) * 100}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              opacity: p.life / p.maxLife,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </main>

      {/* Instructions */}
      <div className="bg-[#5b433b]/90 px-6 py-4 text-center backdrop-blur-sm">
        <p className="text-sm text-[#fdf8f6]">
          {gameState.phase === 'PLACING' && '📍 Place your cow on an empty point'}
          {gameState.phase === 'MOVING' && '👆 Select a cow, then tap an adjacent empty point'}
          {gameState.phase === 'FLYING' && '🦅 Flying! Select a cow, then tap any empty point'}
          {gameState.phase === 'SHOOTING' && '🎯 Tap an opponent\'s cow to remove it'}
        </p>
      </div>
    </div>
  );
}
