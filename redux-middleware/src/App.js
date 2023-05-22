import { Routes, Route } from 'react-router-dom';
import CounterContainer from './containers/CounterContainer';
import PostListPage from './pages/PostListPage';
import PostPage from './pages/PostPage';

function App() {
  return (
    <Routes>
      <Route exact path="/" element={<PostListPage />} />
      <Route path="/:id" element={<PostPage />} />
      <Route path="/counter" element={<CounterContainer />} />
    </Routes>
  );
}

export default App;
