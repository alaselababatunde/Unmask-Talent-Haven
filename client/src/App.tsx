import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import Upload from './pages/Upload';
import Balance from './pages/Balance';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Supporters from './pages/Supporters';
import Live from './pages/Live';
import AuthCallback from './pages/AuthCallback';
import Settings from './pages/Settings';
import Privacy from './pages/settings/Privacy';
import Security from './pages/settings/Security';
import Notifications from './pages/settings/Notifications';
import Search from './pages/Search';
import Follows from './pages/Follows';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/balance" element={<Balance />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile/:id?" element={<Profile />} />
            <Route path="/profile/:id/follows" element={<Follows />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/privacy" element={<Privacy />} />
            <Route path="/settings/security" element={<Security />} />
            <Route path="/settings/notifications" element={<Notifications />} />
            <Route path="/supporters" element={<Supporters />} />
            <Route path="/live" element={<Live />} />
            <Route path="/search" element={<Search />} />
            <Route path="/" element={<Navigate to="/feed" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

