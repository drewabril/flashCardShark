import { useState } from 'react';
import { useGame } from '../../hooks/useGame';
import { HandDisplay } from '../hand/HandDisplay';
import { ActionButtons } from '../controls/ActionButtons';
import { BetControls } from '../controls/BetControls';
import { StrategyFeedback } from '../feedback/StrategyFeedback';
import styles from './FreePlayTable.module.css';

const RESULT_LABEL: Record<string, string> = {
  win: 'You Win!',
  lose: 'Dealer Wins',
  push: 'Push',
  blackjack: 'Blackjack! 🃏',
};

const RESULT_CLASS: Record<string, string> = {
  win: styles.win,
  lose: styles.lose,
  push: styles.push,
  blackjack: styles.blackjack,
};

export function FreePlayTable() {
  const { state, placeBet, deal, hit, stand, double, split, nextRound, reloadChips } = useGame();
  const { phase, playerHands, dealerCards, chips, currentBet, lastStrategyFeedback, activeHandIndex } = state;

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
          canDouble={activeHand.canDouble}
          canSplit={activeHand.canSplit}
        />
      )}

      {/* Strategy feedback overlay */}
      {showFeedback && lastStrategyFeedback && (
        <StrategyFeedback
          feedback={lastStrategyFeedback}
          onContinue={handleFeedbackContinue}
          continueLabel={isRoundOver ? 'See Result' : 'Continue'}
        />
      )}
    </div>
  );
}
