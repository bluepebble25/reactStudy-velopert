// Action Types
const INCREASE = 'counter/INCREASE';
const DECREASE = 'counter/DECREASE';

// Action creators
export const increase = () => ({ type: INCREASE });
export const decrease = () => ({ type: DECREASE });

// initial state
const initialState = 0;

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case INCREASE:
      return state + 1;
    case DECREASE:
      return state - 1;
    default:
      return state;
  }
}
