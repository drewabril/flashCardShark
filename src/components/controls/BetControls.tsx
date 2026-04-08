import styles from './BetControls.module.css';

const CHIP_VALUES = [5, 10, 25, 50, 100];

interface Props {
  chips: number;
  currentBet: number;
  onAddBet: (amount: number) => void;
  onClearBet: () => void;
  onDeal: () => void;
}

export function BetControls({ chips, currentBet, onAddBet, onClearBet, onDeal }: Props) {
  const chipColors = [styles.chip5, styles.chip10, styles.chip25, styles.chip50, styles.chip100];

  return (
    <div className={styles.wrapper}>
      <div className={styles.betInfo}>
        Bet: <span className={styles.currentBet}>${currentBet}</span>
      </div>
      <div className={styles.chips}>
        {CHIP_VALUES.map((val, i) => (
          <button
            key={val}
            className={`${styles.chip} ${chipColors[i]}`}
            onClick={() => onAddBet(val)}
            disabled={chips < val}
            aria-label={`Bet $${val}`}
          >
            ${val}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className={styles.clearBtn} onClick={onClearBet} disabled={currentBet === 0}>
          Clear
        </button>
        <button className={styles.dealBtn} onClick={onDeal} disabled={currentBet === 0}>
          Deal
        </button>
      </div>
    </div>
  );
}
