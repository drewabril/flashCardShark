import type { Card, Shoe } from '../types';
import { evaluateHand } from './hand';
import { drawCard } from './deck';

export function dealerShouldHit(dealerCards: Card[]): boolean {
  const { total, isSoft } = evaluateHand(dealerCards);
  if (total < 17) return true;
  // Dealer stands on soft 17 (standard 6-deck rule)
  if (total === 17 && isSoft) return false;
  return false;
}

export function playDealerHand(
  shoe: Shoe,
  dealerCards: Card[]
): { finalCards: Card[]; shoe: Shoe } {
  let cards = dealerCards.map(c => ({ ...c, faceDown: false }));
  let currentShoe = shoe;

  while (dealerShouldHit(cards)) {
    const { card, shoe: newShoe } = drawCard(currentShoe);
    cards = [...cards, card];
    currentShoe = newShoe;
  }

  return { finalCards: cards, shoe: currentShoe };
}
