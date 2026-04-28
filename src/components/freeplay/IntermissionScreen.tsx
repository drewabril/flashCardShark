import styles from './IntermissionScreen.module.css';

interface Props {
  handsPlayed: number;
  netChips: number;
  onContinue: () => void;
}

export function IntermissionScreen({ handsPlayed, netChips, onContinue }: Props) {
  const netLabel = netChips >= 0 ? `+$${netChips}` : `-$${Math.abs(netChips)}`;
  const netClass = netChips > 0 ? styles.positive : netChips < 0 ? styles.negative : styles.neutral;

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.shuffle}>
          <span>🃏</span>
          <span>🃏</span>
          <span>🃏</span>
        </div>
        <div className={styles.title}>Shuffling new shoe…</div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Hands</div>
            <div className={styles.statValue}>{handsPlayed}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Net</div>
            <div className={`${styles.statValue} ${netClass}`}>{netLabel}</div>
          </div>
        </div>
        <button className={styles.continueBtn} onClick={onContinue}>Continue</button>
      </div>
    </div>
  );
}
