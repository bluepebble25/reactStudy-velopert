import Users from './components/Users';
import { UsersProvider } from './contexts/UsersContext';

function App() {
  return (
    <UsersProvider>
      <Users />
    </UsersProvider>
  );
}

export default App;
