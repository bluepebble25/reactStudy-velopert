import React, { useEffect } from 'react';
import PostList from './PostList';
import { useDispatch, useSelector } from 'react-redux';
import { getPosts } from '../modules/posts';

function PostListContainer() {
  const { data, loading, error } = useSelector((state) => state.posts.posts);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);

  if (loading && !data) return <div>...로딩중</div>; // 이전에 불러온 값이 존재한다면 로딩중을 띄우지 않는다.
  if (error) return <div>에러 발생!</div>;
  if (!data) return null;
  return <PostList posts={data} />;
}

export default PostListContainer;
