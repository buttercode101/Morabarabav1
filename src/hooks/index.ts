import { useState, useEffect, useCallback, useRef } from 'react';
import { STORAGE_KEYS, ACHIEVEMENTS, DAILY_REWARDS } from '../constants';
import { Achievement, StreakData, DailyReward, Particle, GameStats } from '../types';

// Audio Context Type
interface AudioContextExtended extends AudioContext {
  suspended?: boolean;
}

// Audio Hook - Enhanced with music support
export function useAudio(enabled: boolean, musicEnabled: boolean = true) {
  const ctxRef = useRef<AudioContextExtended | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const currentMusicRef = useRef<string>('');

  const init = useCallback(() => {
    if (!ctxRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        ctxRef.current = new AudioCtx();
      } catch (e) {
        console.warn('WebAudio not supported');
      }
    }
  }, []);

  const resume = useCallback(() => {
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume();
    }
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, volMult = 1, slideFreq?: number) => {
    if (!enabled) return;
    init();
    const ctx = ctxRef.current;
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slideFreq) {
        osc.frequency.exponentialRampToValueAtTime(slideFreq, ctx.currentTime + duration);
      }
      gain.gain.setValueAtTime(0.1 * volMult, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio errors
    }
  }, [enabled, init]);

  const playNoise = useCallback((duration: number, volMult = 1) => {
    if (!enabled) return;
    init();
    const ctx = ctxRef.current;
    if (!ctx) return;

    try {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2 * volMult, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {
      // Ignore audio errors
    }
  }, [enabled, init]);

  // Music control
  const playMusic = useCallback((trackId: string) => {
    if (!musicEnabled || !enabled) return;
    if (currentMusicRef.current === trackId) return;
    
    // Stop current music
    if (musicRef.current) {
      musicRef.current.fadeOut?.();
      musicRef.current = null;
    }
    
    // In production, you would load actual music files
    // For now, we'll use a placeholder that would be replaced with real audio
    currentMusicRef.current = trackId;
  }, [enabled, musicEnabled]);

  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current = null;
    }
    currentMusicRef.current = '';
  }, []);

  return {
    resume,
    // SFX
    click: () => playTone(600, 'sine', 0.05, 0.3),
    place: () => { playTone(400, 'triangle', 0.1, 0.5); playNoise(0.05, 0.3); },
    move: () => { playTone(500, 'sine', 0.08, 0.4); playNoise(0.03, 0.2); },
    mill: () => {
      playTone(600, 'sine', 0.15, 0.6);
      setTimeout(() => playTone(800, 'sine', 0.15, 0.6), 150);
      setTimeout(() => playTone(1000, 'sine', 0.2, 0.6), 300);
    },
    shoot: () => {
      playTone(300, 'sawtooth', 0.2, 0.4);
      playNoise(0.15, 0.4);
    },
    win: () => {
      playTone(400, 'sine', 0.2, 0.6);
      setTimeout(() => playTone(600, 'sine', 0.2, 0.6), 200);
      setTimeout(() => playTone(800, 'sine', 0.3, 0.6), 400);
      setTimeout(() => playTone(1000, 'sine', 0.4, 0.6), 600);
    },
    lose: () => {
      playTone(400, 'sine', 0.3, 0.4);
      setTimeout(() => playTone(350, 'sine', 0.3, 0.4), 300);
      setTimeout(() => playTone(300, 'sine', 0.4, 0.4), 600);
    },
    achievement: () => {
      playTone(523, 'sine', 0.1, 0.5);
      setTimeout(() => playTone(659, 'sine', 0.1, 0.5), 100);
      setTimeout(() => playTone(784, 'sine', 0.2, 0.5), 200);
      setTimeout(() => playTone(1047, 'sine', 0.3, 0.5), 300);
    },
    // Music
    playMusic,
    stopMusic,
  };
}

