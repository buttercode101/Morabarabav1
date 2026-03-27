import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, RotateCcw, Home, Volume2, VolumeX, Trophy, Brain, HelpCircle, Settings, Sparkles, Clock, BookOpen, Info } from 'lucide-react';
import { useAudio, useStatistics, useAchievements, useDailyRewards, useParticles, useHaptics, useGameTimer, useLocalStorage } from './hooks';
import { POINT_COORDINATES, POINT_IDS, ADJACENCY_MAP, MILLS, INITIAL_STATE, PALETTE, STORAGE_KEYS, ACHIEVEMENTS, TUTORIAL_STEPS, BOARD_THEMES, PIECE_THEMES, CULTURAL_INFO, AI_SETTINGS } from './constants';
import { GamePhase, GameMode, Player, PointId, BoardState, Difficulty, Particle, TutorialState, Achievement } from './types';
import { getAIMove, getValidMoves, getHint } from './utils/ai';
import { PremiumButton, GlassCard, Modal, StatCard, AchievementCard, Toggle, Badge } from './components/UIComponents';

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

  // UI States
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [showCulturalInfo, setShowCulturalInfo] = useState(false);

  const { board, currentPlayer, cowsToPlace, cowsOnBoard, winner, lastMillPoints } = gameState;

  // Check daily reward on mount
  useEffect(() => {
    const check = checkDailyReward();
    if (check.available && phase === 'MENU') {
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
        setMessage(`🏆 ${achievement.name}!`);
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

    // Tutorial mode
    if (phase === 'TUTORIAL' && !tutorialState.completed) {
      const currentTutorialStep = TUTORIAL_STEPS[tutorialState.currentStep];
      if (currentTutorialStep && currentTutorialStep.highlightPoints && !currentTutorialStep.highlightPoints.includes(point)) {
        setMessage('👆 Follow the highlighted spots!');
        return;
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
        spawnParticles(coords.x, coords.y, 'glow', 30, ['#4CAF50', '#8BC34A', '#FFD700']);
        audio.mill();
        setMessage('✨ MILL FORMED!');
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
      spawnParticles(coords.x, coords.y, 'spark', 20, ['#f27696', '#FFD700']);

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

        if (canFly && gameState.phase !== 'FLYING') {
          setFlyingThisGame(prev => prev + 1);
          checkAchievement('fly_like_bird', flyingThisGame + 1);
        }

        const win = checkWin({ ...gameState, board: newBoard });

        const coords = POINT_COORDINATES[point];
        spawnParticles(coords.x, coords.y, 'dust', 10);

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
          spawnParticles(coords.x, coords.y, 'glow', 30);
          audio.mill();
          haptic.success();
          setMessage('✨ MILL!');
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
    setPhase('PLAYING');
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
      addCoins(reward.coins);
      setMessage(`🎁 +${reward.coins} Coins!`);
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
      <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="glass-card-premium p-8 max-w-md w-full text-center"
        >
          <div className="text-7xl mb-6 animate-bounce-subtle">🎁</div>
          <h2 className="text-4xl font-black text-gradient-gold mb-4 text-premium">Daily Reward!</h2>
          <p className="text-lg text-white/80 mb-6">Day <span className="text-[#FFD700] font-bold">{check.streak}</span> of your streak!</p>
          <div className="bg-gradient-to-br from-[#FFD700]/20 to-[#DAA520]/10 rounded-2xl p-6 mb-8 border border-[#FFD700]/30">
            <div className="text-5xl font-black text-[#FFD700]">+{check.reward?.coins}</div>
            <div className="text-white/70 font-medium mt-1">Coins</div>
          </div>
          <PremiumButton 
            variant="gold" 
            size="xl" 
            onClick={claimReward}
            className="w-full"
          >
            Claim Reward
          </PremiumButton>
        </motion.div>
      </div>
    );
  }

  // Render Menu
  if (phase === 'MENU') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A0E05] via-[#2A1A0A] to-[#3A2010] text-white relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD700' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        {/* Safe Area Container */}
        <div className="relative z-10 safe-container min-h-screen flex flex-col">
          {/* Header Stats */}
          <motion.header 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-between items-center pt-4 pb-6 px-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2.5 border border-white/20">
                <span className="text-2xl">🪙</span>
                <span className="font-bold text-lg">{coins}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2.5 border border-white/20">
                <span className="text-2xl">🔥</span>
                <span className="font-bold text-lg">{streak.currentStreak}<span className="text-white/60 text-sm ml-1">day streak</span></span>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-3 bg-white/10 backdrop-blur-lg rounded-full hover:bg-white/20 transition-all border border-white/20"
            >
              <Settings className="w-6 h-6" />
            </button>
          </motion.header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            {/* Title */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <h1 className="text-7xl md:text-9xl font-black mb-4 tracking-tighter text-premium">
                <span className="text-gradient-gold">MORABARABA</span>
              </h1>
              <p className="text-xl text-white/70 italic font-medium">"The Game of the Herd"</p>
            </motion.div>

            {/* Main Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-4 w-full max-w-md mb-8"
            >
              <PremiumButton 
                variant="primary" 
                size="xl" 
                icon={Brain}
                onClick={() => startGame('AI')}
                className="w-full"
              >
                VS COMPUTER
              </PremiumButton>
              <PremiumButton 
                variant="secondary" 
                size="xl" 
                icon={Users}
                onClick={() => startGame('HOTSEAT')}
                className="w-full"
              >
                2 PLAYER
              </PremiumButton>
              <PremiumButton 
                variant="earth" 
                size="lg" 
                icon={HelpCircle}
                onClick={startTutorial}
                className="w-full"
              >
                TUTORIAL
              </PremiumButton>
            </motion.div>

            {/* Secondary Actions */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-3 justify-center mb-8 flex-wrap"
            >
              <button
                onClick={() => setShowAchievements(true)}
                className="p-4 bg-white/10 backdrop-blur-lg rounded-full hover:bg-white/20 transition-all border border-white/20 group"
                title="Achievements"
              >
                <Trophy className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => setShowStats(true)}
                className="p-4 bg-white/10 backdrop-blur-lg rounded-full hover:bg-white/20 transition-all border border-white/20 group"
                title="Statistics"
              >
                <Clock className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => setShowCulturalInfo(true)}
                className="p-4 bg-white/10 backdrop-blur-lg rounded-full hover:bg-white/20 transition-all border border-white/20 group"
                title="Cultural Info"
              >
                <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => setSound(s => !s)}
                className="p-4 bg-white/10 backdrop-blur-lg rounded-full hover:bg-white/20 transition-all border border-white/20 group"
              >
                {sound ? <Volume2 className="w-6 h-6 group-hover:scale-110 transition-transform" /> : <VolumeX className="w-6 h-6 group-hover:scale-110 transition-transform" />}
              </button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20">
                <span className="text-white/70">Wins:</span>
                <span className="font-bold text-[#4CAF50]">{stats.wins}</span>
                <span className="text-white/70">|</span>
                <span className="text-white/70">Losses:</span>
                <span className="font-bold text-[#EF4444]">{stats.losses}</span>
                <span className="text-white/70">|</span>
                <span className="text-white/70">Win Rate:</span>
                <span className="font-bold text-[#FFD700]">{stats.winRate.toFixed(1)}%</span>
              </div>
            </motion.div>
          </main>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showSettings && (
            <Modal
              isOpen={showSettings}
              onClose={() => setShowSettings(false)}
              title="Settings"
              icon={Settings}
              size="md"
            >
              <div className="space-y-6">
                <Toggle label="Sound Effects" enabled={sound} onToggle={setSound} />
                <Toggle label="Haptic Feedback" enabled={haptics} onToggle={setHaptics} />
                
                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">Board Theme</label>
                  <select
                    value={boardTheme}
                    onChange={(e) => setBoardTheme(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                  >
                    {Object.entries(BOARD_THEMES).map(([key, theme]) => (
                      <option key={key} value={key} className="bg-[#1A0E05]">{theme.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">Piece Theme</label>
                  <select
                    value={pieceTheme}
                    onChange={(e) => setPieceTheme(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                  >
                    {Object.entries(PIECE_THEMES).map(([key, theme]) => (
                      <option key={key} value={key} className="bg-[#1A0E05]">{theme.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium">AI Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                  >
                    {Object.entries(AI_SETTINGS).map(([key, settings]) => (
                      <option key={key} value={key} className="bg-[#1A0E05]">{settings.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Modal>
          )}

          {showAchievements && (
            <Modal
              isOpen={showAchievements}
              onClose={() => setShowAchievements(false)}
              title="Achievements"
              icon={Trophy}
              size="lg"
            >
              <div className="mb-6">
                <div className="flex justify-between text-sm text-white/70 mb-2">
                  <span>Overall Progress</span>
                  <span>{getUnlockedCount()}/{ACHIEVEMENTS.length}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${getTotalProgress()}%` }}
                    className="bg-gradient-to-r from-[#FFD700] to-[#DAA520] h-4 rounded-full"
                  />
                </div>
                <div className="text-right text-xs text-white/60 mt-1">{getTotalProgress().toFixed(1)}%</div>
              </div>
              <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2">
                {achievements.map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </Modal>
          )}

          {showStats && (
            <Modal
              isOpen={showStats}
              onClose={() => setShowStats(false)}
              title="Statistics"
              icon={Clock}
              size="md"
            >
              <div className="grid grid-cols-2 gap-4">
                <StatCard icon={Play} label="Games Played" value={stats.totalGames} color="pink" />
                <StatCard icon={Trophy} label="Wins" value={stats.wins} color="green" />
                <StatCard label="Losses" value={stats.losses} color="gold" />
                <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} color="gold" />
                <StatCard label="Current Streak" value={stats.currentStreak} color="pink" />
                <StatCard label="Best Streak" value={stats.bestStreak} color="gold" />
                <StatCard label="Mills Formed" value={stats.totalMillsFormed} color="green" />
                <StatCard label="Play Time" value={formatTime(stats.totalPlayTime)} color="gold" />
              </div>
            </Modal>
          )}

          {showCulturalInfo && (
            <Modal
              isOpen={showCulturalInfo}
              onClose={() => setShowCulturalInfo(false)}
              title="About Morabaraba"
              icon={BookOpen}
              size="lg"
            >
              <div className="space-y-6 text-white/80">
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">History</h3>
                  <p className="leading-relaxed">{CULTURAL_INFO.history}</p>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">Cultural Significance</h3>
                  <p className="leading-relaxed">{CULTURAL_INFO.culturalSignificance}</p>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">Traditional Rules</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {CULTURAL_INFO.traditionalRules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">Proverbs</h3>
                  <ul className="list-disc list-inside space-y-1 italic">
                    {CULTURAL_INFO.proverbs.map((proverb, i) => (
                      <li key={i}>{proverb}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Render Game Over
  if (phase === 'GAME_OVER' || winner) {
    stopTimer();
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A0E05] via-[#2A1A0A] to-[#3A2010] text-white p-6 text-center safe-container">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-20 mb-8"
        >
          <div className="text-8xl mb-6 animate-bounce-subtle">
            {winner === 1 ? '🏆' : winner === 2 ? '😔' : '🤝'}
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-4 text-premium">
            <span className={winner === 1 ? 'text-gradient-gold' : winner === 2 ? 'text-white' : 'text-white'}>
              {winner === 1 ? 'VICTORY!' : winner === 2 ? 'DEFEAT' : 'DRAW!'}
            </span>
          </h1>
          <div className="flex justify-center gap-6 text-lg text-white/70 mb-4">
            <span>Game Time: <span className="text-[#FFD700] font-bold">{formatTime(elapsed)}</span></span>
            <span>Mills: <span className="text-[#FFD700] font-bold">{millsThisGame}</span></span>
          </div>
        </motion.div>
        <div className="flex gap-4 justify-center flex-wrap">
          <PremiumButton 
            variant="primary" 
            size="xl" 
            icon={RotateCcw}
            onClick={() => startGame(mode)}
          >
            REMATCH
          </PremiumButton>
          <PremiumButton 
            variant="secondary" 
            size="xl" 
            icon={Home}
            onClick={quitToMenu}
          >
            MENU
          </PremiumButton>
        </div>
      </div>
    );
  }

  // Render Game
  return (
    <div className="min-h-screen flex flex-col safe-container" style={{ background: currentTheme.background }}>
      {/* Header */}
      <header className="bg-[#5b433b]/90 backdrop-blur-lg text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
        <button onClick={quitToMenu} className="text-[#f27696] hover:text-[#f27696]/80 font-bold flex items-center gap-2 transition-all">
          <Home className="w-5 h-5" /> <span className="hidden sm:inline">MENU</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20">
            <span className="text-xl">🪙</span>
            <span className="font-bold">{coins}</span>
          </div>
          <button 
            onClick={() => setShowHint(!showHint)}
            className={`p-2 rounded-full transition-all border ${showHint ? 'bg-[#FFD700] border-[#FFD700]' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
            title="Show hint"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Game Info */}
      <div className="bg-[#846358]/20 backdrop-blur-lg px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="text-center">
          <p className="text-xs text-white font-bold">PLAYER 1</p>
          <div className="flex gap-1 mt-1">
            {Array.from({ length: cowsOnBoard[1] }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full" style={{ background: currentPieces.player1 }} />
            ))}
          </div>
          <p className="text-xs text-white/70 mt-1">To place: {cowsToPlace[1]}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-white font-bold">{mode === 'AI' ? `VS ${AI_SETTINGS[difficulty].name}` : '2 PLAYER'}</p>
          <p className="text-xs text-[#f27696] font-bold">Player {currentPlayer}'s turn</p>
          {message && <p className="text-xs text-[#4CAF50] font-bold mt-1 animate-pulse">{message}</p>}
          <div className="text-xs text-white/60 mt-1">{formatTime(elapsed)}</div>
        </div>
        <div className="text-center">
          <p className="text-xs text-white font-bold">PLAYER 2</p>
          <div className="flex gap-1 mt-1">
            {Array.from({ length: cowsOnBoard[2] }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full" style={{ background: currentPieces.player2 }} />
            ))}
          </div>
          <p className="text-xs text-white/70 mt-1">To place: {cowsToPlace[2]}</p>
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

          {/* Points and cows */}
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
      <div className="bg-[#5b433b]/90 backdrop-blur-lg px-6 py-4 text-center border-t border-white/10">
        <p className="text-sm text-white">
          {gameState.phase === 'PLACING' && '📍 Place your cow on an empty point'}
          {gameState.phase === 'MOVING' && '👆 Select a cow, then tap an adjacent empty point'}
          {gameState.phase === 'FLYING' && '🦅 Flying! Select a cow, then tap any empty point'}
          {gameState.phase === 'SHOOTING' && '🎯 Tap an opponent\'s cow to remove it'}
        </p>
      </div>
    </div>
  );
}
