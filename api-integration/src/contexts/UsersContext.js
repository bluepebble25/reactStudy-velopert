import { createContext, useContext, useReducer } from 'react';
import createAsyncDispatcher, {
  createAsyncHandler,
} from '../_lib/asyncActionUtils';
import * as Api from '../_lib/usersApi';

/* action */
export const ActionType = {
  GET_USERS: 'GET_USERS',
  GET_USERS_SUCCESS: 'GET_USERS_SUCCESS',
  GET_USERS_ERROR: 'GET_USERS_ERROR',
  GET_USER: 'GET_USER',
  GET_USER_SUCCESS: 'GET_USER_SUCCESS',
  GET_USER_ERROR: 'GET_USER_ERROR',
};
Object.freeze(ActionType);

/* state objects */
const initialState = {
  users: {
    loading: false,
    data: null,
    error: null,
  },
  user: {
    loading: false,
    data: null,
    error: null,
  },
};

/* reducer */
const usersHandler = createAsyncHandler(ActionType.GET_USERS, 'users');
const userHandler = createAsyncHandler(ActionType.GET_USER, 'user');

const usersReducer = (state, action) => {
  switch (action.type) {
    case ActionType.GET_USERS:
    case ActionType.GET_USERS_SUCCESS:
    case ActionType.GET_USERS_ERROR:
      return usersHandler(state, action);
    case ActionType.GET_USER:
    case ActionType.GET_USER_SUCCESS:
    case ActionType.GET_USER_ERROR:
      return userHandler(state, action);
    default:
      throw new Error(`Unhanded action type: ${action.type}`);
  }
};

/* Context */
const UsersStateContext = createContext(null);
const UsersDispatchContext = createContext(null);

/* Provider */
export function UsersProvider({ children }) {
  const [state, dispatch] = useReducer(usersReducer, initialState);

  return (
    <UsersStateContext.Provider value={state}>
      <UsersDispatchContext.Provider value={dispatch}>
        {children}
      </UsersDispatchContext.Provider>
    </UsersStateContext.Provider>
  );
}

/* useContext hooks */
export function useUsersState() {
  const state = useContext(UsersStateContext);
  if (!state) {
    throw new Error('Cannot find UsersProvider');
  }
  return state;
}

export function useUsersDispatch() {
  const dispatch = useContext(UsersDispatchContext);
  if (!dispatch) {
    throw new Error('Cannot find UsersDispatch');
  }
  return dispatch;
}

/* data fetch function */
export const getUsers = createAsyncDispatcher(
  ActionType.GET_USERS,
  Api.getUsers
);
export const getUser = createAsyncDispatcher(ActionType.GET_USER, Api.getUser);
