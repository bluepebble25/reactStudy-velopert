import React from 'react';

const User = React.memo(function User({ user, onToggle, onRemove }) {
  console.log('user');
  return (
    <div>
      <b
        style={{ color: user.active ? 'green' : 'black', cursor: 'pointer' }}
        onClick={() => onToggle(user.id)}
      >
        {user.username}
      </b>{' '}
      <span>{user.email}</span>
      <button onClick={() => onRemove(user.id)}>삭제</button>
    </div>
  );
});

function UserList({ users, onRemove, onToggle }) {
  console.log('userList');

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

export default React.memo(UserList);
