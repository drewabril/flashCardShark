import { trueCount, decksRemaining } from '../../engine/counting';
import styles from './CountOverlay.module.css';

interface Props {
  runningCount: number;
  cardsRemaining: number;
}

export function CountOverlay({ runningCount, cardsRemaining }: Props) {
  const tc = trueCount(runningCount, cardsRemaining);
  const decks = decksRemaining(cardsRemaining);

  // Colour-code by true count: green = player advantage, red = house advantage
  const tcClass =
    tc >= 2 ? styles.positive :
    tc <= -2 ? styles.negative :
    styles.neutral;

  const rcSign = runningCount > 0 ? '+' : '';
  const tcSign = tc > 0 ? '+' : '';

  return (
    <div className={styles.overlay}>
      <div className={styles.label}>Hi-Lo Count</div>
      <div className={styles.row}>
        <span className={styles.stat}>
          <span className={styles.statLabel}>RC</span>
          <span className={`${styles.statValue} ${tcClass}`}>{rcSign}{runningCount}</span>
        </span>
        <span className={styles.divider}>·</span>
        <span className={styles.stat}>
          <span className={styles.statLabel}>TC</span>
          <span className={`${styles.statValue} ${tcClass}`}>{tcSign}{tc.toFixed(1)}</span>
        </span>
        <span className={styles.divider}>·</span>
        <span className={styles.stat}>
          <span className={styles.statLabel}>Decks</span>
          <span className={styles.statValue}>{decks.toFixed(1)}</span>
        </span>
      </div>
      {tc >= 2 && (
        <div className={`${styles.hint} ${styles.positive}`}>Raise your bet ↑</div>
      )}
      {tc <= -2 && (
        <div className={`${styles.hint} ${styles.negative}`}>Lower your bet ↓</div>
      )}
    </div>
  );
}
