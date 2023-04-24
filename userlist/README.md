# userlist

만들면서 베운 점 정리

## 📗 useRef로 컴포넌트 안의 변수 저장하기

보통 useRef는 DOM을 선택하기 위해 많이 사용된다. 하지만 컴포넌트 내부에서 변수를 저장하기 위해서도 사용할 수 있다.

- state가 변경되면 컴포넌트가 재렌더링 되면서 컴포넌트 내부에 선언된 변수도 처음 선언했을 때의 값으로 초기화되어 버린다. 하지만 useRef로 관리되는 변수는 그와 다르게 리렌더링되어도 값을 유지하고 있다.
- **사용 예**: state로 관리하기까지는 좀 그렇지만 값을 유지하는게 중요한 변수 (scroll 위치같은), 혹은 setInterval() 제거를 위해 id를 기억해야 할 때 활용할 수 있다.
- 참조: https://www.daleseo.com/react-hooks-use-ref/

### 값 저장 및 참조 방법

`ref변수.current`로 값을 읽거나 쓸 수 있다.

```js
const nextPostId = useRef(5);

console.log('다음 게시물의 id', nextPostId.current);

const onClickButton = () => {
  nextPostId.current += 1;
};
```

## 📗 input값 여러 개 한번에 관리하기

```js
function App() {
  const [inputs, setInputs] = useState({
    username: '',
    email: '',
  });

  const { username, email } = inputs;

  const onChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  /* input 두 개를 가지고 있는 컴포넌트. */
  /*구조분해할당을 이용해 state를 분해해서 전달할 수도 있다. */
  return <CreateUser username={username} email={email} />;
}
```

## 📗 input 컴포넌트에서 onChange가 발생할 때마다 전체가 다시 리렌더링되는 이유, useMemo()로 계산값 저장하기

```js
function countActiveUsers(users) {
  console.log('active 유저 수를 세는 중...');
  return users.filter((user) => user.active).length;
}

function App() {
  const [inputs, setInputs] = useState({
    username: '',
    email: '',
  });
  const { username, email } = inputs;

  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'velopert',
      email: 'public.velopert@gmail.com',
      active: true,
    },
    // ...
  ]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  // ...

  const userCount = countActiveUsers(users);

  // 다음과 같이 useMemo로 감싸면 countActiveUsers()의 실행 결과값을 저장하고, 값이 바뀌지 않는다면 이전에 연산한 결과를 재사용한다.
  // const userCount = useMemo(() => countActiveUsers(users), [users]);

  return (
    <>
      {/* CreateUser안에는 username, email 두 개의 input이 있다 */}
      <CreateUser
        username={username}
        email={email}
        onChange={onChange}
        onCreate={onCreate}
      />
      <UserList users={users} onToggle={onToggle} onRemove={onRemove} />
      <div>{userCount} 명</div>
    </>
  );
}
```

이처럼 상위 컴포넌트에 state가 위치하고 하위 컴포넌트에 있는 input이 상위의 state와 동기화되어 있는 경우, input에 onChange가 발생할 때마다 상위 컴포넌트도 리렌더링된다.

그래서 컴포넌트 내부에 작성한 변수, 함수는 새로 생성되는데 위의 예시처럼 어떤 함수를 실행한 결과값을 useMemo()에 저장해 최적화할 수 있고, 함수 자체는 useCallback()를 통해 기억할 수 있다.

- +) useCallback()은 사실 useMemo()를 함수 기억용으로 발전시킨 것이다. useCallback은 `useMemo(() => () => {})`와 같다.
- `useMemo(() => 기억할 값)`의 기억할 값이 `() => {}` (함수)가 된 것 뿐이다.

## 📗 React.memo로 리렌더링 방지

### React.memo()의 효과

React.memo()로 컴포넌트를 감싸면, props가 변경되지 않는 한 모이징 된 결과를 재사용한다. 가상 DOM에서 달라진 부분을 비교하지 않아 성능이 향상된다.

### 언제 React.memo()를 사용해야 할까?

상위 컴포넌트가 자주 렌더링되지만 그 아래에 속한 어떤 컴포넌트에는 props에 변화가 자주 없는 경우 그 하위 컴포넌트에 React.memo()를 사용하면 좋다.

예를 들어 화면에 글자를 띄우는 `<Text/>` 컴포넌트와 서버시간을 실시간으로 보여주는 컴포넌트인 `<RealtimeClock/>`을 포함하는 `<ServerTimeViewer/>`가 있다고 하자.

```js
function ServerTimeViewer({ text, time }) {
  return (
    <>
      <Text text={text} />
      <RealtimeClock time={time} />
    </>
  );
}
```

실시간으로 서버에서 `time`을 받아오기 때문에 `ServerTimeViewer` 전체가 계속 리렌더링될 것이다. 하지만 `Text` 컴포넌트는 props로 고작 "Hello"라는 문자열만 받아 띄우고 있는 상황이라면 같이 리렌더링될 필요가 없다. 이때 `Text` 컴포넌트를 `React.memo()`로 감싸면 된다.

참조: https://ui.toast.com/weekly-pick/ko_20190731

