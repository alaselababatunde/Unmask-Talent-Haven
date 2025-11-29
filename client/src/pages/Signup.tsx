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
    <div className="min-h-screen bg-matte-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-deep-purple/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#7B4B27]/20 rounded-full blur-[100px]" />
      </div>

      <div className="glass-panel rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10 animate-fade-in border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-deep-purple to-[#7B4B27] mb-2">UTH</h1>
          <p className="text-accent-beige/60 text-lg font-medium">Unmask Talent Haven</p>
        </div>

        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowReqs(!showReqs)}
            className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-accent-beige hover:bg-white/10 transition-all"
          >
            <span className="text-sm font-bold">Sign up requirements</span>
            {showReqs ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showReqs && (
            <div className="mt-2 rounded-2xl border border-white/10 p-4 bg-black/40 space-y-2 animate-slide-up">
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 rounded-2xl p-4 text-sm flex items-center gap-2 animate-shake">
              <span className="text-lg">⚠️</span> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-accent-beige/80 mb-2 text-xs font-bold uppercase tracking-wider">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-deep-purple focus:bg-black/60 transition-all placeholder:text-white/20"
                placeholder="First name"
                required
              />
            </div>
            <div>
              <label className="block text-accent-beige/80 mb-2 text-xs font-bold uppercase tracking-wider">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-deep-purple focus:bg-black/60 transition-all placeholder:text-white/20"
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-accent-beige/80 mb-2 text-xs font-bold uppercase tracking-wider">Username</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-beige/40 group-focus-within:text-deep-purple transition-colors" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-deep-purple focus:bg-black/60 transition-all placeholder:text-white/20"
                placeholder="username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-accent-beige/80 mb-2 text-xs font-bold uppercase tracking-wider">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-beige/40 group-focus-within:text-deep-purple transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-deep-purple focus:bg-black/60 transition-all placeholder:text-white/20"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-accent-beige/80 mb-2 text-xs font-bold uppercase tracking-wider">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-beige/40 group-focus-within:text-deep-purple transition-colors" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-deep-purple focus:bg-black/60 transition-all placeholder:text-white/20"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-beige/40 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-deep-purple to-[#7B4B27] hover:brightness-110 text-white rounded-2xl font-bold shadow-lg shadow-deep-purple/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent backdrop-blur-md text-accent-beige/40">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <a
              href={`${API_BASE}/auth/google`}
              className="flex items-center justify-center py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </a>
            <a
              href={`${API_BASE}/auth/github`}
              className="flex items-center justify-center py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <Github className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </a>
            <a
              href={`${API_BASE}/auth/facebook`}
              className="flex items-center justify-center py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <Facebook className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

        <p className="mt-8 text-center text-accent-beige/60 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-deep-purple hover:text-white font-bold transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

