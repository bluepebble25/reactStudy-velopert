// Action Types
const INCREASE = 'counter/INCREASE';
const DECREASE = 'counter/DECREASE';

// Action creators
export const increase = () => ({ type: INCREASE });
export const decrease = () => ({ type: DECREASE });

// 비동기로 1초 지연 dispatch를 하는 thunk 함수
export const increaseAsync = () => (dispatch) => {
  setTimeout(() => dispatch(increase()), 1000);
};

export const decreaseAsync = () => (dispatch) => {
  setTimeout(() => dispatch(decrease()), 1000);
};

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
