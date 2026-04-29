import type { Card, Shoe } from '../types';
import { evaluateHand } from './hand';
import { drawCard } from './deck';

export function dealerShouldHit(dealerCards: Card[], standsOnSoft17: boolean = true): boolean {
  const { total, isSoft } = evaluateHand(dealerCards);
  if (total < 17) return true;
  if (total === 17 && isSoft) return !standsOnSoft17; // H17 hits, S17 stands
  return false;
}

export function playDealerHand(
  shoe: Shoe,
  dealerCards: Card[],
  standsOnSoft17: boolean = true
): { finalCards: Card[]; shoe: Shoe } {
  let cards = dealerCards.map(c => ({ ...c, faceDown: false }));
  let currentShoe = shoe;

  while (dealerShouldHit(cards, standsOnSoft17)) {
    const { card, shoe: newShoe } = drawCard(currentShoe);
    cards = [...cards, card];
    currentShoe = newShoe;
  }

  return { finalCards: cards, shoe: currentShoe };
}
