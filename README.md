# flashCardShark 🦈

A blackjack basic strategy trainer that helps you learn and practice optimal play through two modes: free play with real-time feedback, and a flashcard-style quiz.

## Features

**Free Play Mode**
- Full 6-deck blackjack with standard casino rules (dealer stands on soft 17)
- Hit, Stand, Double Down, and Split
- Dealer plays out every hand to completion
- After each decision, an overlay tells you whether your move was correct and explains the right play
- Chip balance with simulated betting, persisted across sessions

**Quiz Mode**
- Flashcard-style prompts: see a hand, pick the correct basic strategy move
- Weighted toward interesting situations — pairs, soft totals, and stiff hands (8–16)
- Tracks score, accuracy, and streak

## Running Locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build
```

Works in any modern browser on desktop or mobile.

## Basic Strategy Reference

The engine encodes full basic strategy for 6-deck, dealer-stands-soft-17 rules:

| Hand Type | Example | Key Rule |
|-----------|---------|----------|
| Hard 11 | 7+4 | Always Double |
| Hard 10 | 6+4 | Double vs 2–9, Hit vs 10/A |
| Soft 18 | A+7 | Double vs 3–6, Stand vs 2/7/8, Hit vs 9/10/A |
| Pair of 8s | 8+8 | Always Split |
| Pair of 5s | 5+5 | Never Split — treat as hard 10 |
| Hard 12 | T+2 | Stand vs 4–6, Hit otherwise |

## Tech Stack

- React 18 + TypeScript
- Vite
- CSS Modules
- No backend — fully client-side
