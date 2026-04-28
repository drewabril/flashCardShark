export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type StrategyAction = 'H' | 'S' | 'D' | 'SP' | 'SR';
export type HandCategory = 'hard' | 'soft' | 'pair';
export type GamePhase = 'betting' | 'playerTurn' | 'dealerTurn' | 'roundOver' | 'splitTurn' | 'insuranceOffered' | 'intermission';
export type RoundResult = 'win' | 'lose' | 'push' | 'blackjack' | 'surrender' | null;
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
  canSurrender: boolean;
}

export interface StrategyFeedback {
  playerAction: StrategyAction;
  correctAction: StrategyAction;
  isCorrect: boolean;
  explanation: string;
  handCategory: HandCategory;
}

export interface ShoeStats {
  handsPlayed: number;
  startingChips: number;
}

export interface GameState {
  shoe: Shoe;
  playerHands: HandState[];
  activeHandIndex: number;
  dealerCards: Card[];
  phase: GamePhase;
  chips: number;
  currentBet: number;
  insuranceBet: number;
  lastStrategyFeedback: StrategyFeedback | null;
  shoeStats: ShoeStats;
}

export type GameAction =
  | { type: 'PLACE_BET'; amount: number }
  | { type: 'DEAL' }
  | { type: 'HIT' }
  | { type: 'STAND' }
  | { type: 'DOUBLE' }
  | { type: 'SPLIT' }
  | { type: 'SURRENDER' }
  | { type: 'TAKE_INSURANCE' }
  | { type: 'DECLINE_INSURANCE' }
  | { type: 'END_INTERMISSION' }
  | { type: 'NEXT_ROUND' }
  | { type: 'REBET' }
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
