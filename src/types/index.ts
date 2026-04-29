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
  situation: MistakeSituation; // canonical situation key for dedupe in mistake tracker
}

export interface ShoeStats {
  handsPlayed: number;
  startingChips: number;
}

export interface ActiveRules {
  numDecks: number;
  dealerStandsOnSoft17: boolean;
  surrenderAllowed: boolean;
  doubleAfterSplit: boolean;
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
  rules: ActiveRules;
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
  | { type: 'RELOAD_CHIPS' }
  | { type: 'APPLY_RULES'; rules: ActiveRules };

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

// ─── Settings ──────────────────────────────────────────────────────────────

export type DeckCount = 1 | 2 | 4 | 6 | 8;
export type CardBackStyle = 'blue' | 'red' | 'green' | 'gray';
export type FeltColor = 'green' | 'blue' | 'burgundy' | 'charcoal';
export type FeedbackMode = 'always' | 'mistakeOnly';

export interface Settings {
  // Game rules
  numDecks: DeckCount;
  dealerStandsOnSoft17: boolean; // true = S17, false = H17
  surrenderAllowed: boolean;
  doubleAfterSplit: boolean;
  // Appearance
  cardBackStyle: CardBackStyle;
  feltColor: FeltColor;
  // Feedback
  feedbackMode: FeedbackMode;
}

// ─── Stats ─────────────────────────────────────────────────────────────────

// ─── Mistake tracker ───────────────────────────────────────────────────────

// A canonical "situation" — used as the dedupe key for mistake entries.
// Examples: 'pair:8:10', 'soft:18:6', 'hard:16:A'
export interface MistakeSituation {
  category: HandCategory;
  // For pairs: rank of the pair (e.g. '8'). For soft/hard: the player total as string.
  totalOrRank: string;
  dealerRank: Rank;
}

export interface MistakeEntry {
  key: string;
  situation: MistakeSituation;
  correctAction: StrategyAction;
  lastWrongAction: StrategyAction;
  wrongCount: number;          // how many times the player has missed this
  correctRepeats: number;      // consecutive corrects since last mistake
  lastSeen: number;            // ms timestamp
}

export interface SessionStats {
  totalHands: number;
  decisionsTotal: number;
  decisionsCorrect: number;
  currentStreak: number;        // consecutive correct decisions (resets on a mistake)
  longestStreak: number;
  wins: number;
  losses: number;
  pushes: number;
  blackjacks: number;
  surrenders: number;
  biggestWin: number;           // single-round chip gain
  biggestLoss: number;          // single-round chip loss (positive number)
  netChips: number;             // cumulative chip delta since stats started
  startedAt: number;            // timestamp ms
}
