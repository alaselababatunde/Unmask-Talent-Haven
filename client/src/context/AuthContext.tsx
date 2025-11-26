import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import api from '../api';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  socket?: Socket | null;
  notifications: Array<any>;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuth: (token: string, user: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Array<any>>([]);
  const socketRef = useRef<Socket | null>(null);

  const SOCKET_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/?api\/?$/i, '');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      // establish socket connection
      try {
        const s = io(SOCKET_BASE, { transports: ['websocket'] });
        socketRef.current = s;
        s.on('connect', () => {
          const u = JSON.parse(storedUser);
          if (u?.id) s.emit('join', { userId: u.id });
        });
        s.on('notification', (notif: any) => {
          setNotifications((prev) => [notif, ...prev]);
        });
      } catch (e) {
        // ignore socket errors
        console.error('Socket error', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = response.data;
    setAuth(newToken, newUser);
  };

  const signup = async (firstName: string, lastName: string, username: string, email: string, password: string) => {
    const response = await api.post('/auth/signup', { firstName, lastName, username, email, password });
    const { token: newToken, user: newUser } = response.data;
    setAuth(newToken, newUser);
  };

  const setAuth = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    // open socket connection and join personal room
    try {
      if (!socketRef.current) {
        const s = io(SOCKET_BASE, { transports: ['websocket'] });
        socketRef.current = s;
        s.on('connect', () => {
          if (newUser?.id) s.emit('join', { userId: newUser.id });
        });
        s.on('notification', (notif: any) => {
          setNotifications((prev) => [notif, ...prev]);
        });
      } else if (socketRef.current && newUser?.id) {
        socketRef.current.emit('join', { userId: newUser.id });
      }
    } catch (e) {
      console.error('Socket setup failed', e);
    }
  };

  // Refresh full user profile (including followers/following)
  const refreshUser = async (id?: string) => {
    try {
      const uid = id || (user as any)?.id;
      if (!uid) return;
      const res = await api.get(`/user/${uid}`);
      // API returns { user, posts }
      if (res.data && res.data.user) {
        const fullUser = {
          id: res.data.user._id,
          firstName: res.data.user.firstName,
          lastName: res.data.user.lastName,
          username: res.data.user.username,
          email: res.data.user.email,
          profileImage: res.data.user.profileImage,
          // include followers/following arrays for UI
          followers: res.data.user.followers || [],
          following: res.data.user.following || [],
        } as any;
        setUser(fullUser as User);
        localStorage.setItem('user', JSON.stringify(fullUser));
      }
    } catch (e) {
      // ignore
    }
  };

  const updateFollowing = (targetId: string, add = true) => {
    setUser((prev) => {
      if (!prev) return prev;
      const p: any = { ...prev };
      p.following = p.following || [];
      if (add) {
        if (!p.following.find((f: any) => f._id === targetId)) {
          p.following = [...p.following, { _id: targetId }];
        }
      } else {
        p.following = p.following.filter((f: any) => f._id !== targetId);
      }
      localStorage.setItem('user', JSON.stringify(p));
      return p;
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    // disconnect socket
    try {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, setAuth, loading, socket: socketRef.current, notifications, fetchNotifications, markNotificationRead, refreshUser, updateFollowing }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

