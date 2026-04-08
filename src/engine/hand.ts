import type { Card, HandValue } from '../types';
import { cardValue } from './cards';

export function evaluateHand(cards: Card[]): HandValue {
  const visibleCards = cards.filter(c => !c.faceDown);
  let total = 0;
  let aces = 0;

  for (const card of visibleCards) {
    const v = cardValue(card.rank);
    total += v;
    if (card.rank === 'A') aces++;
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  const isSoft = aces > 0 && total <= 21;
  const isBust = total > 21;
  const isBlackjack = visibleCards.length === 2 && total === 21;
  const isPair =
    visibleCards.length === 2 && visibleCards[0].rank === visibleCards[1].rank;

  return { total, isSoft, isBust, isBlackjack, isPair };
}

export function canDouble(cards: Card[]): boolean {
  return cards.length === 2;
}

export function canSplit(cards: Card[]): boolean {
  return cards.length === 2 && cards[0].rank === cards[1].rank;
}
