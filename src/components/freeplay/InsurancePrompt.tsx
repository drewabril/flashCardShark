import styles from './InsurancePrompt.module.css';

interface Props {
  bet: number;
  onTake: () => void;
  onDecline: () => void;
  showHint?: boolean;
}

export function InsurancePrompt({ bet, onTake, onDecline, showHint = true }: Props) {
  const cost = Math.floor(bet / 2);
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.title}>Dealer shows an Ace</div>
        <div className={styles.body}>
          Insurance pays 2:1 if the dealer has blackjack.
        </div>
        <div className={styles.cost}>Side bet: ${cost}</div>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.take}`} onClick={onTake}>Take Insurance</button>
          <button className={`${styles.btn} ${styles.decline}`} onClick={onDecline}>Decline</button>
        </div>
        {showHint && (
          <div className={styles.hint}>Basic strategy: decline (insurance is a long-term losing bet).</div>
        )}
      </div>
    </div>
  );
}
