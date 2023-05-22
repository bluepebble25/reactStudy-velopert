# redux-middleware

만들면서 배운 점 정리

## 📗 미들웨어가 필요한 이유

- dispatch를 호출해 reducer에게 신호를 주는 과정은 순식간에 이루어지기 때문에 중간에 action creator가 수행되는 시간이 너무 길거나 비동기 호출의 결과값을 반영해야 한다면 의도한 대로 action이 전달되지 않는다.
- 또한 순수함수여야 하는 reducer 내부에서는 직접 비동기 작업을 처리할 수 없다.
- 그래서 만약 시간을 지연시키고 싶거나 API 통신같은 비동기 작업을 수행하고 싶을 때 중간에 미들웨어를 놓는다.
- 미들웨어는 API 통신같은 비동기 작업, 시간 지연 외에도 로깅 등에 사용할 수 있다.

## 📗 미들웨어 함수 양식

미들웨어 함수를 작성하는 양식은 다음과 같다.

```js
const middleware = (store) => (next) => (action) => {
  // ... 미들웨어에서 할 작업
};
```

화살표 함수로 계속 이어지는데 사실 아래처럼 계속 함수를 반환하는 구조이다.

```js
function middleware(store) {
  return function (next) {
    return function (action) {
      // ... 미들웨어에서 할 작업
    };
  };
}
```

## 📗 로깅함수로 미들웨어 작성하는 법 알아보기

미들웨어 함수는 여러개를 이어붙여 사용하는 경우가 있다. 그러므로 다음 미들웨어 함수를 호출하고 인자를 넘겨줄 수 있어야 하는데 그 역할을 `next()` 함수가 한다.

`next(action)`를 보면 `next()`로 다음 미들웨어 함수를 호출하면서 action를 다음 미들웨어가 사용할 수 있게 전달하고 있다.

```js
// myLogger.js
const myLogger = (store) => (next) => (action) => {
  console.log(action);
  console.log('\t', store.getState());

  const result = next(action);
  return result;
};
```

### 미들웨어 적용

미들웨어 적용은 `applyMiddleware()` 함수로 미들웨어 함수들을 감싸면 된다. 미들웨어가 여러개라면 `applyMiddleware()` 안에 파라미터로 다 전달하면 된다.

```js
// index.js
const store = createStore(rootReducer, applyMiddleware(myLogger));
```

### 미들웨어와 redux-devtools 다 적용하기

> npm install @redux-devtools/extension

을 한 다음 `applyMiddleware`를 또 한번 `composeWithDevTools`로 감싸주면 된다.

```js
// index.js
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from '@redux-devtools/extension';

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(myLogger))
);
```

## 📗 redux 관련 라이브러리들 소개

### redux-logger

> npm install redux-logger

prev state, action, next state의 로그를 콘솔에 찍어준다.

### redux-thunk

리덕스에서 주로 비동기 작업을 할 때 사용하는 미들웨어이다.

Action 객체가 아닌 **함수를 disaptch 할 수 있다.**

함수를 dispatch 할 수 있다는 게 무슨 말이냐면, 보통은 dispatch 안에 action creator나 action 객체를 직접 전달하지만, 비동기 작업을 한 후에 최종적으로 action 객체를 return하고 싶을 때도 있을 것이다. 하지만 그렇게 되면 dispatch는 단순히 action을 반환하는 action creator가 아닌 이상 인자를 함수로 인식하게 된다. redux-thunk는 함수를 dispatch하는 것을 가능하게 해준다.

### redux-saga

redux-saga는 redux-thunk 다음으로 가장 많이 사용되는 라이브러리이다.
redux-thunk는 함수를 디스패치 할 수 있게 해주는 기능이 있었는데,  
redux-saga는 액션을 모니터링하고 있다가, 특정 액션이 발생하면 이에 따라 특정 작업을 하는 방식으로 작동한다.

#### redux-saga의 특징

redux-thunk로 못하는 다양한 작업들을 처리 할 수 있다. 예를 들면

- 비동기 작업을 할 때 기존 요청을 취소 할 수 있음
- 특정 액션이 발생했을 때 다른 액션이 디스패치되게끔 하거나, 자바스크립트 코드를 실행 할 수 있음
- 웹소켓을 사용하는 경우 Channel 이라는 기능을 사용하여 더욱 효율적으로 코드를 관리 할 수 있습니다 (참고)
- API 요청이 실패했을 때 재요청하는 작업을 할 수 있음
- 이 외에도 다양한 까다로운 비동기 작업들을 redux-saga를 사용하여 처리 할 수 있다.
- JS의 Generator 문법을 사용한다.

## 📗 redux-thunk

thunk란 특정 작업을 나중으로 미루기 위해 함수로 감싼 것을 뜻한다.

```js
// 1번
const foo = 1 + 2;
```

```js
// 2번
const foo = () => 1 + 2;
```

1번은 코드를 읽어내려 가는 과정에서 1 + 2 계산이 수행되어 foo에 저장되지만, 2번은 `foo()`로 호출할 때에야 계산이 수행된다.

redux-thunk는 redux에서 동기, 혹은 비동기 작업을 할 수 있도록 해주는 미들웨어이다. dispatch의 인수로 액션 객체가 아닌 함수를 전달할 수 있게 해준다. 물론 action creator 함수로 액션 객체를 return하는 것도 dispatch에 함수를 전달하는게 아니냐고 할 수 있다. 하지만 그것도 인자로 어떤 성질의 함수가 들어갔느냐에 따라 판정이 달라진다. 다음에 오는 내용을 읽어보자.

