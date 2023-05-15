import { Routes, Route } from 'react-router-dom';
import CounterContainer from './components/CounterContainer';
import PostListContainer from './components/PostListContainer';

function App() {
  return (
    <Routes>
      <Route exact path="/" element={<PostListContainer />} />
      <Route path="/counter" element={<CounterContainer />} />
    </Routes>
  );
}

export default App;
