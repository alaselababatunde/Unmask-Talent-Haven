import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Github, Facebook, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [showReqs, setShowReqs] = useState(false);

  const nameOk = firstName.trim().length >= 1 && lastName.trim().length >= 1;
  const usernameOk = username.trim().length >= 3;
  const emailOk = /.+@.+\..+/.test(email);
  const passwordOk = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(firstName, lastName, username, email, password);
      navigate('/feed');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-purple-brown flex items-center justify-center p-4">
      <div className="bg-matte-black/90 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent-beige mb-2">UTH</h1>
          <p className="text-deep-purple/80 text-lg">Unmask Talent Haven</p>
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowReqs(!showReqs)}
            className="w-full flex items-center justify-between bg-matte-black border border-deep-purple/30 rounded-2xl px-4 py-3 text-accent-beige hover:border-deep-purple transition"
          >
            <span className="text-sm font-semibold">Sign up requirements</span>
            {showReqs ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showReqs && (
            <div className="mt-2 rounded-2xl border border-deep-purple/30 p-4 bg-deep-purple/5 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {nameOk ? <CheckCircle2 className="text-green-400" size={16} /> : <XCircle className="text-red-400" size={16} />}
                <span className="text-accent-beige/80">First and last name required</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {usernameOk ? <CheckCircle2 className="text-green-400" size={16} /> : <XCircle className="text-red-400" size={16} />}
                <span className="text-accent-beige/80">Username at least 3 characters</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {emailOk ? <CheckCircle2 className="text-green-400" size={16} /> : <XCircle className="text-red-400" size={16} />}
                <span className="text-accent-beige/80">Valid email address</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {passwordOk ? <CheckCircle2 className="text-green-400" size={16} /> : <XCircle className="text-red-400" size={16} />}
                <span className="text-accent-beige/80">Password at least 6 characters</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 rounded-2xl p-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-accent-beige/80 mb-2 text-sm">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple focus:glow-purple"
                placeholder="First name"
                required
              />
            </div>
            <div>
              <label className="block text-accent-beige/80 mb-2 text-sm">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple focus:glow-purple"
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-accent-beige/80 mb-2 text-sm">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-deep-purple" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple focus:glow-purple"
                placeholder="username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-accent-beige/80 mb-2 text-sm">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-deep-purple" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple focus:glow-purple"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-accent-beige/80 mb-2 text-sm">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-deep-purple" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-16 py-3 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple focus:glow-purple"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-beige/60 hover:text-accent-beige text-xs"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-deep-purple hover:bg-deep-purple/80 text-accent-beige rounded-2xl font-semibold transition-all glow-purple disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-deep-purple/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-matte-black text-accent-beige/60">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <a
              href={`${API_BASE}/auth/google`}
              className="flex items-center justify-center py-3 bg-matte-black border border-deep-purple/30 rounded-2xl hover:bg-deep-purple/10 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </a>
            <a
              href={`${API_BASE}/auth/github`}
              className="flex items-center justify-center py-3 bg-matte-black border border-deep-purple/30 rounded-2xl hover:bg-deep-purple/10 transition-all"
            >
              <Github className="w-5 h-5 text-accent-beige" />
            </a>
            <a
              href={`${API_BASE}/auth/facebook`}
              className="flex items-center justify-center py-3 bg-matte-black border border-deep-purple/30 rounded-2xl hover:bg-deep-purple/10 transition-all"
            >
              <Facebook className="w-5 h-5 text-blue-500" />
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-accent-beige/60 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-deep-purple hover:text-deep-purple/80 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

