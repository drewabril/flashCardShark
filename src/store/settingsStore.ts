import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import React from 'react';
import type { Settings } from '../types';

const STORAGE_KEY = 'fcs_settings';

export const DEFAULT_SETTINGS: Settings = {
  numDecks: 6,
  dealerStandsOnSoft17: true,
  surrenderAllowed: true,
  doubleAfterSplit: true,
  cardBackStyle: 'blue',
  feltColor: 'green',
  feedbackMode: 'always',
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    // Merge with defaults so newly-added fields get sensible values
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return React.createElement(
    SettingsContext.Provider,
    { value: { settings, updateSettings, resetSettings } },
    children
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
