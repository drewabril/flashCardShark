import { useEffect, useRef, useState } from 'react';
import type { HandState } from '../../types';
import { useGame } from '../../hooks/useGame';
import { useSettings } from '../../store/settingsStore';
import { useStats } from '../../store/statsStore';
import { useMistakes } from '../../store/mistakesStore';
import { HandDisplay } from '../hand/HandDisplay';
import { ActionButtons } from '../controls/ActionButtons';
import { BetControls } from '../controls/BetControls';
import { StrategyFeedback } from '../feedback/StrategyFeedback';
import { InsurancePrompt } from './InsurancePrompt';
import { IntermissionScreen } from './IntermissionScreen';
import styles from './FreePlayTable.module.css';

const RESULT_LABEL: Record<string, string> = {
  win: 'You Win!',
  lose: 'Dealer Wins',
  push: 'Push',
  blackjack: 'Blackjack! 🃏',
  surrender: 'Surrendered (½ bet returned)',
};

const RESULT_CLASS: Record<string, string> = {
  win: styles.win,
  lose: styles.lose,
  push: styles.push,
  blackjack: styles.blackjack,
  surrender: styles.lose,
};

export function FreePlayTable() {
  const { state, placeBet, deal, hit, stand, double, split, surrender, takeInsurance, declineInsurance, endIntermission, nextRound, rebet, reloadChips } = useGame();
  const { settings } = useSettings();
  const { stats, recordDecision, recordRound, resetStats } = useStats();
  const { recordDecision: recordMistakeDecision } = useMistakes();
  const { phase, playerHands, dealerCards, chips, currentBet, lastStrategyFeedback, activeHandIndex, shoeStats } = state;

  // Track each strategy decision (lastStrategyFeedback identity changes per action)
  const lastFeedbackRef = useRef(lastStrategyFeedback);
  useEffect(() => {
    if (lastStrategyFeedback && lastStrategyFeedback !== lastFeedbackRef.current) {
      recordDecision(lastStrategyFeedback.isCorrect);
      recordMistakeDecision(
        lastStrategyFeedback.situation,
        lastStrategyFeedback.playerAction,
        lastStrategyFeedback.correctAction,
      );
      lastFeedbackRef.current = lastStrategyFeedback;
    } else if (!lastStrategyFeedback) {
      lastFeedbackRef.current = null;
    }
  }, [lastStrategyFeedback, recordDecision, recordMistakeDecision]);

  // Track round results when entering roundOver
  const lastRoundIdRef = useRef<HandState[] | null>(null);
  useEffect(() => {
    if (phase === 'roundOver' && playerHands !== lastRoundIdRef.current) {
      for (const hand of playerHands) {
        if (!hand.result) continue;
        // chip delta = payout - bet (where payout is what was returned to chips)
        // simplified: derive from result + bet
        let delta = 0;
        if (hand.result === 'win')        delta =  hand.bet;
        else if (hand.result === 'blackjack') delta = Math.floor(hand.bet * 1.5);
        else if (hand.result === 'lose')  delta = -hand.bet;
        else if (hand.result === 'surrender') delta = -Math.ceil(hand.bet / 2);
        // push: 0
        recordRound(hand.result, delta);
      }
      lastRoundIdRef.current = playerHands;
    } else if (phase === 'betting') {
      lastRoundIdRef.current = null;
    }
  }, [phase, playerHands, recordRound]);

  const [showFeedback, setShowFeedback] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // When feedback is set from an action that ends the player turn, show it then auto-continue
  const handleAction = (action: () => void) => {
    action();
    setShowFeedback(true);
    setPendingAction(null);
  };

  const handleFeedbackContinue = () => {
    setShowFeedback(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const activeHand = playerHands[activeHandIndex];
  const isBetting = phase === 'betting';
  const isPlayerTurn = phase === 'playerTurn' || phase === 'splitTurn';
  const isRoundOver = phase === 'roundOver';

  // Aggregate result for single-hand display
  const singleResult = playerHands.length === 1 ? playerHands[0].result : null;

  return (
    <div className={styles.table}>
      {/* Dealer */}
      <div className={styles.dealerArea}>
        {dealerCards.length > 0 && (
          <div className={styles.felt}>
            <HandDisplay
              cards={dealerCards}
              label="Dealer"
              hideTotal={phase === 'playerTurn' || phase === 'splitTurn'}
            />
          </div>
        )}
      </div>

      {/* Player hands */}
      {playerHands.length > 0 && (
        <div className={styles.playerArea}>
          {playerHands.length === 1 ? (
            <HandDisplay
              cards={playerHands[0].cards}
              label="Your Hand"
              isActive={isPlayerTurn}
            />
          ) : (
            <div className={styles.splitHands}>
              {playerHands.map((hand, i) => (
                <HandDisplay
                  key={i}
                  cards={hand.cards}
                  label={`Hand ${i + 1}`}
                  isActive={isPlayerTurn && i === activeHandIndex}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Round over: results */}
      {isRoundOver && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {playerHands.length === 1 && singleResult ? (
            <div className={`${styles.resultBanner} ${RESULT_CLASS[singleResult] ?? ''}`}>
              {RESULT_LABEL[singleResult] ?? singleResult}
            </div>
          ) : (
            playerHands.map((hand, i) => hand.result && (
              <div key={i} className={`${styles.resultBanner} ${RESULT_CLASS[hand.result] ?? ''}`}>
                Hand {i + 1}: {RESULT_LABEL[hand.result]}
              </div>
            ))
          )}
          {currentBet > 0 && chips >= currentBet && (
            <button className={styles.rebetBtn} onClick={rebet}>
              Rebet ${currentBet}
            </button>
          )}
          <button className={styles.nextBtn} onClick={nextRound}>
            Next Hand
          </button>
        </div>
      )}

      {/* Betting controls */}
      {isBetting && (
        chips > 0 ? (
          <BetControls
            chips={chips}
            currentBet={currentBet}
            onAddBet={amt => placeBet(currentBet + amt)}
            onClearBet={() => placeBet(0)}
            onDeal={deal}
          />
        ) : (
          <div className={styles.reloadNotice}>
            <p>You're out of chips!</p>
            <button className={styles.reloadBtn} onClick={reloadChips}>
              Reload $1,000
            </button>
          </div>
        )
      )}

      {/* Action buttons */}
      {isPlayerTurn && activeHand && (
        <ActionButtons
          onHit={() => handleAction(hit)}
          onStand={() => handleAction(stand)}
          onDouble={() => handleAction(double)}
          onSplit={() => handleAction(split)}
          onSurrender={() => handleAction(surrender)}
          canDouble={activeHand.canDouble}
          canSplit={activeHand.canSplit}
          canSurrender={activeHand.canSurrender && phase === 'playerTurn'}
        />
      )}

      {/* Strategy feedback overlay (suppressed on correct in mistake-only mode) */}
      {showFeedback && lastStrategyFeedback &&
       (settings.feedbackMode === 'always' || !lastStrategyFeedback.isCorrect) && (
        <StrategyFeedback
          feedback={lastStrategyFeedback}
          onContinue={handleFeedbackContinue}
          continueLabel={isRoundOver ? 'See Result' : 'Continue'}
        />
      )}

      {/* Insurance prompt */}
      {phase === 'insuranceOffered' && (
        <InsurancePrompt
          bet={currentBet}
          onTake={takeInsurance}
          onDecline={declineInsurance}
        />
      )}

      {/* Shoe intermission */}
      {phase === 'intermission' && (
        <IntermissionScreen
          handsPlayed={shoeStats.handsPlayed}
          netChips={chips - shoeStats.startingChips}
          sessionStats={stats}
          onContinue={endIntermission}
          onResetStats={resetStats}
        />
      )}
    </div>
  );
}
