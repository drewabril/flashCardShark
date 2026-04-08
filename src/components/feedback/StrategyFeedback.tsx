import type { StrategyFeedback as StrategyFeedbackType } from '../../types';
import styles from './StrategyFeedback.module.css';

const ACTION_LABEL: Record<string, string> = {
  H: 'Hit',
  S: 'Stand',
  D: 'Double Down',
  SP: 'Split',
};

interface Props {
  feedback: StrategyFeedbackType;
  onContinue: () => void;
  continueLabel?: string;
}

export function StrategyFeedback({ feedback, onContinue, continueLabel = 'Continue' }: Props) {
  const { isCorrect, playerAction, correctAction, explanation } = feedback;

  return (
    <div className={styles.overlay} onClick={onContinue}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>
        <div className={styles.icon}>{isCorrect ? '✅' : '❌'}</div>
        <div className={`${styles.verdict} ${isCorrect ? styles.correct : styles.wrong}`}>
          {isCorrect ? 'Correct!' : `Incorrect — should ${ACTION_LABEL[correctAction]}`}
        </div>
        {!isCorrect && (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            You chose: {ACTION_LABEL[playerAction]}
          </div>
        )}
        <div className={styles.explanation}>{explanation}</div>
        <div className={styles.actions}>
          <button className={styles.continueBtn} onClick={onContinue}>
            {continueLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
