import type { SessionStats } from '../../types';
import styles from './IntermissionScreen.module.css';

interface Props {
  handsPlayed: number;
  netChips: number;
  sessionStats: SessionStats;
  onContinue: () => void;
  onResetStats: () => void;
}

function fmtMoney(n: number): string {
  return n >= 0 ? `+$${n}` : `-$${Math.abs(n)}`;
}

function moneyClass(n: number, styleObj: Record<string, string>): string {
  return n > 0 ? styleObj.positive : n < 0 ? styleObj.negative : styleObj.neutral;
}

export function IntermissionScreen({ handsPlayed, netChips, sessionStats, onContinue, onResetStats }: Props) {
  const accuracy = sessionStats.decisionsTotal > 0
    ? Math.round((sessionStats.decisionsCorrect / sessionStats.decisionsTotal) * 100)
    : 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.shuffle}>
          <span>🃏</span>
          <span>🃏</span>
          <span>🃏</span>
        </div>
        <div className={styles.title}>Shuffling new shoe…</div>

        {/* This shoe */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>This shoe</div>
          <div className={styles.statsRow}>
            <Stat label="Hands"  value={String(handsPlayed)} />
            <Stat label="Net"    value={fmtMoney(netChips)} valueClass={moneyClass(netChips, styles)} />
          </div>
        </div>

        {/* Session totals */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Session</div>
          <div className={styles.statsRow}>
            <Stat label="Hands"     value={String(sessionStats.totalHands)} />
            <Stat label="Accuracy"  value={`${accuracy}%`} />
            <Stat label="Streak"    value={`${sessionStats.currentStreak} (max ${sessionStats.longestStreak})`} small />
          </div>
          <div className={styles.statsRow}>
            <Stat label="W / L / P" value={`${sessionStats.wins} / ${sessionStats.losses} / ${sessionStats.pushes}`} small />
            <Stat label="Net"       value={fmtMoney(sessionStats.netChips)} valueClass={moneyClass(sessionStats.netChips, styles)} small />
          </div>
          {(sessionStats.biggestWin > 0 || sessionStats.biggestLoss > 0) && (
            <div className={styles.statsRow}>
              <Stat label="Best win"  value={`+$${sessionStats.biggestWin}`}  small />
              <Stat label="Worst hand" value={`-$${sessionStats.biggestLoss}`} small />
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button className={styles.continueBtn} onClick={onContinue}>Continue</button>
          <button className={styles.resetBtn} onClick={onResetStats} title="Reset session stats">Reset stats</button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, valueClass, small }: { label: string; value: string; valueClass?: string; small?: boolean }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statLabel}>{label}</div>
      <div className={`${small ? styles.statValueSmall : styles.statValue} ${valueClass ?? ''}`}>{value}</div>
    </div>
  );
}
