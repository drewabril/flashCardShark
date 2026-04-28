import { createContext, useContext, useReducer } from 'react';
import type { GameState, GameAction, HandState, RoundResult } from '../types';
import { createShoe, drawCard, shouldReshuffle } from '../engine/deck';
import { evaluateHand, canDouble, canSplit } from '../engine/hand';
import { playDealerHand } from '../engine/dealer';
import { getBasicStrategyMove, getExplanation, classifyHand } from '../engine/basicStrategy';
import { rankToNumber } from '../engine/cards';

const STARTING_CHIPS = 1000;

function loadChips(): number {
  try {
    const saved = localStorage.getItem('fcs_chips');
    return saved ? parseInt(saved, 10) : STARTING_CHIPS;
  } catch {
    return STARTING_CHIPS;
  }
}

function saveChips(chips: number): void {
  try {
    localStorage.setItem('fcs_chips', String(chips));
  } catch {
    // ignore
  }
}

function makeHandState(cards: HandState['cards'], bet: number, canSurrender = false): HandState {
  return {
    cards,
    bet,
    result: null,
    canDouble: canDouble(cards),
    canSplit: canSplit(cards),
    canSurrender,
  };
}

function determineResult(playerTotal: number, playerBust: boolean, playerBJ: boolean, dealerTotal: number, dealerBust: boolean): RoundResult {
  if (playerBust) return 'lose';
  if (playerBJ && dealerTotal !== 21) return 'blackjack';
  if (dealerBust) return 'win';
  if (playerTotal > dealerTotal) return 'win';
  if (playerTotal < dealerTotal) return 'lose';
  return 'push';
}

function calcPayout(result: RoundResult, bet: number): number {
  if (result === 'blackjack') return Math.floor(bet * 2.5); // 3:2 + original bet
  if (result === 'win') return bet * 2;
  if (result === 'push') return bet;
  return 0;
}

