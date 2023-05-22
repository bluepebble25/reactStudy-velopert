import React from 'react';
import { useParams } from 'react-router-dom';
import PostContainer from '../containers/PostContainer';

function PostPage() {
  const { id } = useParams();
  console.log('id', id);
  return <PostContainer postId={parseInt(id)} />;
}

export default PostPage;