// Local Storage Hook with error handling
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// Statistics Hook
export function useStatistics() {
  const [stats, setStats] = useLocalStorage<GameStats>(STORAGE_KEYS.STATS, {
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalMillsFormed: 0,
    totalCowsRemoved: 0,
    totalCowsLost: 0,
    gamesVsAI: 0,
    winsVsAI: 0,
    bestGameTime: 0,
    totalPlayTime: 0,
    favoriteOpening: '',
    winRateByDifficulty: {},
  });

  const recordGame = useCallback((result: 'win' | 'loss' | 'draw', millsFormed: number, cowsRemoved: number, cowsLost: number, gameTime: number, vsAI: boolean = false) => {
    setStats(prev => {
      const newStats = { ...prev };
      newStats.totalGames += 1;
      newStats.totalMillsFormed += millsFormed;
      newStats.totalCowsRemoved += cowsRemoved;
      newStats.totalCowsLost += cowsLost;
      newStats.totalPlayTime += gameTime;
      
      if (result === 'win') {
        newStats.wins += 1;
        newStats.currentStreak += 1;
        newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
        if (vsAI) newStats.winsVsAI += 1;
      } else if (result === 'loss') {
        newStats.losses += 1;
        newStats.currentStreak = 0;
      } else {
        newStats.draws += 1;
      }
      
      if (vsAI) newStats.gamesVsAI += 1;
      newStats.winRate = (newStats.wins / newStats.totalGames) * 100;
      
      if (gameTime > 0 && (newStats.bestGameTime === 0 || gameTime < newStats.bestGameTime)) {
        newStats.bestGameTime = gameTime;
      }
      
      return newStats;
    });
  }, [setStats]);

  const resetStats = useCallback(() => {
    setStats({
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalMillsFormed: 0,
      totalCowsRemoved: 0,
      totalCowsLost: 0,
      gamesVsAI: 0,
      winsVsAI: 0,
      bestGameTime: 0,
      totalPlayTime: 0,
      favoriteOpening: '',
      winRateByDifficulty: {},
    });
  }, [setStats]);

  return { stats, recordGame, resetStats };
}

// Achievement System Hook
export function useAchievements() {
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, ACHIEVEMENTS);
  const [unlockedThisSession, setUnlockedThisSession] = useState<string[]>([]);

  const checkAchievement = useCallback((id: string, progress: number) => {
    let unlocked = false;
    setAchievements(prev => prev.map(ach => {
      if (ach.id === id && !ach.unlocked) {
        const newProgress = Math.min(progress, ach.requirement);
        if (newProgress >= ach.requirement) {
          unlocked = true;
          return { ...ach, progress: newProgress, unlocked: true };
        }
        return { ...ach, progress: newProgress };
      }
      return ach;
    }));
    return unlocked;
  }, [setAchievements]);

  const unlockAchievement = useCallback((id: string) => {
    let wasUnlocked = false;
    setAchievements(prev => prev.map(ach => {
      if (ach.id === id && !ach.unlocked) {
        wasUnlocked = true;
        return { ...ach, unlocked: true };
      }
      return ach;
    }));
    if (wasUnlocked) {
      setUnlockedThisSession(prev => [...prev, id]);
    }
    return wasUnlocked;
  }, [setAchievements]);

  const getUnlockedCount = useCallback(() => {
    return achievements.filter(a => a.unlocked).length;
  }, [achievements]);

  const getTotalProgress = useCallback(() => {
    return achievements.reduce((sum, a) => sum + (a.unlocked ? 100 : Math.floor((a.progress / a.requirement) * 100)), 0) / achievements.length;
  }, [achievements]);

  return { achievements, checkAchievement, unlockAchievement, getUnlockedCount, getTotalProgress, unlockedThisSession };
}

