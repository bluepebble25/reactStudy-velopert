import { useState } from 'react';
import axios from 'axios';
import useAsync from '../hooks/useAsync';
import User from './User';

async function getUsers() {
  const res = await axios.get('https://jsonplaceholder.typicode.com/users');
  return res.data;
}

function Users() {
  const [userId, setUserId] = useState(null);
  const [state, refetch] = useAsync(getUsers, [], true);
  const { data: users, loading, error } = state;

  if (loading) return <div>...loading 중</div>;
  if (error) return <div>에러가 발생했습니다.</div>;
  if (!users) return <button onClick={refetch}>불러오기</button>;
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

export default Users;
