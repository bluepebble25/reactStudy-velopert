import { useReducer, useEffect } from 'react';
import axios from 'axios';

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
    <>
      <ul>
        {users.map((user) => (
          <li key={user.name}>
            {user.name} ({user.username})
          </li>
        ))}
      </ul>
      <button onClick={fetchUsers}>다시 불러오기</button>
    </>
  );
}

export default App;
