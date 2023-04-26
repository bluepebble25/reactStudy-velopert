import axios from 'axios';
import useAsync from '../hooks/useAsync';

async function getUsers() {
  const res = await axios.get('https://jsonplaceholder.typicode.com/users');
  return res.data;
}

function Users() {
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

export default Users;
