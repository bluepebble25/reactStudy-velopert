import { Routes, Route } from 'react-router-dom';
import CounterContainer from './components/CounterContainer';
import PostListPage from './pages/PostListPage';

function App() {
  return (
    <Routes>
      <Route exact path="/" element={<PostListPage />} />
      <Route path="/counter" element={<CounterContainer />} />
    </Routes>
  );
}

export default App;