### 🌼 redux-thunk를 사용하는 이유

1. redux에서 reducer는 순수해야 한다. 이전 값과 새로 들어온 파라미터를 이용해 계산한 값은 언제나 같아야 하기 때문에 내부에서 API 호출로 값을 가져오는 일 같은 것은 할 수 없다. 그러므로 따로 미들웨어가 필요하다.
2. redux에서는 dispatch를 호출하면 action이 reducer로 전달되는 과정이 순식간에 이루어지기 때문이다.
   - 간단하게 action 객체만 return하는 action creator 정도는 괜찮지만, async/await 비동기 처리를 하는 함수는 return 한 결과물이 아니라 함수 자체가 dispatch된 것으로 인식한다. redux는 dispatch의 인수로 너무 큰 함수가 들어갈 수 없기 때문에 미들웨어가 필요하다.
   - 만약 함수가 너무 크지 않다고 해도 순식간에 action을 전달하려는 dispatch의 특성상 비동기작업의 promise가 반환되기를 기다리느라 action을 return하는 곳까지 도달하지 못해, reducer는 받은 action이 없다고 판단한다.

### 🌼 redux-thunk 동작 과정

redux-thunk는 dispatch의 파라미터로 들어간 thunk 함수는 비동기 작업 등을 수행하고, 마지막으로 dispatch를 수행한다.

그러니까 redux-thunk는 dispatch와 reducer 중간에서 `인자가 함수인가 Y/N -> 함수O) 함수를 실행하고 비동기 처리를 기다렸다가 dispatch를 수행한다. / 함수X) 액션 객체(plain object)면 dispatch에게 전달한다` 의 과정을 수행한다.

```js
export const createPromiseThunk = (type, promiseCreator) => {
  const [SUCCESS, ERROR] = [`${type}_SUCCESS`, `${type}_ERROR`];

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
```

보통은 thunk 함수를 선언해도 되지만, 추상화를 위해 *thunk를 생성하는 함수*를 만들었다.

이 함수를 호출하면

```js
const getPosts = createPromiseThunk(GET_POSTS, postsAPI.getPosts);
```

다음과 같은 의미이다. 이렇게 thunk 함수가 생성되었다.

```js
const getPosts = (param) => async (dispatch) => {
  dispatch({ type, param });
  try {
    const payload = await promiseCreator(param);
    dispatch({ type: SUCCESS, payload });
  } catch (e) {
    dispatch({ type: ERROR, payload: e, error: true });
  }
};

// 혹은

const getPosts = function (param) {
  return async (dispatch) => {
    dispatch({ type, param });
    try {
      const payload = await promiseCreator(param);
      dispatch({ type: SUCCESS, payload });
    } catch (e) {
      dispatch({ type: ERROR, payload: e, error: true });
    }
  };
};
```

이것과 같은 의미이고, thunk 함수를 dispatch의 인자로 넣어 호출한다면

```js
dispatch(getPosts());
```

아래와 같은 의미이다.

```js
dispatch(function async(dispatch) {
  dispatch({ type, param });
  try {
    const payload = await promiseCreator(param);
    dispatch({ type: SUCCESS, payload });
  } catch (e) {
    dispatch({ type: ERROR, payload: e, error: true });
  }
})
```

따라서 redux-thunk 미들웨어에 의해 dispatch 안의 thunk 함수가 실행되어 비동기 작업을 수행하고 나면, 최종적으로 인자로 받은 dispatch를 이용해 action을 dispatch한다. thunk가 dispatch를 대신 수행해주는 셈이다.

## 📗 redux로 재로딩 문제 해결하기

### 문제

여태 데이터를 불러올 때 LOADING, SUCCESS, ERROR 세 가지 상태로 나누어 관리했다. 로딩 중에는 data를 잠시 null로 비웠다가 SUCCESS가 되면 새로운 값을 설정하곤 했는데, 그렇게 되면 data가 null이어서 로딩중... 이라는 표시가 뜨게 된다.

### 해결방법

데이터가 로딩되는 동안 이전 데이터를 잠깐 보여주고 있을 지를 keepData라는 flag로 관리한다. reducer에서 LOADING 타입에 대한 state를 반환할 때 keepData가 true라면 state['posts'].data를 반환하고, false면 null을 반환하도록 한다. 그러면 데이터가 아예 존재하지 않은 경우에는 로딩중...이 뜨지만 이미 존재하는 데이터가 있다면 LOADING action에 대한 공백이 느껴지지 않을 것이다.

아래는 reducer에서 반환할 상태값을 생성해주는 util 함수의 코드이다.

```js
export const handleAsyncActions = (type, key, keepData = false) => {
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
```

```js
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
  // ...
};
```

```js
// reducer 부분
export default function posts(state = initialState, action) {
  switch (action.type) {
    case GET_POSTS:
    case GET_POSTS_SUCCESS:
    case GET_POSTS_ERROR:
      return handleAsyncActions(GET_POSTS, 'posts', true)(state, action);
    case GET_POST:
    case GET_POST_SUCCESS:
    case GET_POST_ERROR:
      return handleAsyncActions(GET_POST, 'post')(state, action);
    default:
      return state;
  }
}
```

## Reference

- https://velog.io/@mokyoungg/Redux-Redux-thunk
- https://redux-advanced.vlpt.us/2/01.html
