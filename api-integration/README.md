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

그런데 특정 데이터가 바뀔 때마다 데이터가 다시 fetch될 수 있도록 useEffect()의 deps에 인자를 주는 경우가 있다. (예를 들어 10초마다 데이터가 refresh되도록 deps에 time 변수를 넣는 경우)

그런 상황을 고려한다면 다음과 같이 `useAsync()`의 인자로 `useEffect`의 `deps`에 넣을 의존성 배열을 전달할 수 있게 고친다면 더 훌륭할 것이다.

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

그러므로 useEffect() 내부에서 데이터 통신 부분을 건너뛸 수 있도록 if문을 통해 조절하게 만들면 된다.

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

그러면 이처럼 초기에 data가 fetch될 지를 true/false 옵션을 줘서 조절할 수 있다. 초기에 callback이 호출되는 것을 막고 직접적으로 refetch 함수를 호출할 때 요청이 이루어진다.

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

id에 해당하는 리소스를 요청하는 `getUser(id)` 함수를 작성하고 useAsync에 callback으로 주면 된다.

유저를 클릭하면 id에 해당하는 유저 정보를 불러오는 것은 userId를 state로 선언하고 dependencies 배열에 넣어 관리한다. 값이 바뀔때마다 trigger되어 정보를 가져온다.

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

단, 주의할 점이 있는데 파라미터가 있는 callback 함수를 전달할 때 이렇게 하지 않도록 주의한다.

```js
function User({ id }) {
  const [state] = useAsync(getUser(id), [id]);
  // ...
}
```

이렇게 하면 `getUser(id)`를 실행한 결과인 data가 파라미터로 전달되기 때문에 useAsync 내부의 fetchData()에서 callback()을 실행할 수 없게 되버린다.  
우리가 onClick에 파라미터가 있는 함수를 전달할 때는 `onClick={() => someFunction(id)}`처럼 하는 것과 마찬가지로, 파라미터가 있는 callback 함수를 전달할 때에는 아래처럼 화살표 함수로 한번 감싸서 전달하자.

```js
function User({ id }) {
  const [state] = useAsync(() => getUser(id), [id]);
  // ...
}
```
