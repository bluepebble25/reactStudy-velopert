/* action type 정의 */
const ADD_TODO = 'todos/ADD_TODO';
const TOGGLE_TODO = 'todos/TOGLE_TODO';

/* action creator 정의 */
let nextId = 1; // todo 데이터에서 사용할 고유 id
export const addTodo = (text) => ({
  type: ADD_TODO,
  todo: { id: nextId++, text, done: false },
});
export const toggleTodo = (id) => ({ type: TOGGLE_TODO, id });

/* initial State 정의 */
const initialState = [];

/* reducer 정의 */
export default function todos(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO:
      return state.concat(action.todo);
    case TOGGLE_TODO:
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, done: !todo.done } : todo
      );
    default:
      return state;
  }
}
