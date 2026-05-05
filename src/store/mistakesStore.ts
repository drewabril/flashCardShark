import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import React from 'react';
import type { MistakeEntry, MistakeSituation, StrategyAction } from '../types';
import { situationKey } from '../engine/basicStrategy';

const STORAGE_KEY = 'fcs_mistakes';
const GRADUATE_AFTER = 3; // mistakes drop off after N consecutive correct repeats

type MistakeMap = Record<string, MistakeEntry>;

function loadMistakes(): MistakeMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as MistakeMap;
  } catch {
    return {};
  }
}

function saveMistakes(m: MistakeMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  } catch {
    // ignore
  }
}

interface MistakesContextValue {
  mistakes: MistakeMap;
  /** Call after every strategy decision; tracker handles add / repeat / graduate. */
  recordDecision: (
    situation: MistakeSituation,
    playerAction: StrategyAction,
    correctAction: StrategyAction,
  ) => void;
  clearMistakes: () => void;
}

export const MistakesContext = createContext<MistakesContextValue | null>(null);

export function MistakesProvider({ children }: { children: React.ReactNode }) {
  const [mistakes, setMistakes] = useState<MistakeMap>(loadMistakes);

  useEffect(() => {
    saveMistakes(mistakes);
  }, [mistakes]);

  const recordDecision = useCallback((
    situation: MistakeSituation,
    playerAction: StrategyAction,
    correctAction: StrategyAction,
  ) => {
    const key = situationKey(situation);
    const isCorrect = playerAction === correctAction;
    setMistakes(prev => {
      const existing = prev[key];

      if (!isCorrect) {
        // record / refresh as a mistake
        const entry: MistakeEntry = {
          key,
          situation,
          correctAction,
          lastWrongAction: playerAction,
          wrongCount: (existing?.wrongCount ?? 0) + 1,
          correctRepeats: 0,
          lastSeen: Date.now(),
        };
        return { ...prev, [key]: entry };
      }

      // correct on a tracked situation → bump repeats; graduate if threshold reached
      if (existing) {
        const next = existing.correctRepeats + 1;
        if (next >= GRADUATE_AFTER) {
          const { [key]: _removed, ...rest } = prev;
          return rest;
        }
        return {
          ...prev,
          [key]: { ...existing, correctRepeats: next, lastSeen: Date.now() },
        };
      }

      return prev; // correct on a not-tracked situation: nothing to do
    });
  }, []);

  const clearMistakes = useCallback(() => {
    setMistakes({});
  }, []);

  return React.createElement(
    MistakesContext.Provider,
    { value: { mistakes, recordDecision, clearMistakes } },
    children
  );
}

export function useMistakes(): MistakesContextValue {
  const ctx = useContext(MistakesContext);
  if (!ctx) throw new Error('useMistakes must be used inside MistakesProvider');
  return ctx;
}