### 이럴 때는 React.memo()를 사용하지 않는 것이 좋다

- 클래스 컴포넌트를 React.memo()로 래핑하는 것은 추천 X - shouldComponentUpdate를 확장
- props가 자주 변하는 컴포넌트 - 계속 props 비교가 일어나기 때문에 성능 저하

## 📗 state 함수형 업데이트 - array형 state 최적화에 좋음

state로 관리되고 있는 배열 중 한 요소에 변화가 생기면 목록 전체가 리렌더링되는 현상이 발생한다.

예를 들어 아래처럼 `User`를 요소로 갖는 `UserList` 컴포넌트가 있다고 하자.

```js
function UserList({ users, onRemove, onToggle }) {
  return (
    <div>
      {users.map((user) => (
        <User
          key={user.id}
          user={user}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
```

만약 User를 클릭해 active 상태를 toggle한다면 UserList 전체와 User 컴포넌트들이 다시 렌더링된다. 왜냐하면 `users` state가 새로운 배열로 대체되었기 때문이다.

```js
const onToggle = useCallback(
  (id) => {
    setUsers(
      users.map((user) =>
        user.id === id ? { ...user, active: !user.active } : user
      )
    );
  },
  [users]
);
```

그럴 때는 이전 state를 반영해 업데이트 하는 함수형 업데이트 방식을 사용하면 된다. 그리고 onToggle외에도 onRemove 함수처럼 deps로 users를 갖는 함수들도 함수형 업데이트 방식으로 바꾸면 새로 생성되지 않는다.

```js
const onToggle = useCallback((id) => {
  setUsers((users) =>
    users.map((user) =>
      user.id === id ? { ...user, active: !user.active } : user
    )
  );
}, []);
```

## 📗 useReducer() 이란?

React에서도 `useReducer()` hook을 이용해 redux와 같이 컴포넌트와 로직을 분리할 수 있다.

`useReducer()`는 `[state, dispatch]`를 반환한다.  
dispatch는 [state, setState]에서 setState에 해당한다. 하지만 직접 state를 변경하는 게 아니라 reducer에게 상태가공을 의뢰하는 trigger 같은 역할을 한다.

```js
const [state, dispatch] = useReducer(reducer, initialState);
```

### reducer 함수

state와 action을 인수로 받는다. 들어온 action에 따라 state를 변경한다.

```js
function reducer(state, action) {
  // ...
}
```

### reducer로 상태 로직 분리한 예시

```js
const initialState = {
  input: {
    username: '',
    email: '',
  },
  users: [
    {
      id: 1,
      username: 'John',
      email: 'abc123@gmail.com',
    },
    //...
  ],
};

function reducer(state, action) {
  switch (action.type) {
    case 'CREATE_USER':
      return { ...state, users: state.users.concat(action.user) };
    // ...
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const onCreate = () => {
    const user = {
      id: 4,
      username: 'Emily',
      email: 'emily@gmail.com',
    };

    dispatch({
      type: 'CREATE_USER',
      user,
    });
  };

  // ...
  return (
    <button onClick={onCreate}>Add new user<button/>
  )
}
```

### js 프로퍼티명 생략

object에 변수를 할당하는 경우, 프로퍼티명을 생략할 수 있다.

```js
const a = 1;
const b = 2;

const obj = {
  a,
  b,
};

/*
  const obj = {
    a: a
    b: b
  }
  와 같음
*/
```

## 📗 useInputs hook 만들기 - form 관리하기

### 계획

form 관리 전용 hook을 만들 것이다. 그러면 매번 state와 onChange 등의 로직을 일일이 입력할 필요 없이 hook을 호출해서 간편하게 입력 form 값을 관리할 수 있다.

form 관리 hook은 어때야하는지 생각해보자.

1. form 값을 저장할 state를 갖고 있어야 한다.
2. 바깥에서 onChange 로직을 작성할 필요가 없도록 내부에 로직을 갖고있어야 한다. 바깥의 input에 부착할 onChange 함수를 반환하자.
3. 초기값으로 reset할 수 있도록 reset 함수도 반환하자.

### 코드

```js
import { useState } from 'react';

function useInputs(initialForm) {
  const [form, setForm] = useState(initialForm);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((form) => ({
      ...form,
      [name]: value,
    }));
  };

  const reset = () => {
    setForm(initialForm);
  };

  return [form, onChange, reset];
}

export default useInputs;
```

### 개선하기

리렌더링될 때마다 함수가 새로 생성되지 않기 위해 함수를 `useCallback()`으로 감싸준다.

```js
import { useState, useCallback } from 'react';

function useInputs(initialForm) {
  const [form, setForm] = useState(initialForm);

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((form) => ({
      ...form,
      [name]: value,
    }));
  }, []);

  const reset = useCallback(() => {
    setForm(initialForm);
  }, [initialForm]);

  return [form, onChange, reset];
}

export default useInputs;
```

### 사용하기

`const [state, onChange, reset]` 순으로 사용하면 된다. 아래는 구조분해할당으로 state를 `{username, email}`로 나눠 받은 모습이다.

```js
const [{ username, email }, onChange, reset] = useInputs({
  username: '',
  email: '',
});
```
