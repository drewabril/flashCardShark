import type { AppMode } from '../../types';
import styles from './AppShell.module.css';

interface Props {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  chips: number;
  children: React.ReactNode;
}

export function AppShell({ mode, onModeChange, chips, children }: Props) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.logo}>
          flash<span>Card</span>Shark 🦈
        </div>
        <div className={styles.chips}>
          Chips: <em>${chips.toLocaleString()}</em>
        </div>
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
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
