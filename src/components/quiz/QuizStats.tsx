import styles from './QuizStats.module.css';

interface Props {
  score: number;
  streak: number;
  totalAnswered: number;
}

export function QuizStats({ score, streak, totalAnswered }: Props) {
  const accuracy = totalAnswered > 0
    ? Math.round((score / totalAnswered) * 100)
    : 0;

  return (
    <div className={styles.stats}>
      <div className={styles.stat}>
        <span className={styles.value}>{score}</span>
        <span className={styles.label}>Correct</span>
      </div>
      <div className={styles.stat}>
        <span className={`${styles.value} ${styles.accuracy}`}>{accuracy}%</span>
        <span className={styles.label}>Accuracy</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.value}>🔥{streak}</span>
        <span className={styles.label}>Streak</span>
      </div>
    </div>
  );
}
