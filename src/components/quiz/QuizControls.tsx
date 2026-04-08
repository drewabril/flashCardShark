import type { StrategyAction } from '../../types';
import styles from './QuizControls.module.css';

interface Props {
  onAnswer: (action: StrategyAction) => void;
  disabled?: boolean;
  chosen?: StrategyAction;
  correct?: StrategyAction;
}

const ACTIONS: { action: StrategyAction; label: string; cls: string }[] = [
  { action: 'H',  label: 'Hit',    cls: styles.hit    },
  { action: 'S',  label: 'Stand',  cls: styles.stand  },
  { action: 'D',  label: 'Double', cls: styles.double },
  { action: 'SP', label: 'Split',  cls: styles.split  },
];

export function QuizControls({ onAnswer, disabled, chosen, correct }: Props) {
  const revealed = chosen !== undefined && correct !== undefined;

  const extraClass = (action: StrategyAction): string => {
    if (!revealed) return '';
    if (action === correct && action === chosen) return styles.correct;
    if (action === chosen && chosen !== correct) return styles.wrong;
    if (action === correct && chosen !== correct) return styles.missed;
    return '';
  };

  return (
    <div className={styles.grid}>
      {ACTIONS.map(({ action, label, cls }) => (
        <button
          key={action}
          className={`${styles.btn} ${cls} ${extraClass(action)}`}
          onClick={() => onAnswer(action)}
          disabled={disabled}
          aria-label={label}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
