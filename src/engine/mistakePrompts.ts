import type { Card, MistakeEntry, MistakeSituation, QuizPrompt, Rank } from '../types';
import { getBasicStrategyMove } from './basicStrategy';

// Two-card representations for hard totals that don't form a pair when rendered.
// (Hard totals only reachable through 3+ cards — like hard 20 from 5+5+10 — fall back
//  to a representative pair below; quiz still trains the right decision.)
const HARD_2_CARD: Record<number, [Rank, Rank]> = {
  5: ['2', '3'], 6: ['2', '4'], 7: ['3', '4'], 8: ['3', '5'],
  9: ['4', '5'], 10: ['4', '6'], 11: ['5', '6'], 12: ['5', '7'],
  13: ['5', '8'], 14: ['6', '8'], 15: ['7', '8'], 16: ['7', '9'],
  17: ['8', '9'], 18: ['8', '10'], 19: ['9', '10'],
};

function situationToCards(s: MistakeSituation): Card[] | null {
  if (s.category === 'pair') {
    const r = s.totalOrRank as Rank;
    return [
      { rank: r, suit: 'S', faceDown: false },
      { rank: r, suit: 'H', faceDown: false },
    ];
  }
  if (s.category === 'soft') {
    const t = parseInt(s.totalOrRank, 10);
    const other = t - 11;
    if (other < 2 || other > 9) return null; // soft 13–20 only
    return [
      { rank: 'A', suit: 'S', faceDown: false },
      { rank: String(other) as Rank, suit: 'H', faceDown: false },
    ];
  }
  // hard
  const t = parseInt(s.totalOrRank, 10);
  const pair = HARD_2_CARD[t];
  if (!pair) return null;
  return [
    { rank: pair[0], suit: 'S', faceDown: false },
    { rank: pair[1], suit: 'H', faceDown: false },
  ];
}

function situationToPrompt(s: MistakeSituation): QuizPrompt | null {
  const playerCards = situationToCards(s);
  if (!playerCards) return null;
  const dealerUpcard: Card = { rank: s.dealerRank, suit: 'C', faceDown: false };
  const correctAnswer = getBasicStrategyMove(playerCards, dealerUpcard, true, true);
  return { playerCards, dealerUpcard, correctAnswer };
}

/**
 * Pick a weighted-random mistake entry and build a quiz prompt from it.
 * Weight = wrongCount + 1 so single-mistakes still surface.
 * Returns null if there are no representable mistakes.
 */
export function generateMistakePrompt(mistakes: Record<string, MistakeEntry>): QuizPrompt | null {
  const entries = Object.values(mistakes).filter(e => situationToCards(e.situation));
  if (entries.length === 0) return null;

  const totalWeight = entries.reduce((sum, e) => sum + e.wrongCount + 1, 0);
  let r = Math.random() * totalWeight;
  let chosen = entries[0];
  for (const e of entries) {
    r -= e.wrongCount + 1;
    if (r <= 0) { chosen = e; break; }
  }

  return situationToPrompt(chosen.situation);
}