export function createInitialState(): GameState {
  const chips = loadChips();
  return {
    shoe: createShoe(),
    playerHands: [],
    activeHandIndex: 0,
    dealerCards: [],
    phase: 'betting',
    chips,
    currentBet: 0,
    insuranceBet: 0,
    lastStrategyFeedback: null,
    shoeStats: { handsPlayed: 0, startingChips: chips },
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'PLACE_BET': {
      const bet = Math.min(action.amount, state.chips);
      return { ...state, currentBet: bet, lastStrategyFeedback: null };
    }

    case 'DEAL': {
      if (state.currentBet <= 0) return state;

      // Draw: p1, d1, p2, d2 (dealer second card face down)
      const draws: Array<{ card: ReturnType<typeof drawCard>['card']; shoe: ReturnType<typeof drawCard>['shoe'] }> = [];
      let s = state.shoe;
      for (let i = 0; i < 3; i++) {
        const r = drawCard(s);
        draws.push(r);
        s = r.shoe;
      }
      const dealerHoleResult = drawCard(s, true); // face down
      s = dealerHoleResult.shoe;

      const playerCards = [draws[0].card, draws[2].card];
      const dealerCards = [draws[1].card, dealerHoleResult.card];

      const hand = makeHandState(playerCards, state.currentBet, true);
      const chips = state.chips - state.currentBet;
      saveChips(chips);

      // Check for player blackjack immediately
      const { isBlackjack } = evaluateHand(playerCards);
      if (isBlackjack) {
        // Reveal dealer hole card and check for dealer BJ
        const revealedDealer = dealerCards.map(c => ({ ...c, faceDown: false }));
        const dealerVal = evaluateHand(revealedDealer);
        const result: RoundResult = dealerVal.isBlackjack ? 'push' : 'blackjack';
        const payout = calcPayout(result, state.currentBet);
        const finalChips = chips + payout;
        saveChips(finalChips);
        return {
          ...state,
          shoe: s,
          playerHands: [{ ...hand, result, canDouble: false, canSplit: false, canSurrender: false }],
          dealerCards: revealedDealer,
          activeHandIndex: 0,
          phase: 'roundOver',
          chips: finalChips,
          lastStrategyFeedback: null,
          shoeStats: { ...state.shoeStats, handsPlayed: state.shoeStats.handsPlayed + 1 },
        };
      }

      // Offer insurance if dealer upcard is Ace (and player doesn't have BJ — handled above)
      const insuranceOffered = dealerCards[0].rank === 'A';

      return {
        ...state,
        shoe: s,
        playerHands: [hand],
        dealerCards,
        activeHandIndex: 0,
        phase: insuranceOffered ? 'insuranceOffered' : 'playerTurn',
        chips,
        insuranceBet: 0,
        lastStrategyFeedback: null,
      };
    }

    case 'HIT': {
      if (state.phase !== 'playerTurn' && state.phase !== 'splitTurn') return state;
      const handIdx = state.activeHandIndex;
      const hand = state.playerHands[handIdx];
      const dealerUpcard = state.dealerCards[0];

      // Capture strategy feedback before drawing
      const correctAction = getBasicStrategyMove(hand.cards, dealerUpcard, hand.canDouble, hand.canSurrender);
      const category = classifyHand(hand.cards);
      const { total: t } = evaluateHand(hand.cards);
      const feedback = {
        playerAction: 'H' as const,
        correctAction,
        isCorrect: correctAction === 'H',
        explanation: getExplanation(correctAction, category, t, rankToNumber(dealerUpcard.rank)),
        handCategory: category,
      };

      const { card, shoe } = drawCard(state.shoe);
      const newCards = [...hand.cards, card];
      const { total, isBust } = evaluateHand(newCards);
      const updatedHand: HandState = {
        ...hand,
        cards: newCards,
        canDouble: false,
        canSplit: false,
        canSurrender: false,
        result: isBust ? 'lose' : null,
      };
      const updatedHands = state.playerHands.map((h, i) => i === handIdx ? updatedHand : h);

      if (isBust) {
        // Move to next split hand or dealer turn
        return advanceAfterBust(state, updatedHands, handIdx, shoe, feedback, total);
      }

      return { ...state, shoe, playerHands: updatedHands, lastStrategyFeedback: feedback };
    }

    case 'STAND': {
      if (state.phase !== 'playerTurn' && state.phase !== 'splitTurn') return state;
      const handIdx = state.activeHandIndex;
      const hand = state.playerHands[handIdx];
      const dealerUpcard = state.dealerCards[0];

      const correctAction = getBasicStrategyMove(hand.cards, dealerUpcard, hand.canDouble, hand.canSurrender);
      const category = classifyHand(hand.cards);
      const { total } = evaluateHand(hand.cards);
      const feedback = {
        playerAction: 'S' as const,
        correctAction,
        isCorrect: correctAction === 'S',
        explanation: getExplanation(correctAction, category, total, rankToNumber(dealerUpcard.rank)),
        handCategory: category,
      };

      const nextHandIdx = handIdx + 1;
      if (nextHandIdx < state.playerHands.length) {
        return { ...state, activeHandIndex: nextHandIdx, phase: 'splitTurn', lastStrategyFeedback: feedback };
      }

      return runDealerPhase(state, state.playerHands, feedback);
    }

    case 'DOUBLE': {
      if (state.phase !== 'playerTurn' && state.phase !== 'splitTurn') return state;
      const handIdx = state.activeHandIndex;
      const hand = state.playerHands[handIdx];
      if (!hand.canDouble) return state;
      const dealerUpcard = state.dealerCards[0];

      const correctAction = getBasicStrategyMove(hand.cards, dealerUpcard, true, hand.canSurrender);
      const category = classifyHand(hand.cards);
      const { total } = evaluateHand(hand.cards);
      const feedback = {
        playerAction: 'D' as const,
        correctAction,
        isCorrect: correctAction === 'D',
        explanation: getExplanation(correctAction, category, total, rankToNumber(dealerUpcard.rank)),
        handCategory: category,
      };

      // Deduct extra bet
      const extraBet = Math.min(hand.bet, state.chips);
      const chips = state.chips - extraBet;
      saveChips(chips);

      const { card, shoe } = drawCard(state.shoe);
      const newCards = [...hand.cards, card];
      const { isBust } = evaluateHand(newCards);
      const updatedHand: HandState = {
        ...hand,
        cards: newCards,
        bet: hand.bet + extraBet,
        canDouble: false,
        canSplit: false,
        canSurrender: false,
        result: isBust ? 'lose' : null,
      };
      const updatedHands = state.playerHands.map((h, i) => i === handIdx ? updatedHand : h);

      // After double, always move to dealer turn for this hand
      const nextHandIdx = handIdx + 1;
      if (!isBust && nextHandIdx < updatedHands.length) {
        return { ...state, shoe, chips, playerHands: updatedHands, activeHandIndex: nextHandIdx, phase: 'splitTurn', lastStrategyFeedback: feedback };
      }
      return runDealerPhase({ ...state, shoe, chips }, updatedHands, feedback);
    }

    case 'SPLIT': {
      if (state.phase !== 'playerTurn') return state;
      const handIdx = state.activeHandIndex;
      const hand = state.playerHands[handIdx];
      if (!hand.canSplit) return state;
      const dealerUpcard = state.dealerCards[0];

      const correctAction = getBasicStrategyMove(hand.cards, dealerUpcard, hand.canDouble, hand.canSurrender);
      const category = classifyHand(hand.cards);
      const { total } = evaluateHand(hand.cards);
      const feedback = {
        playerAction: 'SP' as const,
        correctAction,
        isCorrect: correctAction === 'SP',
        explanation: getExplanation(correctAction, category, total, rankToNumber(dealerUpcard.rank)),
        handCategory: category,
      };

      // Deduct second bet
      const splitBet = Math.min(hand.bet, state.chips);
      const chips = state.chips - splitBet;
      saveChips(chips);

      let shoe = state.shoe;
      const draw1 = drawCard(shoe); shoe = draw1.shoe;
      const draw2 = drawCard(shoe); shoe = draw2.shoe;

      const hand1Cards = [hand.cards[0], draw1.card];
      const hand2Cards = [hand.cards[1], draw2.card];

      const hand1 = makeHandState(hand1Cards, hand.bet);
      const hand2 = makeHandState(hand2Cards, splitBet);

      const newHands = [
        ...state.playerHands.slice(0, handIdx),
        hand1,
        hand2,
        ...state.playerHands.slice(handIdx + 1),
      ];

      return {
        ...state,
        shoe,
        chips,
        playerHands: newHands,
        activeHandIndex: handIdx,
        phase: 'splitTurn',
        lastStrategyFeedback: feedback,
      };
    }

    case 'TAKE_INSURANCE': {
      if (state.phase !== 'insuranceOffered') return state;
      const insuranceBet = Math.floor(state.currentBet / 2);
      if (insuranceBet > state.chips) return resolveInsurance(state); // can't afford → treat as decline
      const chips = state.chips - insuranceBet;
      saveChips(chips);
      return resolveInsurance({ ...state, chips, insuranceBet });
    }

    case 'DECLINE_INSURANCE': {
      if (state.phase !== 'insuranceOffered') return state;
      return resolveInsurance({ ...state, insuranceBet: 0 });
    }

    case 'END_INTERMISSION': {
      if (state.phase !== 'intermission') return state;
      const chips = state.chips <= 0 ? STARTING_CHIPS : state.chips;
      saveChips(chips);
      return {
        ...createInitialState(),
        shoe: createShoe(),
        chips,
        currentBet: state.currentBet,
        shoeStats: { handsPlayed: 0, startingChips: chips },
      };
    }

    case 'SURRENDER': {
      if (state.phase !== 'playerTurn') return state;
      const handIdx = state.activeHandIndex;
      const hand = state.playerHands[handIdx];
      if (!hand.canSurrender) return state;
      const dealerUpcard = state.dealerCards[0];

      const correctAction = getBasicStrategyMove(hand.cards, dealerUpcard, hand.canDouble, true);
      const category = classifyHand(hand.cards);
      const { total } = evaluateHand(hand.cards);
      const feedback = {
        playerAction: 'SR' as const,
        correctAction,
        isCorrect: correctAction === 'SR',
        explanation: getExplanation(correctAction, category, total, rankToNumber(dealerUpcard.rank)),
        handCategory: category,
      };

      // Return half the bet, end the round (no dealer play needed for single surrendered hand)
      const refund = Math.floor(hand.bet / 2);
      const chips = state.chips + refund;
      saveChips(chips);

      const updatedHand: HandState = {
        ...hand,
        canDouble: false,
        canSplit: false,
        canSurrender: false,
        result: 'surrender',
      };

      // Reveal dealer hole card so the result screen shows what would have been
      const revealedDealer = state.dealerCards.map(c => ({ ...c, faceDown: false }));

      return {
        ...state,
        chips,
        playerHands: [updatedHand],
        dealerCards: revealedDealer,
        phase: 'roundOver',
        lastStrategyFeedback: feedback,
        shoeStats: { ...state.shoeStats, handsPlayed: state.shoeStats.handsPlayed + 1 },
      };
    }

    case 'REBET': {
      if (state.currentBet <= 0 || state.chips < state.currentBet) return state;
      if (shouldReshuffle(state.shoe)) {
        return { ...state, phase: 'intermission' };
      }
      // Re-use the same bet and go straight to deal
      const rebetState: GameState = {
        ...createInitialState(),
        shoe: state.shoe,
        chips: state.chips,
        currentBet: state.currentBet,
        shoeStats: state.shoeStats,
      };
      return gameReducer(rebetState, { type: 'DEAL' });
    }

    case 'NEXT_ROUND': {
      if (shouldReshuffle(state.shoe)) {
        return { ...state, phase: 'intermission' };
      }
      const chips = state.chips <= 0 ? STARTING_CHIPS : state.chips;
      saveChips(chips);
      return {
        ...createInitialState(),
        shoe: state.shoe,
        chips,
        currentBet: state.currentBet,
        shoeStats: state.shoeStats,
      };
    }

    case 'RELOAD_CHIPS': {
      saveChips(STARTING_CHIPS);
      return { ...state, chips: STARTING_CHIPS };
    }

    default:
      return state;
  }
}

