import type { Card, Shoe } from '../types';
import { SUITS, RANKS } from './cards';

const NUM_DECKS = 6;
const RESHUFFLE_THRESHOLD = 0.25;

export function createShoe(): Shoe {
  const cards: Card[] = [];
  for (let d = 0; d < NUM_DECKS; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        cards.push({ suit, rank, faceDown: false });
      }
    }
  }
  return { cards: shuffleArray(cards), totalCards: cards.length };
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function drawCard(shoe: Shoe, faceDown = false): { card: Card; shoe: Shoe } {
  if (shoe.cards.length === 0) {
    const fresh = createShoe();
    return drawCard(fresh, faceDown);
  }
  const [top, ...rest] = shoe.cards;
  const card = { ...top, faceDown };
  return { card, shoe: { ...shoe, cards: rest } };
}

export function shouldReshuffle(shoe: Shoe): boolean {
  return shoe.cards.length / shoe.totalCards < RESHUFFLE_THRESHOLD;
}
