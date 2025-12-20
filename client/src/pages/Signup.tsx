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
    <div className="h-[100dvh] w-full bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/20 rounded-full blur-[120px] animate-pulse" />

      <div className="w-full max-w-md glass-panel p-10 rounded-[3rem] border-white/5 relative z-10 animate-scale-in max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold font-display mb-3 tracking-tight">Join UTH</h1>
          <p className="text-white/40 text-lg">Unmask your potential</p>
        </div>

        <div className="mb-8">
          <button
            type="button"
            onClick={() => setShowReqs(!showReqs)}
            className="w-full flex items-center justify-between bg-obsidian/40 border border-white/10 rounded-2xl px-6 py-4 text-white/60 hover:text-white transition-all"
          >
            <span className="text-sm font-bold">Requirements</span>
            {showReqs ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showReqs && (
            <div className="mt-4 rounded-2xl border border-white/5 p-6 bg-obsidian/20 space-y-3 animate-slide-up">
              <div className="flex items-center gap-3 text-sm">
                {nameOk ? <CheckCircle2 className="text-neon-blue" size={16} /> : <XCircle className="text-white/20" size={16} />}
                <span className={nameOk ? 'text-white' : 'text-white/40'}>Full name required</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {usernameOk ? <CheckCircle2 className="text-neon-blue" size={16} /> : <XCircle className="text-white/20" size={16} />}
                <span className={usernameOk ? 'text-white' : 'text-white/40'}>Username (3+ chars)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {emailOk ? <CheckCircle2 className="text-neon-blue" size={16} /> : <XCircle className="text-white/20" size={16} />}
                <span className={emailOk ? 'text-white' : 'text-white/40'}>Valid email address</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {passwordOk ? <CheckCircle2 className="text-neon-blue" size={16} /> : <XCircle className="text-white/20" size={16} />}
                <span className={passwordOk ? 'text-white' : 'text-white/40'}>Password (6+ chars)</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 text-sm flex items-center gap-3 animate-shake">
              <span className="text-lg">⚠️</span> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest ml-4">First</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-6 py-4 bg-obsidian/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-neon-purple focus:bg-obsidian/60 transition-all placeholder:text-white/10"
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest ml-4">Last</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-6 py-4 bg-obsidian/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-neon-purple focus:bg-obsidian/60 transition-all placeholder:text-white/10"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest ml-4">Username</label>
            <div className="relative group">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neon-purple transition-colors" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-obsidian/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-neon-purple focus:bg-obsidian/60 transition-all placeholder:text-white/10"
                placeholder="johndoe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest ml-4">Email</label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neon-purple transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-obsidian/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-neon-purple focus:bg-obsidian/60 transition-all placeholder:text-white/10"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest ml-4">Password</label>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neon-purple transition-colors" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-14 py-4 bg-obsidian/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-neon-purple focus:bg-obsidian/60 transition-all placeholder:text-white/10"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white font-bold text-[10px] uppercase"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-neon-purple text-black rounded-[2rem] font-bold text-lg shadow-xl shadow-neon-purple/20 active:scale-95 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-10 space-y-8">
          <div className="relative flex items-center">
            <div className="flex-1 border-t border-white/5"></div>
            <span className="px-4 text-white/20 text-xs font-bold uppercase tracking-widest">Or join with</span>
            <div className="flex-1 border-t border-white/5"></div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <a href={`${API_BASE}/auth/google`} className="flex items-center justify-center py-4 glass-button rounded-2xl hover:bg-white/5 transition-all">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </a>
            <a href={`${API_BASE}/auth/github`} className="flex items-center justify-center py-4 glass-button rounded-2xl hover:bg-white/5 transition-all">
              <Github className="w-6 h-6 text-white" />
            </a>
            <a href={`${API_BASE}/auth/facebook`} className="flex items-center justify-center py-4 glass-button rounded-2xl hover:bg-white/5 transition-all">
              <Facebook className="w-6 h-6 text-blue-500" />
            </a>
          </div>
        </div>

        <p className="mt-10 text-center text-white/40 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-neon-purple hover:text-white font-bold transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