// Daily Rewards & Streak Hook
export function useDailyRewards() {
  const [streak, setStreak] = useLocalStorage<StreakData>(STORAGE_KEYS.STREAK, {
    currentStreak: 0,
    lastLogin: '',
    totalLogins: 0,
    bestStreak: 0,
  });
  const [dailyRewards, setDailyRewards] = useLocalStorage<DailyReward[]>(STORAGE_KEYS.DAILY_REWARDS, DAILY_REWARDS);
  const [coins, setCoins] = useLocalStorage<number>(STORAGE_KEYS.UNLOCKS, 0);

  const checkDailyReward = useCallback(() => {
    const today = new Date().toDateString();
    const lastLogin = new Date(streak.lastLogin);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (streak.lastLogin === today) {
      return { available: false, reason: 'already_claimed' };
    }

    const daysSinceLastLogin = Math.floor((new Date(today).getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    
    let newStreak = streak.currentStreak;
    if (daysSinceLastLogin === 1) {
      newStreak += 1;
    } else if (daysSinceLastLogin > 1) {
      newStreak = 1;
    } else {
      newStreak = 1;
    }

    // Reset weekly cycle if streak reached 7
    const rewardDay = ((newStreak - 1) % 7) + 1;
    const reward = dailyRewards[rewardDay - 1];

    return {
      available: true,
      streak: newStreak,
      rewardDay,
      reward,
    };
  }, [streak, dailyRewards]);

  const claimDailyReward = useCallback(() => {
    const check = checkDailyReward();
    if (!check.available || !check.reward) return null;

    const today = new Date().toDateString();
    const newStreak = check.streak;

    setStreak(prev => ({
      currentStreak: newStreak,
      lastLogin: today,
      totalLogins: prev.totalLogins + 1,
      bestStreak: Math.max(prev.bestStreak, newStreak),
    }));

    setCoins(prev => prev + (check.reward?.coins || 0));

    return check.reward;
  }, [checkDailyReward, setStreak, setCoins]);

  const addCoins = useCallback((amount: number) => {
    setCoins(prev => prev + amount);
  }, [setCoins]);

  const spendCoins = useCallback((amount: number): boolean => {
    let success = false;
    setCoins(prev => {
      if (prev >= amount) {
        success = true;
        return prev - amount;
      }
      success = false;
      return prev;
    });
    return success;
  }, [setCoins]);

  return { streak, coins, checkDailyReward, claimDailyReward, addCoins, spendCoins };
}

// Particle System Hook
export function useParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const spawnParticles = useCallback((x: number, y: number, type: Particle['type'] = 'spark', count: number = 10, colors?: string[]) => {
    const defaultColors = {
      spark: ['#FFD700', '#FFA500', '#FFFF00'],
      dust: ['#D4B483', '#C8A882', '#B89872'],
      glow: ['#4CAF50', '#8BC34A', '#CDDC39'],
      confetti: ['#f27696', '#FFD700', '#4CAF50', '#3498db', '#9b59b6'],
    };
    
    const particleColors = colors || defaultColors[type];
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 50 + 30;
      const life = Math.random() * 0.5 + 0.5;
      
      newParticles.push({
        id: `${Date.now()}-${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'dust' ? 20 : 0),
        life,
        maxLife: life,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        size: Math.random() * 6 + 4,
        type,
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
    
    // Auto cleanup
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  }, []);

  const updateParticles = useCallback((deltaTime: number) => {
    setParticles(prev => prev.map(p => ({
      ...p,
      x: p.x + p.vx * deltaTime,
      y: p.y + p.vy * deltaTime,
      vy: p.vy + 100 * deltaTime, // gravity
      life: p.life - deltaTime,
    })).filter(p => p.life > 0));
  }, []);

  const clearParticles = useCallback(() => {
    setParticles([]);
  }, []);

  return { particles, spawnParticles, updateParticles, clearParticles };
}

// Haptic Feedback Hook
export function useHaptics(enabled: boolean = true) {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (!enabled) return;
    if (navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Vibration not supported
      }
    }
  }, [enabled]);

  return {
    light: () => vibrate(10),
    medium: () => vibrate(20),
    heavy: () => vibrate(40),
    success: () => vibrate([30, 50, 30]),
    error: () => vibrate([50, 50, 50]),
    pattern: (pattern: number[]) => vibrate(pattern),
  };
}

// Game Timer Hook
export function useGameTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (!running) {
      setRunning(true);
      const startTime = Date.now() - elapsed * 1000;
      intervalRef.current = window.setInterval(() => {
        setElapsed((Date.now() - startTime) / 1000);
      }, 100);
    }
  }, [running, elapsed]);

  const stop = useCallback(() => {
    if (running && intervalRef.current) {
      clearInterval(intervalRef.current);
      setRunning(false);
    }
  }, [running]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setElapsed(0);
    setRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return { elapsed, running, start, stop, reset, formatTime };
}
