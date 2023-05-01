# api-integration

만들면서 배운 점 정리

## 📗 api 요청 상태 관리하기 - loading, error

데이터 요청 상태는 성공만 있지 않다.

- loading 중 / loading 완료
- error 발생 / 성공
  으로 나누어 더 상세하게 요청 상황을 관리할 필요가 있다.

그리고 loading, error, 데이터 없음에 따라 알맞은 요소를 화면에 렌더링하자. 그러면 사용자에게 데이터 요청이 어떻게 이루어지고 있는지 상황을 공유할 수 있다.

```js
function App() {
  // '데이터 저장 / loading 여부 / error 여부'를 관리할 state를 세 가지 둔다.
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      // 요청이 시작하면 users와 error를 null로 초기화하고, loading 상태를 true로 설정한다.
      setUsers(null);
      setError(null);
      setLoading(true);

      const res = await axios.get('https://jsonplaceholder.typicode.com/users');
      setUsers(res.data);
    } catch (e) {
      setError(e);
    }
    // 에러 없이 get이 끝났다면 loading 상태를 false로 바꾼다.
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div>...loading 중</div>;
  if (error) return <div>에러가 발생했습니다.</div>;
  if (!users) return <div>user 조회 결과 데이터가 0개입니다.</div>;
  return (
    <>
      <ul>
        {users.map((user) => (
          <li>
            {user.name} ({user.username})
          </li>
        ))}
      </ul>
      <button onClick={fetchUsers}>다시 불러오기</button>
    </>
  );
}
```

버튼을 눌러 다시 `fetchUsers`를 호출하는 것처럼 데이터를 다시 불러오면 `loading / error / 데이터 존재 여부` 다시 상태가 업데이트된다.

## 📗 useReducer로 loading, data, error 상태 관리

dispatch로 action에 따라 상태를 관리하기 위해 다음과 같이 바꾸자. 그러면 상황에 따라 일일이 어떤 `useState`를 어떻게 바꿀지 신경쓰지 않고 `action`명 만으로도 간편하게 데이터를 변경할 수 있다.

```js
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

function App() {
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    data: null,
    error: null,
  });

  const fetchUsers = async () => {
    try {
      dispatch({ type: 'LOADING' });

      const res = await axios.get('https://jsonplaceholder.typicode.com/users');
      dispatch({ type: 'SUCCESS', data: res.data });
    } catch (e) {
      dispatch({ type: 'ERROR' });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const { data: users, loading, error } = state;
  if (loading) return <div>...loading 중</div>;
  if (error) return <div>에러가 발생했습니다.</div>;
  if (!users) return null;
  return (
    // ...
  )
}
```

## 📗 useAsync hook - async로 데이터 fetch해오는 로직 일반화

### 1. 로직 일반화 해 hook으로 만들기

user 정보를 가져오기 위해 우리는 이런 과정을 거친다.

1. async/await으로 user 정보를 가져오는 `fetchUsers` 함수를 작성하고,
2. `fetchUsers`를 `useEffect()`에서 호출한 다음,
3. 다시 호출할 필요가 있을 때 `fetchUsers` 함수를 다시 호출한다.

근데 만약 새로 post 정보를 가져오고 싶다고 해보자. 1~3 과 똑같은 코드를 작성해야 한다. 이 과정을 간편하게 하기 위해 이를 일반화해서 hook으로 만들어보자.

일반화 하면 다음과 같다.

1. async/await로 어떤 곳에 요청을 보내는 `fetchData` 함수를 작성한다. 어떤 곳에 요청을 보내는 것은 `callback`함수를 호출하는 것으로 해결한다.
2. `useEffect`에서 `fertchData`를 호출한다.
3. `state`와 `fetchData`를 반환함으로써 바깥에서도 상태와 다시 fetch하는 함수에 접근할 수 있게 한다.

useAsync() 코드

```js
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

function useAsync(callback) {
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    data: null,
    error: null,
  });

  const fetchData = async () => {
    try {
      dispatch({ type: 'LOADING' });

      const res = await callback();
      dispatch({ type: 'SUCCESS', data: res.data });
    } catch (e) {
      dispatch({ type: 'ERROR', error: e });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return [state, fetchData];
}

export default useAsync;
```

그런데 특정 데이터가 바뀔 때마다 데이터가 다시 fetch될 수 있도록 useEffect()의 deps에 인자를 주는 경우가 있다. (예를 들어 10초마다 데이터가 refresh되도록 deps에 time 관련 변수를 넣는 경우)

