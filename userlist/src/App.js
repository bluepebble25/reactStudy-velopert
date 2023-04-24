import { useReducer, useRef, useMemo, useCallback } from 'react';
import UserList from './components/UserList';
import CreateUser from './components/CreateUser';
import useInputs from './hooks/useInputs';

function countActiveUsers(users) {
  console.log('active 유저 수를 세는 중...');
  return users.filter((user) => user.active).length;
}

const initialState = {
  users: [
    {
      id: 1,
      username: 'velopert',
      email: 'public.velopert@gmail.com',
      active: true,
    },
    {
      id: 2,
      username: 'tester',
      email: 'tester@example.com',
      active: false,
    },
    {
      id: 3,
      username: 'liz',
      email: 'liz@example.com',
      active: false,
    },
  ],
};

function reducer(state, action) {
  switch (action.type) {
    case 'CREATE_USER':
      return {
        users: state.users.concat(action.user),
      };
    case 'TOGGLE_USER':
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.id ? { ...user, active: !user.active } : user
        ),
      };
    case 'REMOVE_USER':
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.id),
      };
    default:
      return state;
  }
}

function App() {
  const [{ username, email }, onChange, onReset] = useInputs({
    username: '',
    email: '',
  });
  const [state, dispatch] = useReducer(reducer, initialState);
  const { users } = state;

  const nextId = useRef(4);

  const onCreate = useCallback(() => {
    const user = {
      id: nextId.current,
      username,
      email,
      active: true,
    };

    dispatch({ type: 'CREATE_USER', user });
    onReset();
    nextId.current += 1;
  }, [username, email, onReset]);

  const onRemove = useCallback((id) => {
    dispatch({ type: 'REMOVE_USER', id });
  }, []);

  const onToggle = useCallback((id) => {
    dispatch({ type: 'TOGGLE_USER', id });
  }, []);

  const userCount = useMemo(() => countActiveUsers(users), [users]);

  return (
    <>
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

export default App;
