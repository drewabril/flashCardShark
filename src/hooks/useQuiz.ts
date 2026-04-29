import { useState, useCallback, useRef } from 'react';
import type { QuizState, QuizPrompt, StrategyAction, Card, Rank } from '../types';
import { createShoe, drawCard } from '../engine/deck';
import { getBasicStrategyMove, getExplanation, classifyHand } from '../engine/basicStrategy';
import { evaluateHand } from '../engine/hand';

// Weighted rank pool: bias toward interesting strategic situations
const WEIGHTED_RANKS: Rank[] = [
  // Pairs (high interest)
  'A', 'A', '8', '8', '9', '9', '7', '7', '6', '6',
  // Double-down hands
  '2', '2', '3', '3', '4', '4',   // produces 9,10,11 combos
  // Hard stiff hands (most decisions)
  '5', '5', '6', '6', '7', '7',
  // Other
  'J', 'Q', 'K', '10',
];

function randomRank(): Rank {
  return WEIGHTED_RANKS[Math.floor(Math.random() * WEIGHTED_RANKS.length)];
}

function generatePrompt(): QuizPrompt {
  let shoe = createShoe();

  // Occasionally force a pair (~30% of the time)
  const forcePair = Math.random() < 0.3;
  // Occasionally force a soft hand (~20% of the time)
  const forceSoft = !forcePair && Math.random() < 0.25;

  let p1: Card, p2: Card, upcard: Card;

  if (forcePair) {
    const rank = randomRank();
    p1 = { suit: 'S', rank, faceDown: false };
    p2 = { suit: 'H', rank, faceDown: false };
  } else if (forceSoft) {
    p1 = { suit: 'S', rank: 'A', faceDown: false };
    const softRank = (['2','3','4','5','6','7','8','9'] as Rank[])[Math.floor(Math.random() * 8)];
    p2 = { suit: 'H', rank: softRank, faceDown: false };
  } else {
    const r1 = drawCard(shoe); shoe = r1.shoe;
    const r2 = drawCard(shoe); shoe = r2.shoe;
    p1 = { ...r1.card, faceDown: false };
    p2 = { ...r2.card, faceDown: false };
  }

  const dealerDraw = drawCard(shoe); shoe = dealerDraw.shoe;
  upcard = { ...dealerDraw.card, faceDown: false };

  // Avoid boring hand: always-stand (hard 17+) unless soft or pair
  const playerCards = [p1, p2];
  const { total, isSoft } = evaluateHand(playerCards);
  const { isPair } = evaluateHand(playerCards);
  if (total >= 17 && !isSoft && !isPair) {
    // regenerate
    return generatePrompt();
  }

  const correctAnswer = getBasicStrategyMove(playerCards, upcard, true);
  return { playerCards, dealerUpcard: upcard, correctAnswer };
}

/**
 * @param customGenerator Optional source of prompts (e.g. mistakes-based).
 *   May return null to signal "no prompt available" (empty mistake bag).
 *   When null, the quiz state currentPrompt becomes null and the view should
 *   render an empty state.
 */
export function useQuiz(customGenerator?: () => QuizPrompt | null) {
  // Hold latest generator in a ref so `next()` always uses fresh closure
  const genRef = useRef<() => QuizPrompt | null>(customGenerator ?? generatePrompt);
  genRef.current = customGenerator ?? generatePrompt;

  const [quizState, setQuizState] = useState<QuizState>(() => ({
    currentPrompt: genRef.current(),
    score: 0,
    streak: 0,
    totalAnswered: 0,
    lastResult: null,
    phase: 'answering',
  }));

  const answer = useCallback((chosen: StrategyAction) => {
    setQuizState(prev => {
      if (!prev.currentPrompt || prev.phase !== 'answering') return prev;
      const { playerCards, correctAnswer } = prev.currentPrompt;
      const isCorrect = chosen === correctAnswer;
      const category = classifyHand(playerCards);
      const { total } = evaluateHand(playerCards);

      const explanation = getExplanation(correctAnswer, category, total, total);

      return {
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        streak: isCorrect ? prev.streak + 1 : 0,
        totalAnswered: prev.totalAnswered + 1,
        lastResult: { chosen, correct: correctAnswer, isCorrect, explanation },
        phase: 'revealed',
      };
    });
  }, []);

  const next = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      currentPrompt: genRef.current(),
      lastResult: null,
      phase: 'answering',
    }));
  }, []);

  /** Force a fresh prompt with the current generator. Used when toggling modes. */
  const reset = useCallback(() => {
    setQuizState({
      currentPrompt: genRef.current(),
      score: 0,
      streak: 0,
      totalAnswered: 0,
      lastResult: null,
      phase: 'answering',
    });
  }, []);

  return { quizState, answer, next, reset };
}