그런 상황을 고려한다면 다음과 같이 `useAsync()`의 인자로 `useEffect`의 `deps`(의존성 배열)을 전달할 수 있게 고친다면 더 훌륭할 것이다.

```js
function useAsync(callback, deps = []) {
  // 의존성 배열을 받지 않았다면 deps의 기본값으로 빈 배열이 설정된다.

  // ...
  useEffect(() => {
    fetchData();
  }, deps);

  return [state, fetchData];
}
```

### 2. 원하는 시점에 데이터 호출 발생하게 만들기

`useAsync()`를 보면 마운트 직후에 useEffect()에서 자동으로 data를 fetch해온다. 하지만 데이터 호출이 꼭 자동으로 바로 이루어질 필요는 없다. POST나 PUT, DELETE처럼 사용자가 원하는 시점에 async 요청을 해야 하는 경우도 있기 때문이다.

그러므로 useEffect() 내부에서 if문을 통해 데이터 통신 부분을 건너뛸 수 있도록 플래그를 전달하면 된다.

```js
function useAsync(callback, deps = [], skip = false) {
  // ...

  useEffect(() => {
    if (skip) return;
    fetchData();
    // eslint-disable-next-line
  }, deps);
}
```

그러면 이처럼 초기에 callback이 호출되는 것을 막고 직접적으로 refetch 함수를 호출할 때 요청이 이루어진다.

```js
function App() {
  const [state, refetch] = useAsync(getUsers, [], true);
  const { data: users, loading, error } = state;

  if (loading) return <div>...loading 중</div>;
  if (error) return <div>에러가 발생했습니다.</div>;
  if (!users) return <button onClick={refetch}>불러오기</button>;
  return (
    <>
      <ul>
        {users.map((user) => (
          <li key={user.name}>
            {user.name} ({user.username})
          </li>
        ))}
      </ul>
      <button onClick={refetch}>다시 불러오기</button>
    </>
  );
}
```

## 📗 API에 파라미터가 필요한 경우 - 클릭한 유저 정보 화면 아래에 불러오기

전 예제와 별 다른 건 없다. 데이터 요청 함수에 파라미터만 추가된 것 뿐이다. `getUser(id)` 함수를 작성하고 useAsync에 callback으로 주면 된다.

다만 주의할 점이 있다. 파라미터가 있는 callback 함수를 전달할 때 이렇게 하지 않도록 주의한다.

```js
function User({ id }) {
  const [state] = useAsync(getUser(id), [id]);
  // ...
}
```

이렇게 하면 `getUser(id)`를 실행한 결과인 data가 파라미터로 전달되기 때문에 useAsync 내부의 fetchData()에서 callback()을 실행할 수 없게 되버린다. 파라미터가 있는 callback 함수를 전달할 때에는 아래처럼 화살표 함수로 한번 감싸서 전달하자.

```js
// 파라미터가 있는 경우
function User({ id }) {
  const [state] = useAsync(() => getUser(id), [id]);
  // ...
}

// 파라미터가 없으면 이렇게
function Users() {
  const [state] = useAsync(getUsers, [id]);
  // ...
}
```

아래는 파라미터 있는 함수로 데이터 요청을 하는 예제이다. 유저를 클릭하면 id에 해당하는 유저 정보를 불러온다.

userId를 state로 선언하고 dependencies 배열에 넣어 관리하면 id 값이 바뀔때마다 trigger되어 정보를 가져온다.

```js
// User 컴포넌트
async function getUser(id) {
  const res = await axios.get(
    `https://jsonplaceholder.typicode.com/users/${id}`
  );
  return res.data;
}

function User({ id }) {
  const [state] = useAsync(() => getUser(id), [id]);
  const { loading, data: user, error } = state;

  if (loading) return <div>로딩중..</div>;
  if (error) return <div>에러가 발생했습니다</div>;
  if (!user) return null;

  return (
    <div>
      <h2>{user.username}</h2>
      <p>
        <b>Email:</b> {user.email}
      </p>
    </div>
  );
}
```

```js
// Users 컴포넌트
function Users() {
  const [userId, setUserId] = useState(null);
  const [state, refetch] = useAsync(getUsers, [], true);

  // ...
  return (
    <>
      <ul>
        {users.map((user) => (
          <li key={user.name} onClick={() => setUserId(user.id)}>
            {user.name} ({user.username})
          </li>
        ))}
      </ul>
      <button onClick={refetch}>다시 불러오기</button>
      {userId && <User id={userId} />}
    </>
  );
}
```

## 📗 Context와 API 연동 하는법

Provider에서 state, dispatch, API 요청 함수를 갖고 있으면 전역적으로 데이터를 변경 및 공유할 수 있다.

state를 내려주는 Provider와 dispatch를 내려주는 Provider를 감싸는 wrapper인 `UsersProvider`를 만들어준다.

```js
// UsersProvider.js
/* Context */
const UsersStateContext = createContext(null);
const UsersDispatchContext = createContext(null);

