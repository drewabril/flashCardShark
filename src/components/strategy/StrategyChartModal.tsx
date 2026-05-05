import { useEffect, useState } from 'react';
import type { StrategyAction } from '../../types';
import { HARD, SOFT, PAIRS, SURRENDER_HARD } from '../../engine/basicStrategy';
import styles from './StrategyChartModal.module.css';

type Tab = 'hard' | 'soft' | 'pairs';

// Dealer columns: 2-10, then Ace (11)
const DEALER_COLS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const DEALER_LABELS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];

// Hard rows: 5–17 (5-8 are always Hit, but include for completeness from 8)
const HARD_ROWS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

// Soft rows: A2 (13) through A9 (20)
const SOFT_ROWS = [13, 14, 15, 16, 17, 18, 19, 20];
const SOFT_LABELS: Record<number, string> = {
  13: 'A-2', 14: 'A-3', 15: 'A-4', 16: 'A-5',
  17: 'A-6', 18: 'A-7', 19: 'A-8', 20: 'A-9',
};

// Pair rows (display rank, pair value in table)
const PAIR_ROWS: Array<{ rank: string; label: string; dealerMapKey: string }> = [
  { rank: 'A', label: 'A-A', dealerMapKey: 'A' },
  { rank: '2', label: '2-2', dealerMapKey: '2' },
  { rank: '3', label: '3-3', dealerMapKey: '3' },
  { rank: '4', label: '4-4', dealerMapKey: '4' },
  { rank: '5', label: '5-5', dealerMapKey: '5' },
  { rank: '6', label: '6-6', dealerMapKey: '6' },
  { rank: '7', label: '7-7', dealerMapKey: '7' },
  { rank: '8', label: '8-8', dealerMapKey: '8' },
  { rank: '9', label: '9-9', dealerMapKey: '9' },
  { rank: '10', label: '10-10', dealerMapKey: '10' },
];

const ACTION_LABEL: Record<StrategyAction, string> = {
  H: 'Hit', S: 'Stand', D: 'Double', SP: 'Split', SR: 'Surrender',
};

function getHardAction(total: number, dealerNum: number): StrategyAction {
  // Surrender overrides the hard table for specific cells
  if (SURRENDER_HARD[total]?.[dealerNum]) return 'SR';
  const row = HARD[Math.min(total, 17)];
  return (row?.[dealerNum] ?? 'S') as StrategyAction;
}

interface Props {
  onClose: () => void;
}

export function StrategyChartModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('hard');

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Basic Strategy Chart</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <p className={styles.subtitle}>6 decks · Dealer stands soft 17 · Late surrender · DAS</p>

        {/* Legend */}
        <div className={styles.legend}>
          {(['H', 'S', 'D', 'SP', 'SR'] as StrategyAction[]).map(a => (
            <span key={a} className={`${styles.legendPill} ${styles[`cell${a}`]}`}>
              {ACTION_LABEL[a]}
            </span>
          ))}
        </div>

        {/* Tab bar */}
        <div className={styles.tabs}>
          {(['hard', 'soft', 'pairs'] as Tab[]).map(t => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'hard' ? 'Hard Totals' : t === 'soft' ? 'Soft Totals' : 'Pairs'}
            </button>
          ))}
        </div>

        {/* Tables */}
        <div className={styles.tableWrap}>
          {tab === 'hard' && (
            <table className={styles.chart}>
              <thead>
                <tr>
                  <th className={styles.cornerCell}>Player</th>
                  {DEALER_LABELS.map((l, i) => (
                    <th key={i} className={styles.dealerHeader}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HARD_ROWS.map(total => (
                  <tr key={total}>
                    <td className={styles.rowHeader}>{total}</td>
                    {DEALER_COLS.map(d => {
                      const action = getHardAction(total, d);
                      return (
                        <td key={d} className={`${styles.cell} ${styles[`cell${action}`]}`} title={ACTION_LABEL[action]}>
                          {action}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'soft' && (
            <table className={styles.chart}>
              <thead>
                <tr>
                  <th className={styles.cornerCell}>Player</th>
                  {DEALER_LABELS.map((l, i) => (
                    <th key={i} className={styles.dealerHeader}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SOFT_ROWS.map(total => (
                  <tr key={total}>
                    <td className={styles.rowHeader}>{SOFT_LABELS[total]}</td>
                    {DEALER_COLS.map(d => {
                      const action = (SOFT[total]?.[d] ?? 'S') as StrategyAction;
                      return (
                        <td key={d} className={`${styles.cell} ${styles[`cell${action}`]}`} title={ACTION_LABEL[action]}>
                          {action}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'pairs' && (
            <table className={styles.chart}>
              <thead>
                <tr>
                  <th className={styles.cornerCell}>Pair</th>
                  {DEALER_LABELS.map((l, i) => (
                    <th key={i} className={styles.dealerHeader}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PAIR_ROWS.map(({ label, dealerMapKey }) => (
                  <tr key={label}>
                    <td className={styles.rowHeader}>{label}</td>
                    {DEALER_COLS.map(d => {
                      const row = (PAIRS as Record<string, Record<number, string>>)[dealerMapKey];
                      const action = (row?.[d] ?? 'S') as StrategyAction;
                      return (
                        <td key={d} className={`${styles.cell} ${styles[`cell${action}`]}`} title={ACTION_LABEL[action]}>
                          {action}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
