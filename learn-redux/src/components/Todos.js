import React from 'react';
import { useState } from 'react';

const TodoItem = React.memo(({ todo, onToggle }) => {
  return (
    <li
      key={todo.id}
      style={{ textDecoration: todo.done ? 'line-through' : 'none' }}
      onClick={() => onToggle(todo.id)}
    >
      {todo.text}
    </li>
  );
});

const TodoList = React.memo(({ todos, onToggle }) => {
  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} />
      ))}
    </ul>
  );
});

function Todos({ todos, onCreate, onToggle }) {
  const [text, setText] = useState('');

  const onChange = (e) => setText(e.target.value);
  const onSubmit = (e) => {
    e.preventDefault();
    onCreate(text);
    setText('');
  };

  return (
    <div>
      <h2>할 일 목록</h2>
      <form onSubmit={onSubmit}>
        <input value={text} onChange={onChange} />
        <button type="submit">등록</button>
      </form>
      <TodoList todos={todos} onToggle={onToggle} />
    </div>
  );
}

export default Todos;
