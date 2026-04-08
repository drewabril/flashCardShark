import type { QuizPrompt } from '../../types';
import { HandDisplay } from '../hand/HandDisplay';
import styles from './QuizCard.module.css';

interface Props {
  prompt: QuizPrompt;
}

export function QuizCard({ prompt }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.prompt}>What's the correct basic strategy move?</div>
      <div className={styles.hands}>
        <HandDisplay cards={prompt.playerCards} label="Your Hand" />
        <span className={styles.vs}>vs</span>
        <HandDisplay cards={[prompt.dealerUpcard]} label="Dealer Shows" hideTotal />
      </div>
    </div>
  );
}
