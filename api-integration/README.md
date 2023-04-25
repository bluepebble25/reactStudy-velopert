# api-integration

만들면서 배운 점 정리

## 📗 api 요청 상태 관리하기 - loading, error

데이터 요청 상태는 성공만 있지 않다.

- loading 중 / loading 완료
- error 발생 / 성공
  으로 나누어 더 상세하게 요청 상황을 관리할 필요가 있다.

loading, error, 데이터 없음에 따라 렌더링할 요소를 다르게 하자. 그러면 사용자에게 데이터 요청이 어떻게 이루어지고 있는지 상황을 공유할 수 있다.

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
