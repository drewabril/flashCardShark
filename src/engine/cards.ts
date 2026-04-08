import type { Suit, Rank, Card } from '../types';

export const SUITS: Suit[] = ['S', 'H', 'D', 'C'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function cardValue(rank: Rank): number {
  if (rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank, 10);
}

export function rankToNumber(rank: Rank): number {
  if (rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank, 10);
}

export function suitToSymbol(suit: Suit): string {
  const map: Record<Suit, string> = { S: '♠', H: '♥', D: '♦', C: '♣' };
  return map[suit];
}

export function isRedSuit(suit: Suit): boolean {
  return suit === 'H' || suit === 'D';
}

export function cardLabel(card: Card): string {
  return `${card.rank}${suitToSymbol(card.suit)}`;
}
