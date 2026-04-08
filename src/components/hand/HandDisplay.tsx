import type { Card } from '../../types';
import { evaluateHand } from '../../engine/hand';
import { PlayingCard } from '../card/PlayingCard';
import styles from './HandDisplay.module.css';

interface Props {
  cards: Card[];
  label?: string;
  isActive?: boolean;
  hideTotal?: boolean;
}

export function HandDisplay({ cards, label, isActive, hideTotal }: Props) {
  const visibleCards = cards.filter(c => !c.faceDown);
  const value = visibleCards.length > 0 ? evaluateHand(visibleCards) : null;

  const totalClass = value?.isBust
    ? styles.bust
    : value?.isBlackjack
    ? styles.blackjack
    : '';

  const totalLabel = value
    ? value.isBlackjack
      ? 'Blackjack!'
      : value.isBust
      ? 'Bust'
      : value.isSoft && value.total < 21
      ? `Soft ${value.total}`
      : String(value.total)
    : '';

  return (
    <div className={`${styles.wrapper} ${isActive ? styles.active : ''}`}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.cards}>
        {cards.map((card, i) => (
          <PlayingCard key={i} card={card} />
        ))}
      </div>
      {!hideTotal && value && (
        <span className={`${styles.total} ${totalClass}`}>{totalLabel}</span>
      )}
    </div>
  );
}
