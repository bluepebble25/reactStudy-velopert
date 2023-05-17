/**
 * thunk를 생성하는 함수.
 * @param {*} type action의 type 명
 * @param {function} promiseCreator API 호출 등 비동기 작업을 하는 함수를 실행하지 않고 전달한다.
 * @returns thunk 함수
 */
export const createPromiseThunk = (type, promiseCreator) => {
  const [SUCCESS, ERROR] = [`${type}_SUCCESS`, `${type}_ERROR`];
  /* 
    param은 
    const getPostById = (id) => async(dispatch) => { ... }
    같은 상황을 위한 인자.
  */
  return (param) => async (dispatch) => {
    dispatch({ type, param });
    try {
      const payload = await promiseCreator(param);
      dispatch({ type: SUCCESS, payload });
    } catch (e) {
      dispatch({ type: ERROR, payload: e, error: true });
    }
  };
};

// reducer 초기값, 반환 값 설정 등에 사용되는 util 함수
export const reducerUtils = {
  initial: (initialData = null) => ({
    loading: false,
    data: initialData,
    error: false,
  }),
  loading: (prevState = null) => ({
    loading: true,
    data: prevState,
    error: null,
  }),
  success: (payload) => ({
    loading: false,
    data: payload,
    error: null,
  }),
  error: (error) => ({
    loading: false,
    data: null,
    error: error,
  }),
};

/**
 * reducer에서 들어온 action에 의해 변경된 state를 생성하는 함수
 * @param {*} type action의 type 명 - ex) GET_POSTS
 * @param {*} key action을 통해 변경할 모듈 명 - ex) posts, post
 */
export const handleAsyncAction = (type, key, keepData = false) => {
  const [SUCCESS, ERROR] = [`${type}_SUCCESS`, `${type}_ERROR`];

  return (state, action) => {
    switch (action.type) {
      case type:
        return {
          ...state,
          [key]: reducerUtils.loading(keepData ? state[key].data : null),
        };
      case SUCCESS:
        return {
          ...state,
          [key]: reducerUtils.success(action.payload),
        };
      case ERROR:
        return {
          ...state,
          [key]: reducerUtils.error(action.error),
        };
      default:
        return state;
    }
  };
};
