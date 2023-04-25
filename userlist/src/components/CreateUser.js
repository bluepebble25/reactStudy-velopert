import React, { useContext, useRef, useCallback } from 'react';
import { UserDispatch } from '../App';
import useInputs from '../hooks/useInputs';

function CreateUser() {
  const [{ username, email }, onChange, onReset] = useInputs({
    username: '',
    email: '',
  });

  const dispatch = useContext(UserDispatch);
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
  }, [username, email, dispatch, onReset]);

  return (
    <div>
      <input
        name="username"
        placeholder="계정명"
        onChange={onChange}
        value={username}
      />
      <input
        name="email"
        placeholder="이메일"
        onChange={onChange}
        value={email}
      />
      <button type="button" onClick={onCreate}>
        등록
      </button>
    </div>
  );
}

export default React.memo(CreateUser);
