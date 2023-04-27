import { createContext, useContext, useReducer } from 'react';
import axios from 'axios';

/* action */
const GET_USERS = 'GET_USERS';
const GET_USERS_SUCCESS = 'GET_USERS_SUCCESS';
const GET_USERS_ERROR = 'GET_USERS_ERROR';
const GET_USER = 'GET_USER';
const GET_USER_SUCCESS = 'GET_USER_SUCCESS';
const GET_USER_ERROR = 'GET_USER_ERROR';

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

const loadingState = {
  loading: true,
  data: null,
  error: null,
};

const success = (data) => {
  return {
    loading: false,
    data,
    error: null,
  };
};

const error = (error) => {
  return {
    loading: false,
    data: null,
    error,
  };
};

/* reducer */
const usersReducer = (state, action) => {
  switch (action.type) {
    case GET_USERS:
      return {
        ...state,
        users: loadingState,
      };
    case GET_USERS_SUCCESS:
      return {
        ...state,
        users: success(action.data),
      };
    case GET_USERS_ERROR:
      return {
        ...state,
        user: error(action.error),
      };
    case GET_USER:
      return {
        ...state,
        user: loadingState,
      };
    case GET_USER_SUCCESS:
      return {
        ...state,
        user: success(action.data),
      };
    case GET_USER_ERROR:
      return {
        ...state,
        user: error(action.error),
      };
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
export async function getUsers(dispatch) {
  dispatch({ type: GET_USERS });
  try {
    const res = await axios.get('https://jsonplaceholder.typicode.com/users');
    dispatch({ type: GET_USERS_SUCCESS, data: res.data });
  } catch (e) {
    dispatch({ type: GET_USERS_ERROR, error: e });
  }
}

export async function getUser(dispatch, id) {
  dispatch({ type: GET_USER });
  try {
    const res = await axios.get(
      `https://jsonplaceholder.typicode.com/users/${id}`
    );
    dispatch({ type: GET_USER_SUCCESS, data: res.data });
  } catch (e) {
    dispatch({ type: GET_USER_ERROR, error: e });
  }
}
