import { useReducer, useEffect } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return {
        loading: true,
        data: null,
        error: null,
      };
    case 'SUCCESS':
      return {
        loading: false,
        data: action.data,
        error: null,
      };
    case 'ERROR':
      return {
        loading: false,
        data: null,
        error: action.error,
      };
    default:
      return new Error(`Unhandled action type: ${action.type}`);
  }
}

/**
 *
 * @param {Function} callback 데이터를 불러오는 등 async/await 작업을 한 뒤, 결과값을 반환하는 함수
 * @param {Array} deps useEffect의 의존성 배열. 이 안의 값이 바뀔 때마다 callback으로 준 작업이 다시 시작된다.
 * @param {boolean} skip 자동으로 데이터 통신이 이루어지는 것을 조절할 수 있는 옵션. true를 주면 작업을 건너뛴다.
 * @returns state(상태 - loading, data, error를 갖고 있음)와 refetch 하고 싶을 때 호출할 수 있는 함수를 반환한다.
 */
function useAsync(callback, deps = [], skip = false) {
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    data: null,
    error: null,
  });

  const fetchData = async () => {
    try {
      dispatch({ type: 'LOADING' });

      const data = await callback();
      dispatch({ type: 'SUCCESS', data });
    } catch (e) {
      dispatch({ type: 'ERROR', error: e });
    }
  };

  useEffect(() => {
    if (skip) return;
    fetchData();
    // eslint-disable-next-line
  }, deps);

  return [state, fetchData];
}

export default useAsync;
