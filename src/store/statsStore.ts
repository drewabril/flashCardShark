import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import React from 'react';
import type { SessionStats, RoundResult } from '../types';

const STORAGE_KEY = 'fcs_stats';

const DEFAULT_STATS: SessionStats = {
  totalHands: 0,
  decisionsTotal: 0,
  decisionsCorrect: 0,
  currentStreak: 0,
  longestStreak: 0,
  wins: 0,
  losses: 0,
  pushes: 0,
  blackjacks: 0,
  surrenders: 0,
  biggestWin: 0,
  biggestLoss: 0,
  netChips: 0,
  startedAt: Date.now(),
};

function loadStats(): SessionStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATS, startedAt: Date.now() };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATS, ...parsed };
  } catch {
    return { ...DEFAULT_STATS, startedAt: Date.now() };
  }
}

function saveStats(s: SessionStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

interface StatsContextValue {
  stats: SessionStats;
  recordDecision: (isCorrect: boolean) => void;
  recordRound: (result: RoundResult, chipDelta: number) => void;
  resetStats: () => void;
}

export const StatsContext = createContext<StatsContextValue | null>(null);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<SessionStats>(loadStats);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  const recordDecision = useCallback((isCorrect: boolean) => {
    setStats(prev => {
      const decisionsCorrect = prev.decisionsCorrect + (isCorrect ? 1 : 0);
      const currentStreak = isCorrect ? prev.currentStreak + 1 : 0;
      const longestStreak = Math.max(prev.longestStreak, currentStreak);
      return {
        ...prev,
        decisionsTotal: prev.decisionsTotal + 1,
        decisionsCorrect,
        currentStreak,
        longestStreak,
      };
    });
  }, []);

  const recordRound = useCallback((result: RoundResult, chipDelta: number) => {
    setStats(prev => {
      const next: SessionStats = {
        ...prev,
        totalHands: prev.totalHands + 1,
        netChips: prev.netChips + chipDelta,
      };
      if (chipDelta > 0 && chipDelta > next.biggestWin)  next.biggestWin = chipDelta;
      if (chipDelta < 0 && -chipDelta > next.biggestLoss) next.biggestLoss = -chipDelta;
      if (result === 'win')        next.wins++;
      else if (result === 'lose')  next.losses++;
      else if (result === 'push')  next.pushes++;
      else if (result === 'blackjack') { next.wins++; next.blackjacks++; }
      else if (result === 'surrender') { next.losses++; next.surrenders++; }
      return next;
    });
  }, []);

  const resetStats = useCallback(() => {
    setStats({ ...DEFAULT_STATS, startedAt: Date.now() });
  }, []);

  return React.createElement(
    StatsContext.Provider,
    { value: { stats, recordDecision, recordRound, resetStats } },
    children
  );
}

export function useStats(): StatsContextValue {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error('useStats must be used inside StatsProvider');
  return ctx;
}
