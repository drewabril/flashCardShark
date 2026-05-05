import { useState } from 'react';
import type { AppMode, CardBackStyle, FeltColor } from '../../types';
import { useSettings } from '../../store/settingsStore';
import { SettingsModal } from '../settings/SettingsModal';
import styles from './AppShell.module.css';

interface Props {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  chips: number;
  children: React.ReactNode;
}

const CARD_BACK_GRADIENTS: Record<CardBackStyle, string> = {
  blue:  'linear-gradient(135deg, #1565c0 25%, #0d47a1 100%)',
  red:   'linear-gradient(135deg, #c62828 25%, #7f1010 100%)',
  green: 'linear-gradient(135deg, #2e7d32 25%, #1b5e20 100%)',
  gray:  'linear-gradient(135deg, #546e7a 25%, #263238 100%)',
};

const FELT_GRADIENTS: Record<FeltColor, string> = {
  green:    'linear-gradient(160deg, #0f2027 0%, #1a3a2a 60%, #0f2027 100%)',
  blue:     'linear-gradient(160deg, #0a1929 0%, #11324c 60%, #0a1929 100%)',
  burgundy: 'linear-gradient(160deg, #1a0808 0%, #3a1818 60%, #1a0808 100%)',
  charcoal: 'linear-gradient(160deg, #0c0d10 0%, #1f2329 60%, #0c0d10 100%)',
};

export function AppShell({ mode, onModeChange, chips, children }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings } = useSettings();

  const cssVars = {
    '--card-back': CARD_BACK_GRADIENTS[settings.cardBackStyle],
    '--felt-bg': FELT_GRADIENTS[settings.feltColor],
  } as React.CSSProperties;

  return (
    <div className={styles.shell} style={cssVars}>
      <header className={styles.header}>
        <div className={styles.logo}>
          flash<span>Card</span>Shark 🦈
        </div>
        <div className={styles.chips}>
          Chips: <em>${chips.toLocaleString()}</em>
        </div>
        <div className={styles.controls}>
          <nav className={styles.tabs}>
            <button
              className={`${styles.tab} ${mode === 'freeplay' ? styles.active : ''}`}
              onClick={() => onModeChange('freeplay')}
            >
              Free Play
            </button>
            <button
              className={`${styles.tab} ${mode === 'quiz' ? styles.active : ''}`}
              onClick={() => onModeChange('quiz')}
            >
              Quiz
            </button>
          </nav>
          <button
            className={styles.gear}
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            title="Settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>
      <main className={styles.main}>{children}</main>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
