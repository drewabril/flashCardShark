import { useGameContext } from '../store/gameStore';

export function useGame() {
  const { state, dispatch } = useGameContext();

  return {
    state,
    placeBet: (amount: number) => dispatch({ type: 'PLACE_BET', amount }),
    deal: () => dispatch({ type: 'DEAL' }),
    hit: () => dispatch({ type: 'HIT' }),
    stand: () => dispatch({ type: 'STAND' }),
    double: () => dispatch({ type: 'DOUBLE' }),
    split: () => dispatch({ type: 'SPLIT' }),
    nextRound: () => dispatch({ type: 'NEXT_ROUND' }),
    reloadChips: () => dispatch({ type: 'RELOAD_CHIPS' }),
  };
}
