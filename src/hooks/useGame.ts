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
    surrender: () => dispatch({ type: 'SURRENDER' }),
    takeInsurance: () => dispatch({ type: 'TAKE_INSURANCE' }),
    declineInsurance: () => dispatch({ type: 'DECLINE_INSURANCE' }),
    endIntermission: () => dispatch({ type: 'END_INTERMISSION' }),
    nextRound: () => dispatch({ type: 'NEXT_ROUND' }),
    rebet: () => dispatch({ type: 'REBET' }),
    reloadChips: () => dispatch({ type: 'RELOAD_CHIPS' }),
  };
}
