import styles from './ActionButtons.module.css';

interface Props {
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
  onSurrender: () => void;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  disabled?: boolean;
}

export function ActionButtons({ onHit, onStand, onDouble, onSplit, onSurrender, canDouble, canSplit, canSurrender, disabled }: Props) {
  return (
    <div className={styles.grid}>
      <button className={`${styles.btn} ${styles.hit}`} onClick={onHit} disabled={disabled} aria-label="Hit">
        Hit
      </button>
      <button className={`${styles.btn} ${styles.stand}`} onClick={onStand} disabled={disabled} aria-label="Stand">
        Stand
      </button>
      <button className={`${styles.btn} ${styles.double}`} onClick={onDouble} disabled={disabled || !canDouble} aria-label="Double Down">
        Double
      </button>
      <button className={`${styles.btn} ${styles.split}`} onClick={onSplit} disabled={disabled || !canSplit} aria-label="Split">
        Split
      </button>
      {canSurrender && (
        <button className={`${styles.btn} ${styles.surrender} ${styles.wide}`} onClick={onSurrender} disabled={disabled} aria-label="Surrender">
          Surrender
        </button>
      )}
    </div>
  );
}
