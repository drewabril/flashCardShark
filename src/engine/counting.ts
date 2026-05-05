import type { Card, Rank } from '../types';

/**
 * Hi-Lo card counting system.
 * 2–6  → +1 (low cards favour the dealer → good for player when removed)
 * 7–9  →  0 (neutral)
 * 10–K, A → –1 (high cards favour the player → bad for player when removed)
 */
export function hiLoValue(rank: Rank): number {
  if (['2', '3', '4', '5', '6'].includes(rank)) return +1;
  if (['10', 'J', 'Q', 'K', 'A'].includes(rank)) return -1;
  return 0; // 7, 8, 9
}

/** Sum the Hi-Lo values for an array of face-up cards. */
export function countCards(cards: Card[]): number {
  return cards.reduce((sum, c) => sum + (c.faceDown ? 0 : hiLoValue(c.rank)), 0);
}

/**
 * True count = running count ÷ decks remaining.
 * Decks remaining is derived from cards left in the shoe.
 */
export function trueCount(runningCount: number, cardsRemaining: number): number {
  const decksRemaining = cardsRemaining / 52;
  if (decksRemaining < 0.5) return runningCount; // avoid divide-by-near-zero late in shoe
  return runningCount / decksRemaining;
}

export function decksRemaining(cardsLeft: number): number {
  return cardsLeft / 52;
}
