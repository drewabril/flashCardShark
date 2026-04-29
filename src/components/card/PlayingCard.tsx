import type { Card } from '../../types';
import { suitToSymbol, isRedSuit } from '../../engine/cards';
import styles from './PlayingCard.module.css';

interface Props {
  card: Card;
}

export function PlayingCard({ card }: Props) {
  if (card.faceDown) {
    return <CardBack />;
  }

  const symbol = suitToSymbol(card.suit);
  const colorClass = isRedSuit(card.suit) ? styles.red : styles.black;

  return (
    <div className={`${styles.card} ${colorClass}`} aria-label={`${card.rank} of ${card.suit}`}>
      <span className={styles.rankTop}>{card.rank}</span>
      <span className={styles.suit}>{symbol}</span>
      <span className={styles.rankBottom}>{card.rank}</span>
    </div>
  );
}

export function CardBack() {
  return (
    <div
      className={styles.card}
      style={{ background: 'var(--card-back, linear-gradient(135deg, #1565c0 25%, #0d47a1 100%))' }}
      aria-label="Face down card"
    >
      <div style={{ gridColumn: '1', gridRow: '1 / 4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'rgba(255,255,255,0.25)' }}>
        🂠
      </div>
    </div>
  );
}
