import { useState, useEffect, useCallback, useRef } from 'react';

export function useAudio(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const init = useCallback(() => {
    if (!ctxRef.current) {
      try {
        ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {}
    }
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number) => {
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
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }, [enabled, init]);

  return {
    click: () => playTone(600, 'sine', 0.05),
    place: () => playTone(400, 'triangle', 0.1),
    move: () => playTone(500, 'sine', 0.1),
    mill: () => {
      playTone(600, 'sine', 0.15);
      setTimeout(() => playTone(800, 'sine', 0.15), 150);
    },
    win: () => {
      playTone(400, 'sine', 0.2);
      setTimeout(() => playTone(600, 'sine', 0.2), 200);
      setTimeout(() => playTone(800, 'sine', 0.3), 400);
    },
  };
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn('LocalStorage error:', error);
    }
  };

  return [storedValue, setValue] as const;
}
