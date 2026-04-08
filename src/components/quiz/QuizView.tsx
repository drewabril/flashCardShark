import { useQuiz } from '../../hooks/useQuiz';
import { QuizCard } from './QuizCard';
import { QuizControls } from './QuizControls';
import { QuizStats } from './QuizStats';
import styles from './QuizView.module.css';

const ACTION_LABEL: Record<string, string> = {
  H: 'Hit',
  S: 'Stand',
  D: 'Double Down',
  SP: 'Split',
};

export function QuizView() {
  const { quizState, answer, next } = useQuiz();
  const { currentPrompt, score, streak, totalAnswered, lastResult, phase } = quizState;

  if (!currentPrompt) return null;

  return (
    <div className={styles.wrapper}>
      <QuizStats score={score} streak={streak} totalAnswered={totalAnswered} />
      <QuizCard prompt={currentPrompt} />
      <QuizControls
        onAnswer={answer}
        disabled={phase === 'revealed'}
        chosen={lastResult?.chosen}
        correct={lastResult?.correct}
      />
      {phase === 'revealed' && lastResult && (
        <div className={styles.result}>
          <div className={`${styles.verdict} ${lastResult.isCorrect ? styles.correct : styles.wrong}`}>
            {lastResult.isCorrect
              ? 'Correct!'
              : `Incorrect — correct move: ${ACTION_LABEL[lastResult.correct]}`}
          </div>
          <div className={styles.explanation}>{lastResult.explanation}</div>
          <button className={styles.nextBtn} onClick={next}>
            Next Hand
          </button>
        </div>
      )}
    </div>
  );
}