/* Provider */
export function UsersProvider({ children }) {
  const [state, dispatch] = useReducer(usersReducer, initialState);

  return (
    <UsersStateContext.Provider value={state}>
      <UsersDispatchContext.Provider value={dispatch}>
        {children}
      </UsersDispatchContext.Provider>
    </UsersStateContext.Provider>
  );
}
```

이렇게 필요한 부분에 감싸준다.

```js
function App() {
  return (
    <UsersProvider>
      <Users />
    </UsersProvider>
  );
}
```

`UsersProvider`를 마저 작성해보자. 아래와 같이 `loading, error, success 및 data`를 관리하는 `reducer`를 생성하고, `getUsers`처럼 API 호출 및 dispatch 하는 함수를 작성한다. 그러면 하위 컴포넌트에서 useContext를 하는 hook을 이용해 state에 접근할 수 있고, API 호출 함수(getUsers)를 호출하면 dispatch니 요청이니 하는 자세한 사항을 알 필요가 없다.

```js
// UsersProvider.js
/* action */
const GET_USERS = 'GET_USERS';
const GET_USERS_SUCCESS = 'GET_USERS_SUCCESS';
const GET_USERS_ERROR = 'GET_USERS_ERROR';
const GET_USER = 'GET_USER';
const GET_USER_SUCCESS = 'GET_USER_SUCCESS';
const GET_USER_ERROR = 'GET_USER_ERROR';

/* state objects */
const initialState = {
  users: {
    loading: false,
    data: null,
    error: null,
  },
  user: {
    loading: false,
    data: null,
    error: null,
  },
};

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

/* reducer */
const usersReducer = (state, action) => {
  switch (action.type) {
    case GET_USERS:
      return {
        ...state,
        users: loadingState,
      };
    case GET_USERS_SUCCESS:
      return {
        ...state,
        users: success(action.data),
      };
    case GET_USERS_ERROR:
      return {
        ...state,
        user: error(action.error),
      };
    case GET_USER:
      return {
        ...state,
        user: loadingState,
      };
    // ...
  }
};

/* Context */
const UsersStateContext = createContext(null);
const UsersDispatchContext = createContext(null);

/* Provider */
export function UsersProvider({ children }) {
  const [state, dispatch] = useReducer(usersReducer, initialState);

  return (
    <UsersStateContext.Provider value={state}>
      <UsersDispatchContext.Provider value={dispatch}>
        {children}
      </UsersDispatchContext.Provider>
    </UsersStateContext.Provider>
  );
}

/* useContext hooks */
export function useUsersState() {
  const state = useContext(UsersStateContext);
  if (!state) {
    throw new Error('Cannot find UsersProvider');
  }
  return state;
}

export function useUsersDispatch() {
  // ...
}

/* data fetch function */
export async function getUsers(dispatch) {
  dispatch({ type: GET_USERS });
  try {
    const res = await axios.get('https://jsonplaceholder.typicode.com/users');
    dispatch({ type: GET_USERS_SUCCESS, data: res.data });
  } catch (e) {
    dispatch({ type: GET_USERS_ERROR, error: e });
  }
}

export async function getUser(dispatch, id) {
  // ...
}
```

## 📗 리팩토링

### 1. api 요청과 dispatch 하는 부분 분리하기

아래의 두 함수를 보면 데이터 요청과 dispatch 하는 부분이 반복되고 있다. 이 외에도 비동기 데이터 요청을 하면 이와 똑같은 함수를 작성해야 할 것이다.

```js
// UsersContext.js 의 일부
export async function getUsers(dispatch) {
  dispatch({ type: GET_USERS });
  try {
    const res = await axios.get('https://jsonplaceholder.typicode.com/users');
    dispatch({ type: GET_USERS_SUCCESS, data: res.data });
  } catch (e) {
    dispatch({ type: GET_USERS_ERROR, error: e });
  }
}

