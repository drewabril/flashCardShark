export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type StrategyAction = 'H' | 'S' | 'D' | 'SP';
export type HandCategory = 'hard' | 'soft' | 'pair';
export type GamePhase = 'betting' | 'playerTurn' | 'dealerTurn' | 'roundOver' | 'splitTurn';
export type RoundResult = 'win' | 'lose' | 'push' | 'blackjack' | null;
export type AppMode = 'freeplay' | 'quiz';

export interface Card {
  suit: Suit;
  rank: Rank;
  faceDown: boolean;
}

export interface HandValue {
  total: number;
  isSoft: boolean;
  isBust: boolean;
  isBlackjack: boolean;
  isPair: boolean;
}

export interface Shoe {
  cards: Card[];
  totalCards: number;
}

export interface HandState {
  cards: Card[];
  bet: number;
  result: RoundResult;
  canDouble: boolean;
  canSplit: boolean;
}

export interface StrategyFeedback {
  playerAction: StrategyAction;
  correctAction: StrategyAction;
  isCorrect: boolean;
  explanation: string;
  handCategory: HandCategory;
}

export interface GameState {
  shoe: Shoe;
  playerHands: HandState[];
  activeHandIndex: number;
  dealerCards: Card[];
  phase: GamePhase;
  chips: number;
  currentBet: number;
  lastStrategyFeedback: StrategyFeedback | null;
}

export type GameAction =
  | { type: 'PLACE_BET'; amount: number }
  | { type: 'DEAL' }
  | { type: 'HIT' }
  | { type: 'STAND' }
  | { type: 'DOUBLE' }
  | { type: 'SPLIT' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RELOAD_CHIPS' };

export interface QuizPrompt {
  playerCards: Card[];
  dealerUpcard: Card;
  correctAnswer: StrategyAction;
}

export interface QuizResult {
  chosen: StrategyAction;
  correct: StrategyAction;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizState {
  currentPrompt: QuizPrompt | null;
  score: number;
  streak: number;
  totalAnswered: number;
  lastResult: QuizResult | null;
  phase: 'answering' | 'revealed';
}