function resolveInsurance(state: GameState): GameState {
  const revealed = state.dealerCards.map(c => ({ ...c, faceDown: false }));
  const { isBlackjack: dealerBJ } = evaluateHand(revealed);

  if (dealerBJ) {
    // Original bet lost; insurance pays 2:1 (3x the side bet returned)
    const insurancePayout = state.insuranceBet > 0 ? state.insuranceBet * 3 : 0;
    const finalChips = state.chips + insurancePayout;
    saveChips(finalChips);
    const hand = state.playerHands[0];
    const updatedHand: HandState = {
      ...hand,
      result: 'lose',
      canDouble: false,
      canSplit: false,
      canSurrender: false,
    };
    return {
      ...state,
      chips: finalChips,
      dealerCards: revealed,
      playerHands: [updatedHand],
      phase: 'roundOver',
      shoeStats: { ...state.shoeStats, handsPlayed: state.shoeStats.handsPlayed + 1 },
    };
  }

  // No dealer BJ — keep hole card hidden, continue normal play
  return { ...state, phase: 'playerTurn' };
}

function advanceAfterBust(
  state: GameState,
  updatedHands: HandState[],
  handIdx: number,
  shoe: GameState['shoe'],
  feedback: GameState['lastStrategyFeedback'],
  _total: number
): GameState {
  const nextHandIdx = handIdx + 1;
  if (nextHandIdx < updatedHands.length) {
    return { ...state, shoe, playerHands: updatedHands, activeHandIndex: nextHandIdx, phase: 'splitTurn', lastStrategyFeedback: feedback };
  }
  return runDealerPhase({ ...state, shoe }, updatedHands, feedback);
}

