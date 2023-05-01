import { ActionType } from '../contexts/UsersContext';

/* ----- dispatch + API 요청 함수 -----  */
export default function createAsyncDispatcher(type, promiseFn) {
  const SUCCESS = ActionType[`${type}_SUCCESS`];
  const ERROR = ActionType[`${type}_ERROR`];

  // fetch 함수와 loading 상황을 dispatch로 관리하는 로직을 결합한 wrapper 함수를 생성, 반환
  // dispatch 이외의 파라미터인 rest를 spread로 넣어줌
  async function actionHandler(dispatch, ...rest) {
    dispatch({ type });
    try {
      const data = await promiseFn(...rest);
      dispatch({ type: SUCCESS, data });
    } catch (e) {
      dispatch({ type: ERROR, error: e });
    }
  }

  return actionHandler;
}

/* ----- state 객체들 ----- */
const loadingState = {
  loading: true,
  data: null,
  error: null,
};

const success = (data) => {
  return {
    loading: false,
    data,
    error: null,
  };
};

const error = (error) => {
  return {
    loading: false,
    data: null,
    error,
  };
};

/* ----- reducer에서 return할 state 간편 생성기 ----- */
/* type은 액션 타입, stateKey는 state의 key - ex) createAsyncHandler(GET_USERS, users) */
export function createAsyncHandler(type, stateKey) {
  const SUCCESS = `${type}_SUCCESS`;
  const ERROR = `${type}_ERROR`;

  function handler(state, action) {
    switch (action.type) {
      case type:
        return {
          ...state,
          [stateKey]: loadingState,
        };
      case SUCCESS:
        return {
          ...state,
          [stateKey]: success(action.data),
        };
      case ERROR:
        return {
          ...state,
          [stateKey]: error(action.error),
        };
      default:
        return state;
    }
  }
  return handler;
}
