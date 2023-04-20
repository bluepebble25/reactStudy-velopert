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
