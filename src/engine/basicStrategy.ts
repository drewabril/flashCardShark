import type { Card, Rank, StrategyAction, HandCategory } from '../types';
import { rankToNumber } from './cards';
import { evaluateHand, canDouble as handCanDouble } from './hand';

// 6-deck, dealer stands soft 17, double after split allowed
// Dealer upcard index: 2–10, 11=Ace

type DealerMap = Record<number, StrategyAction>;

const HARD: Record<number, DealerMap> = {
   5: { 2:'H', 3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', 10:'H', 11:'H' },
   6: { 2:'H', 3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', 10:'H', 11:'H' },
   7: { 2:'H', 3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', 10:'H', 11:'H' },
   8: { 2:'H', 3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', 10:'H', 11:'H' },
   9: { 2:'H', 3:'D', 4:'D', 5:'D', 6:'D', 7:'H', 8:'H', 9:'H', 10:'H', 11:'H' },
  10: { 2:'D', 3:'D', 4:'D', 5:'D', 6:'D', 7:'D', 8:'D', 9:'D', 10:'H', 11:'H' },
  11: { 2:'D', 3:'D', 4:'D', 5:'D', 6:'D', 7:'D', 8:'D', 9:'D', 10:'D', 11:'D' },
  12: { 2:'H', 3:'H', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', 10:'H', 11:'H' },
  13: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', 10:'H', 11:'H' },
  14: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', 10:'H', 11:'H' },
  15: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', 10:'H', 11:'H' },
  16: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', 10:'H', 11:'H' },
  17: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', 10:'S', 11:'S' },
};

const SOFT: Record<number, DealerMap> = {
  13: { 2:'H', 3:'H', 4:'H', 5:'D', 6:'D', 7:'H', 8:'H', 9:'H', 10:'H', 11:'H' }, // A2
  14: { 2:'H', 3:'H', 4:'H', 5:'D', 6:'D', 7:'H', 8:'H', 9:'H', 10:'H', 11:'H' }, // A3
  15: { 2:'H', 3:'H', 4:'D', 5:'D', 6:'D', 7:'H', 8:'H', 9:'H', 10:'H', 11:'H' }, // A4
  16: { 2:'H', 3:'H', 4:'D', 5:'D', 6:'D', 7:'H', 8:'H', 9:'H', 10:'H', 11:'H' }, // A5
  17: { 2:'H', 3:'D', 4:'D', 5:'D', 6:'D', 7:'H', 8:'H', 9:'H', 10:'H', 11:'H' }, // A6
  18: { 2:'S', 3:'D', 4:'D', 5:'D', 6:'D', 7:'S', 8:'S', 9:'H', 10:'H', 11:'H' }, // A7 — most important soft hand
  19: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', 10:'S', 11:'S' }, // A8
  20: { 2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', 10:'S', 11:'S' }, // A9
};

const PAIRS: Record<Rank, DealerMap> = {
  'A': { 2:'SP', 3:'SP', 4:'SP', 5:'SP', 6:'SP', 7:'SP', 8:'SP', 9:'SP', 10:'SP', 11:'SP' },
  '2': { 2:'SP', 3:'SP', 4:'SP', 5:'SP', 6:'SP', 7:'SP', 8:'H',  9:'H',  10:'H',  11:'H'  },
  '3': { 2:'SP', 3:'SP', 4:'SP', 5:'SP', 6:'SP', 7:'SP', 8:'H',  9:'H',  10:'H',  11:'H'  },
  '4': { 2:'H',  3:'H',  4:'H',  5:'SP', 6:'SP', 7:'H',  8:'H',  9:'H',  10:'H',  11:'H'  },
  '5': { 2:'D',  3:'D',  4:'D',  5:'D',  6:'D',  7:'D',  8:'D',  9:'D',  10:'H',  11:'H'  }, // never split, treat as 10
  '6': { 2:'SP', 3:'SP', 4:'SP', 5:'SP', 6:'SP', 7:'H',  8:'H',  9:'H',  10:'H',  11:'H'  },
  '7': { 2:'SP', 3:'SP', 4:'SP', 5:'SP', 6:'SP', 7:'SP', 8:'H',  9:'H',  10:'H',  11:'H'  },
  '8': { 2:'SP', 3:'SP', 4:'SP', 5:'SP', 6:'SP', 7:'SP', 8:'SP', 9:'SP', 10:'SP', 11:'SP' },
  '9': { 2:'SP', 3:'SP', 4:'SP', 5:'SP', 6:'SP', 7:'S',  8:'SP', 9:'SP', 10:'S',  11:'S'  },
  '10':{ 2:'S',  3:'S',  4:'S',  5:'S',  6:'S',  7:'S',  8:'S',  9:'S',  10:'S',  11:'S'  },
  'J': { 2:'S',  3:'S',  4:'S',  5:'S',  6:'S',  7:'S',  8:'S',  9:'S',  10:'S',  11:'S'  },
  'Q': { 2:'S',  3:'S',  4:'S',  5:'S',  6:'S',  7:'S',  8:'S',  9:'S',  10:'S',  11:'S'  },
  'K': { 2:'S',  3:'S',  4:'S',  5:'S',  6:'S',  7:'S',  8:'S',  9:'S',  10:'S',  11:'S'  },
};

export function classifyHand(cards: Card[]): HandCategory {
  const { isPair, isSoft } = evaluateHand(cards);
  if (isPair && cards.length === 2) return 'pair';
  if (isSoft) return 'soft';
  return 'hard';
}

export function getBasicStrategyMove(
  playerCards: Card[],
  dealerUpcard: Card,
  playerCanDouble = true
): StrategyAction {
  const { total, isPair, isSoft } = evaluateHand(playerCards);
  const dealerNum = rankToNumber(dealerUpcard.rank);
  const doubleAllowed = playerCanDouble && handCanDouble(playerCards);

  let action: StrategyAction;

  if (isPair && playerCards.length === 2) {
    const pairRow = PAIRS[playerCards[0].rank];
    action = pairRow?.[dealerNum] ?? 'H';
  } else if (isSoft && SOFT[total]) {
    action = SOFT[total][dealerNum] ?? 'H';
  } else {
    const clampedTotal = Math.min(total, 17);
    const hardRow = HARD[clampedTotal];
    action = hardRow?.[dealerNum] ?? 'S';
  }

  // If strategy says Double but player can't double, fall back to Hit
  if (action === 'D' && !doubleAllowed) {
    return 'H';
  }

  return action;
}

export function getExplanation(
  correctAction: StrategyAction,
  category: HandCategory,
  total: number,
  dealerUpcard: number
): string {
  const dealerLabel = dealerUpcard === 11 ? 'Ace' : String(dealerUpcard);
  const actionLabel: Record<StrategyAction, string> = {
    H: 'Hit',
    S: 'Stand',
    D: 'Double Down',
    SP: 'Split',
  };
  const act = actionLabel[correctAction];

  if (category === 'pair') {
    if (correctAction === 'SP') return `${act}: Always split this pair against dealer ${dealerLabel}.`;
    if (correctAction === 'D') return `${act}: Treat paired 5s as hard 10; double against dealer ${dealerLabel}.`;
    return `${act}: Don't split — play this pair as a ${total} against dealer ${dealerLabel}.`;
  }

  if (category === 'soft') {
    if (total === 18) {
      if (correctAction === 'D') return `${act}: Soft 18 (A-7) doubles against dealer ${dealerLabel} — maximize when dealer is weak.`;
      if (correctAction === 'H') return `${act}: Soft 18 (A-7) hits against dealer ${dealerLabel} — you need to improve.`;
      return `${act}: Soft 18 (A-7) stands against dealer ${dealerLabel}.`;
    }
    if (correctAction === 'D') return `${act}: Soft ${total} doubles against dealer ${dealerLabel} — dealer is weak.`;
    return `${act}: Soft ${total} against dealer ${dealerLabel}.`;
  }

  // hard totals
  if (total >= 17) return `${act}: Always stand on hard ${total}.`;
  if (total >= 13 && total <= 16) {
    if (correctAction === 'S') return `${act}: Hard ${total} stands against dealer ${dealerLabel} (dealer weak, let them bust).`;
    return `${act}: Hard ${total} must hit against dealer ${dealerLabel} (dealer strong).`;
  }
  if (total === 11) return `${act}: Hard 11 — always double down, best doubling situation.`;
  if (total === 10) {
    if (correctAction === 'D') return `${act}: Hard 10 doubles against dealer ${dealerLabel}.`;
    return `${act}: Hard 10 hits against dealer ${dealerLabel} — dealer too strong.`;
  }
  if (total === 9) {
    if (correctAction === 'D') return `${act}: Hard 9 doubles against dealer ${dealerLabel} (3–6 only).`;
    return `${act}: Hard 9 hits against dealer ${dealerLabel}.`;
  }
  return `${act}: Basic strategy for hard ${total} vs dealer ${dealerLabel}.`;
}