function runDealerPhase(
  state: GameState,
  hands: HandState[],
  feedback: GameState['lastStrategyFeedback']
): GameState {
  const { finalCards, shoe } = playDealerHand(state.shoe, state.dealerCards);
  const { total: dealerTotal, isBust: dealerBust } = evaluateHand(finalCards);

  let chips = state.chips;
  const resolvedHands = hands.map(hand => {
    if (hand.result === 'lose') {
      // already busted
      return hand;
    }
    const { total: pt, isBust: pb, isBlackjack: pbj } = evaluateHand(hand.cards);
    const result = determineResult(pt, pb, pbj, dealerTotal, dealerBust);
    chips += calcPayout(result, hand.bet);
    return { ...hand, result };
  });

  saveChips(chips);

  return {
    ...state,
    shoe,
    playerHands: resolvedHands,
    dealerCards: finalCards,
    phase: 'roundOver',
    chips,
    lastStrategyFeedback: feedback,
    shoeStats: { ...state.shoeStats, handsPlayed: state.shoeStats.handsPlayed + 1 },
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

import React from 'react';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const GameContext = createContext<GameContextValue | null>(null);

export function GameStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  return React.createElement(GameContext.Provider, { value: { state, dispatch } }, children);
}

export function useGameContext(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used inside GameStoreProvider');
  return ctx;
}
