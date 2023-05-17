import * as postsAPI from '../api/posts';
import {
  createPromiseThunk,
  handleAsyncAction,
  reducerUtils,
} from '../lib/asyncUtils';

/* Action Types */

// 포스트 여러개 조회
const GET_POSTS = 'GET_POSTS';
const GET_POSTS_SUCCESS = 'GET_POSTS_SUCCESS';
const GET_POSTS_ERROR = 'GET_POSTS_ERROR';

// 포스트 한 개 조회
const GET_POST = 'GET_POSTS';
const GET_POST_SUCCESS = 'GET_POSTS_SUCCESS';
const GET_POST_ERROR = 'GET_POSTS_ERROR';

// thunk 함수
export const getPosts = createPromiseThunk(GET_POSTS, postsAPI.getPosts);
export const getPost = createPromiseThunk(GET_POST, postsAPI.getPostById);

// 위의 createPromiseThunk라는 함수는 thunk 를 생성하는 함수이다.
// 아래와 같은 코드를 추상화해서 중복을 줄일 수 있다.
// export const getPosts = () => async (dispatch) => {
//   dispatch({ type: GET_POSTS });
//   try {
//     const posts = await postsAPI.getPosts();
//     dispatch({ type: GET_POSTS_SUCCESS });
//   } catch (e) {
//     dispatch({ type: GET_POSTS_ERROR, error: e });
//   }
// };

// export const getPost = (id) => async (dispatch) => {
//   dispatch({ type: GET_POST });
//   try {
//     const posts = await postsAPI.getPosts();
//     dispatch({ type: GET_POST_SUCCESS });
//   } catch (e) {
//     dispatch({ type: GET_POST_ERROR, error: e });
//   }
// };

/* initial state */
const initialState = {
  posts: reducerUtils.initial(),
  post: reducerUtils.initial(),
};

/* Reducer */
export default function posts(state = initialState, action) {
  switch (action.type) {
    case GET_POSTS:
    case GET_POSTS_SUCCESS:
    case GET_POSTS_ERROR:
      // handleAsyncAction(type, key)을 호출하면 함수가 반환되고,
      // 그 함수를 다시 (state,action)으로 호출하고 있기 때문에
      // 소괄호가 두 개
      return handleAsyncAction(GET_POSTS, 'posts', true)(state, action);
    case GET_POST:
    case GET_POST_SUCCESS:
    case GET_POST_ERROR:
      return handleAsyncAction(GET_POST, 'post')(state, action);
    default:
      return state;
  }
}
