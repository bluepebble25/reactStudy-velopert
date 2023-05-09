# redux-middleware

만들면서 배운 점 정리

https://ridicorp.com/story/how-to-use-redux-in-ridi/

## 📗 미들웨어가 필요한 이유

- redux에서 action이 dispatch되고, reducer가 가공한 state를 반환해 store에 반환되는 이 과정은 동기적으로 이루어진다.
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

미들웨어 적용은 `applyMiddleware()` 함수로 미들웨어 함수들을 감싸면 된다. 미들웨어가 여러개라면 `applyMiddleware()` 안에 파라미터로 다 전달하면 된다.

```js
// index.js
const store = createStore(rootReducer, applyMiddleware(myLogger));
```
