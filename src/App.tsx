import { useState } from 'react';
import type { AppMode } from './types';
import { GameStoreProvider, useGameContext } from './store/gameStore';
import { SettingsProvider } from './store/settingsStore';
import { StatsProvider } from './store/statsStore';
import { MistakesProvider } from './store/mistakesStore';
import { AppShell } from './components/layout/AppShell';
import { FreePlayTable } from './components/freeplay/FreePlayTable';
import { QuizView } from './components/quiz/QuizView';

function AppContent() {
  const [mode, setMode] = useState<AppMode>('freeplay');
  const { state } = useGameContext();

  return (
    <AppShell mode={mode} onModeChange={setMode} chips={state.chips}>
      {mode === 'freeplay' ? <FreePlayTable /> : <QuizView />}
    </AppShell>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <StatsProvider>
        <MistakesProvider>
          <GameStoreProvider>
            <AppContent />
          </GameStoreProvider>
        </MistakesProvider>
      </StatsProvider>
    </SettingsProvider>
  );
}
