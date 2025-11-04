import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Fetch user data with token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api
        .get('/auth/me')
        .then((res) => {
          const user = res.data;
          setAuth(token, {
            id: user._id,
            username: user.username,
            email: user.email,
            profileImage: user.profileImage,
          });
          navigate('/feed');
        })
        .catch(() => {
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-matte-black">
      <div className="text-accent-beige text-xl">Authenticating...</div>
    </div>
  );
};

export default AuthCallback;

