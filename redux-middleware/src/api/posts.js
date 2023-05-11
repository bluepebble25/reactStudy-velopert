// n초 동안 기다리는 프로미스를 생성. (resolve를 실행하면 Promise가 이행 상태로 바뀐다.)
const sleep = (n) => new Promise((resolve) => setTimeout(resolve, n));

// posts dummy data
const posts = [
  {
    id: 1,
    title: 'redux middleware',
    body: 'redux middleware 만들기',
  },
  {
    id: 2,
    title: 'redux-thunk',
    body: 'redux-thunk 배우기',
  },
  {
    id: 3,
    title: 'redux-saga',
    body: 'redux-saga까지 배우자',
  },
];

// 약간 대기한 후 posts를 가져오는 비동기 함수
export const getPosts = async () => {
  await sleep(500);
  return posts;
};

export const getPostById = async (id) => {
  await sleep(500);
  return posts.filter((post) => post.id === id);
};
