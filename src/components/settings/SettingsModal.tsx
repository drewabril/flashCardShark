import { useSettings } from '../../store/settingsStore';
import type { DeckCount, CardBackStyle, FeltColor, FeedbackMode } from '../../types';
import styles from './SettingsModal.module.css';

interface Props {
  onClose: () => void;
}

const DECK_OPTIONS: DeckCount[] = [1, 2, 4, 6, 8];
const CARD_BACK_OPTIONS: { value: CardBackStyle; label: string; color: string }[] = [
  { value: 'blue',  label: 'Blue',  color: '#1565c0' },
  { value: 'red',   label: 'Red',   color: '#c62828' },
  { value: 'green', label: 'Green', color: '#2e7d32' },
  { value: 'gray',  label: 'Slate', color: '#455a64' },
];
const FELT_OPTIONS: { value: FeltColor; label: string; color: string }[] = [
  { value: 'green',    label: 'Green',    color: '#1a3a2a' },
  { value: 'blue',     label: 'Blue',     color: '#11324c' },
  { value: 'burgundy', label: 'Burgundy', color: '#3a1818' },
  { value: 'charcoal', label: 'Charcoal', color: '#1f2329' },
];

export function SettingsModal({ onClose }: Props) {
  const { settings, updateSettings, resetSettings } = useSettings();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>Settings</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className={styles.body}>
          {/* Game Rules */}
          <section className={styles.section}>
            <h3>Game Rules</h3>
            <p className={styles.note}>Rules apply to dealer behavior and available actions. Strategy advice always assumes the standard 6-deck S17 chart.</p>

            <Row label="Decks">
              <div className={styles.chips}>
                {DECK_OPTIONS.map(n => (
                  <button
                    key={n}
                    className={`${styles.chip} ${settings.numDecks === n ? styles.chipActive : ''}`}
                    onClick={() => updateSettings({ numDecks: n })}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Dealer">
              <div className={styles.chips}>
                <button
                  className={`${styles.chip} ${settings.dealerStandsOnSoft17 ? styles.chipActive : ''}`}
                  onClick={() => updateSettings({ dealerStandsOnSoft17: true })}
                >
                  Stands on soft 17
                </button>
                <button
                  className={`${styles.chip} ${!settings.dealerStandsOnSoft17 ? styles.chipActive : ''}`}
                  onClick={() => updateSettings({ dealerStandsOnSoft17: false })}
                >
                  Hits soft 17
                </button>
              </div>
            </Row>

            <Toggle
              label="Late surrender"
              checked={settings.surrenderAllowed}
              onChange={v => updateSettings({ surrenderAllowed: v })}
            />

            <Toggle
              label="Double after split"
              checked={settings.doubleAfterSplit}
              onChange={v => updateSettings({ doubleAfterSplit: v })}
            />
          </section>

          {/* Appearance */}
          <section className={styles.section}>
            <h3>Appearance</h3>
            <Row label="Card back">
              <div className={styles.swatches}>
                {CARD_BACK_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`${styles.swatch} ${settings.cardBackStyle === opt.value ? styles.swatchActive : ''}`}
                    style={{ background: opt.color }}
                    onClick={() => updateSettings({ cardBackStyle: opt.value })}
                    aria-label={opt.label}
                    title={opt.label}
                  />
                ))}
              </div>
            </Row>
            <Row label="Table felt">
              <div className={styles.swatches}>
                {FELT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`${styles.swatch} ${settings.feltColor === opt.value ? styles.swatchActive : ''}`}
                    style={{ background: opt.color }}
                    onClick={() => updateSettings({ feltColor: opt.value })}
                    aria-label={opt.label}
                    title={opt.label}
                  />
                ))}
              </div>
            </Row>
          </section>

          {/* Feedback */}
          <section className={styles.section}>
            <h3>Feedback</h3>
            <Row label="Mode">
              <div className={styles.chips}>
                <button
                  className={`${styles.chip} ${settings.feedbackMode === 'always' ? styles.chipActive : ''}`}
                  onClick={() => updateSettings({ feedbackMode: 'always' as FeedbackMode })}
                >
                  Always show
                </button>
                <button
                  className={`${styles.chip} ${settings.feedbackMode === 'mistakeOnly' ? styles.chipActive : ''}`}
                  onClick={() => updateSettings({ feedbackMode: 'mistakeOnly' as FeedbackMode })}
                >
                  Only on mistakes
                </button>
              </div>
            </Row>
          </section>

          {/* Training Tools */}
          <section className={styles.section}>
            <h3>Training Tools</h3>
            <Toggle
              label="Hi-Lo count overlay"
              checked={settings.countingMode}
              onChange={v => updateSettings({ countingMode: v })}
            />
            <p className={styles.note}>
              Displays the running count, true count, and decks remaining during Free Play.
              Counts all face-up cards using the Hi-Lo system (2–6 = +1, 7–9 = 0, 10–A = −1).
            </p>
          </section>

          <button className={styles.resetBtn} onClick={resetSettings}>Reset to defaults</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>{label}</div>
      <div className={styles.rowControl}>{children}</div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>{label}</div>
      <div className={styles.rowControl}>
        <button
          role="switch"
          aria-checked={checked}
          className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
          onClick={() => onChange(!checked)}
        >
          <span className={styles.toggleKnob} />
        </button>
      </div>
    </div>
  );
}
