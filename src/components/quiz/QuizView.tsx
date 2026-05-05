import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuiz } from '../../hooks/useQuiz';
import { useSettings } from '../../store/settingsStore';
import { useStats } from '../../store/statsStore';
import { useMistakes } from '../../store/mistakesStore';
import { cardsToSituation } from '../../engine/basicStrategy';
import { generateMistakePrompt } from '../../engine/mistakePrompts';
import { QuizCard } from './QuizCard';
import { QuizControls } from './QuizControls';
import { QuizStats } from './QuizStats';
import styles from './QuizView.module.css';

const ACTION_LABEL: Record<string, string> = {
  H: 'Hit',
  S: 'Stand',
  D: 'Double Down',
  SP: 'Split',
  SR: 'Surrender',
};

export function QuizView() {
  const { settings } = useSettings();
  const { recordDecision } = useStats();
  const { mistakes, recordDecision: recordMistakeDecision, clearMistakes } = useMistakes();

  const [practiceMode, setPracticeMode] = useState(false);
  const mistakesCount = Object.keys(mistakes).length;

  // Mistake-based prompt generator. Reads the latest mistakes via a ref so the
  // generator picks fresh entries as the user clears them by answering correctly.
  const mistakesRef = useRef(mistakes);
  mistakesRef.current = mistakes;
  const mistakeGen = useCallback(() => generateMistakePrompt(mistakesRef.current), []);

  const generator = useMemo(
    () => practiceMode ? mistakeGen : undefined,
    [practiceMode, mistakeGen]
  );

  const { quizState, answer, next, reset } = useQuiz(generator);
  const { currentPrompt, score, streak, totalAnswered, lastResult, phase } = quizState;

  // Re-generate the current prompt when toggling modes
  useEffect(() => {
    reset();
  }, [practiceMode, reset]);

  // In practice mode, always show feedback (never auto-skip). In random mode,
  // skip the result panel only when feedbackMode is 'mistakeOnly' and the answer was correct.
  const skipCorrect = !practiceMode && settings.feedbackMode === 'mistakeOnly' && lastResult?.isCorrect === true;

  // Push each quiz answer into the global session stats + mistake tracker (deduped via ref)
  const lastResultRef = useRef(lastResult);
  useEffect(() => {
    if (lastResult && lastResult !== lastResultRef.current) {
      recordDecision(lastResult.isCorrect);
      if (currentPrompt) {
        const situation = cardsToSituation(currentPrompt.playerCards, currentPrompt.dealerUpcard);
        recordMistakeDecision(situation, lastResult.chosen, lastResult.correct);
      }
      lastResultRef.current = lastResult;
    } else if (!lastResult) {
      lastResultRef.current = null;
    }
  }, [lastResult, currentPrompt, recordDecision, recordMistakeDecision]);

  // Auto-advance on correct answers in mistake-only mode
  useEffect(() => {
    if (phase === 'revealed' && skipCorrect) {
      const t = setTimeout(next, 450);
      return () => clearTimeout(t);
    }
  }, [phase, skipCorrect, next]);

  return (
    <div className={styles.wrapper}>
      <QuizStats score={score} streak={streak} totalAnswered={totalAnswered} />

      {/* Mode toggle */}
      <div className={styles.modeBar}>
        <button
          className={`${styles.modeBtn} ${!practiceMode ? styles.modeActive : ''}`}
          onClick={() => setPracticeMode(false)}
        >
          Random
        </button>
        <button
          className={`${styles.modeBtn} ${practiceMode ? styles.modeActive : ''}`}
          onClick={() => setPracticeMode(true)}
          disabled={!practiceMode && mistakesCount === 0}
          title={mistakesCount === 0 ? 'No mistakes recorded yet' : ''}
        >
          Practice Mistakes{mistakesCount > 0 ? ` (${mistakesCount})` : ''}
        </button>
        {practiceMode && mistakesCount > 0 && (
          <button
            className={styles.clearBtn}
            onClick={() => { if (confirm('Clear all tracked mistakes?')) clearMistakes(); }}
            title="Clear mistake log"
          >
            Clear
          </button>
        )}
      </div>

      {!currentPrompt && practiceMode && (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>No mistakes to practice</div>
          <div className={styles.emptyBody}>
            Make a wrong move in Free Play or Quiz and it'll show up here for repeat practice.
            Answer correctly 3 times in a row to graduate it.
          </div>
        </div>
      )}

      {currentPrompt && (
        <>
          <QuizCard prompt={currentPrompt} />
          <QuizControls
            onAnswer={answer}
            disabled={phase === 'revealed'}
            chosen={lastResult?.chosen}
            correct={lastResult?.correct}
          />
        </>
      )}

      {phase === 'revealed' && lastResult && !skipCorrect && (
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