export async function getUser(dispatch, id) {
  dispatch({ type: GET_USER });
  try {
    const res = await axios.get(
      `https://jsonplaceholder.typicode.com/users/${id}`
    );
    dispatch({ type: GET_USER_SUCCESS, data: res.data });
  } catch (e) {
    dispatch({ type: GET_USER_ERROR, error: e });
  }
}
```

이걸 분석해서 일반화한 함수를 만들어보자.

```js
function 특정 데이터 요청 함수 {
  try {
    dispatch - loading
    비동기로 특정 데이터를 요청하는 함수()
    dispatch - success
  } catch(e) {
    dispatch - error
  }
}
```

이런 구조로 이루어져 있음을 알 수 있다.

그러므로 *파라미터로 데이터 요청 함수를 받아서 dispatch 하는 로직과 결합하는 함수*를 생성해 return하면 될 것이다. <u>왜 함수를 만들어 return 하냐면 둘의 결합을 바로 실행하지 않고 정의해놓고 싶을 수 있기 때문이다.</u> 내 생각에는 이게 일종의 팩토리 패턴인 것 같다.

- 데이터 fetch 부분을 분리해 정의한 파일

  ```js
  // UsersApi.js
  export async function getUsers() {
    const res = await axios.get('https://jsonplaceholder.typicode.com/users');
    return res.data;
  }

  export async function getUser(id) {
    const res = await axios.get(
      `https://jsonplaceholder.typicode.com/users/${id}`
    );
    return res.data;
  }
  ```

- `createAsyncDispatcher` 함수 - 데이터의 type과 loading 상태를 결합해 동적으로 action을 만든다. 그리고 fetch 함수와 dispatch 로직을 결합한 handler를 생성해 반환한다. 이름이 `create`로 시작하는 것은 `AsyncDispatcher` 함수를 생성해 반환한다는 뜻이다.

  ```js
  // asyncActionUtils.js
  import { ActionType } from '../contexts/UsersContext';

  export default function createAsyncDispatcher(type, promiseFn) {
    const SUCCESS = ActionType[`${type}_SUCCESS`];
    const ERROR = ActionType[`${type}_ERROR`];

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
  ```

- 동적으로 action type을 할당하기 위해 UsersContext에서 object 형식으로 action.type을 정의해주었음. (Object안에 정의한 값은 `Object[ba+'nana']` -> `Object[banana]`처럼 key를 동적으로 할당해 찾을 수 있다.)

  ```js
  // UsersContext.js
  // Action type 정의 부분
  export const ActionType = {
    GET_USERS: 'GET_USERS',
    GET_USERS_SUCCESS: 'GET_USERS_SUCCESS',
    GET_USERS_ERROR: 'GET_USERS_ERROR',
    GET_USER: 'GET_USER',
    GET_USER_SUCCESS: 'GET_USER_SUCCESS',
    GET_USER_ERROR: 'GET_USER_ERROR',
  };
  Object.freeze(ActionType);
  ```

### 2. reducer에서 반환할 상태도 동적으로 생성하도록 바꿔보자.

```js
// asyncActionUtils.js 하단에 추가
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
```

이러면 reducer에서 반환할 state 객체를 자동으로 생성해주는 handler 함수를 생성할 수 있다.

최종적으로 reducer에서는 자동으로 type에 해당하는 `LOADING, SUCCESS, ERROR` 상태 객체를 생성해 반환해주고, `getUsers` 변수에 api 요청과 dispatch를 하는 함수를 자동적으로 생성해 할당받는다.

```js
// UsersContext.js
const usersHandler = createAsyncHandler('GET_USERS', 'users');
const userHandler = createAsyncHandler('GET_USER', 'user');

function usersReducer(state, action) {
  switch (action.type) {
    case 'GET_USERS':
    case 'GET_USERS_SUCCESS':
    case 'GET_USERS_ERROR':
      return usersHandler(state, action);
    case 'GET_USER':
    case 'GET_USER_SUCCESS':
    case 'GET_USER_ERROR':
      return userHandler(state, action);
    default:
      throw new Error(`Unhanded action type: ${action.type}`);
  }
}

/* data fetch function */
export const getUsers = createAsyncDispatcher(
  ActionType.GET_USERS,
  Api.getUsers
);
export const getUser = createAsyncDispatcher(ActionType.GET_USER, Api.getUser);
```

### 이 리팩토링에서 배운 점

공통되는 로직을 일반화 시키기 위해 구체적인 로직이 아니라 거시적인 구조를 일반화 할 수 있다는 것을 깨달았다. 그리고 util 함수를 만들 때 결과값을 반환하지 않고 함수를 생성해 반환할 수도 있다는 것을 배웠다.

전에 디자인 패턴 책에서 '팩토리 패턴'에 대해 읽었을 때에는 그냥 그렇구나 하고 정확히 뭔지는 와닿지 않았는데, `create~` 같은 고차 함수를 만들면서 '이런게 팩토리 패턴이구나'와 왜 이런 패턴을 쓰는지 효용을 깨달았다.
