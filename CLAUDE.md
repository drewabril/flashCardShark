# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies (required first time)
npm run dev          # start dev server at http://localhost:5173
npm run build        # type-check + production build
npm run preview      # preview production build locally
```

There are no tests configured. TypeScript strict mode serves as the primary correctness check — `npm run build` will catch type errors.

## Architecture

This is a client-side-only React 18 + TypeScript + Vite app. No backend, no router, no external state library.

### Layers (bottom to top)

**Engine (`src/engine/`)** — Pure functions with no React dependency. Safe to call anywhere.
- `cards.ts` — suit/rank constants, `cardValue()`, `suitToSymbol()`
- `deck.ts` — 6-deck shoe creation, Fisher-Yates shuffle, `drawCard()` (immutable — always returns new shoe)
- `hand.ts` — `evaluateHand()` (Ace-reduction algorithm), `canDouble()`, `canSplit()`
- `basicStrategy.ts` — Three lookup tables (`HARD`, `SOFT`, `PAIRS`) indexed by player total and dealer upcard (2–11). `getBasicStrategyMove()` applies priority: pair → soft → hard. If strategy says Double but doubling isn't allowed, falls back to Hit.
- `dealer.ts` — Dealer AI: stands on soft 17 (6-deck standard rule)

**State (`src/store/gameStore.ts`)** — Single `useReducer` managing the free-play game loop. The reducer is a pure function; all engine calls happen inside it. Strategy feedback is computed inside the reducer on every player action and stored in `state.lastStrategyFeedback`. Context is exposed via `useGameContext()`. Chip balance is persisted to `localStorage` on every state change.

**Hooks**
- `useGame.ts` — Thin wrapper over `dispatch`; components call named functions (`hit`, `stand`, etc.) never `dispatch` directly.
- `useQuiz.ts` — Self-contained local state for quiz mode. Generates weighted random prompts (biased toward pairs, soft totals, hard 8–16 — avoids boring always-stand hands). Quiz state is not shared with the game store.

**Components (`src/components/`)**
- `layout/AppShell` — Header with mode toggle and chip display. Owns `AppMode` state in `App.tsx`.
- `card/PlayingCard` + `CardBack` — Renders face-up or face-down card. Face-down card triggered by `card.faceDown === true`.
- `freeplay/FreePlayTable` — Assembles dealer area, player hand(s), action buttons, bet controls, and the feedback overlay. Strategy feedback is shown as a modal overlay after each move; the player dismisses it to continue.
- `quiz/QuizView` — Renders prompt → answer buttons → inline result without a modal.

### Key data flow (free play)

```
BetControls → PLACE_BET → DEAL → playerTurn phase
ActionButtons → HIT/STAND/DOUBLE/SPLIT (reducer captures feedback, mutates hand)
  → if bust/stand/double: runDealerPhase() → roundOver
FreePlayTable renders lastStrategyFeedback as overlay → player dismisses → game continues
NEXT_ROUND resets to betting phase, reuses or reshuffles shoe
```

### Split hands

`state.playerHands` is an array. On `SPLIT`, a second `HandState` is pushed. `state.activeHandIndex` tracks which hand is being played. Phase transitions: `playerTurn → splitTurn` when moving between split hands, then `splitTurn → dealerTurn` after both hands are resolved.

### Dealer upcard visibility

`dealerCards[1].faceDown = true` is set at deal time. The hole card is flipped to `faceDown: false` inside `playDealerHand()` (called in `runDealerPhase`). `HandDisplay` filters out face-down cards before computing the total display.
