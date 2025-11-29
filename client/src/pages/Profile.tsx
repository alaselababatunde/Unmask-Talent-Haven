import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Edit, Trophy, Heart, Video, MoreVertical, User, Image as ImageIcon, X, FileText, Music } from 'lucide-react';
import { useState, useEffect } from 'react';

interface UserData {
  user: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username: string;
    email: string;
    profileImage?: string;
    bio?: string;
    followers: Array<{ _id: string; username: string; profileImage?: string }>;
    following: Array<{ _id: string; username: string; profileImage?: string }>;
    achievements: string[];
    badges: string[];
    isLive?: boolean;
  };
  posts: Array<{
    _id: string;
    mediaType: 'video' | 'audio' | 'text' | 'sign-language';
    mediaUrl: string;
    thumbnail?: string;
    caption: string;
    likes: string[];
    views: number;
  }>;
}

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, login, signup } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [bio, setBio] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const userId = id || currentUser?.id;

  const { data, refetch } = useQuery<UserData>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await api.get(`/user/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });

  const isOwnProfile = userId === currentUser?.id;

  const handleSaveBio = async () => {
    try {
      await api.put(`/user/${userId}`, { bio });
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('Failed to update bio');
    }
  };

  const handleCustomizeSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const form = new FormData();
      form.append('firstName', editFirstName);
      form.append('lastName', editLastName);
      form.append('username', editUsername);
      form.append('bio', editBio);
      if (avatarFile) form.append('profileImage', avatarFile);

      await api.put(`/user/${userId}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCustomizeOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const followMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/user/${userId}/follow`);
      return response.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/user/${userId}/unfollow`);
      return response.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (data && customizeOpen) {
      setEditFirstName(data.user.firstName || '');
      setEditLastName(data.user.lastName || '');
      setEditUsername(data.user.username || '');
      setEditBio(data.user.bio || '');
    }
  }, [data, customizeOpen]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await signup(firstName, lastName, username, email, password);
      }
      navigate('/feed');
    } catch (err: any) {
      setAuthError(err?.response?.data?.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-matte-black pb-24 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-deep-purple to-[#7B4B27]" />

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome</h2>
            <p className="text-accent-beige/60">Join the community to share your talent</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-black/40 rounded-full p-1 border border-white/10">
              <button
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${authMode === 'login'
                  ? 'bg-deep-purple text-white shadow-lg shadow-deep-purple/20'
                  : 'text-accent-beige/60 hover:text-white'
                  }`}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${authMode === 'signup'
                  ? 'bg-deep-purple text-white shadow-lg shadow-deep-purple/20'
                  : 'text-accent-beige/60 hover:text-white'
                  }`}
                onClick={() => setAuthMode('signup')}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-5">
            {authError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 rounded-2xl p-4 text-sm flex items-center gap-2 animate-shake">
                <span className="text-lg">⚠️</span> {authError}
              </div>
            )}

            {authMode === 'signup' && (
              <div className="animate-slide-up">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-accent-beige/80 mb-2 text-xs font-bold uppercase tracking-wider">First name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-deep-purple focus:bg-black/60 transition-all placeholder:text-white/20"
                      placeholder="John"
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
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-accent-beige/80 mb-2 text-xs font-bold uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-deep-purple focus:bg-black/60 transition-all placeholder:text-white/20"
                    placeholder="johndoe"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-accent-beige/80 mb-2 text-xs font-bold uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-deep-purple focus:bg-black/60 transition-all placeholder:text-white/20"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-accent-beige/80 mb-2 text-xs font-bold uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-deep-purple focus:bg-black/60 pr-16 transition-all placeholder:text-white/20"
                  placeholder="••••••••"
                  required
                  minLength={authMode === 'signup' ? 6 : undefined}
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
              disabled={authLoading}
              className="w-full py-4 bg-gradient-to-r from-deep-purple to-[#7B4B27] hover:brightness-110 text-white rounded-2xl font-bold shadow-lg shadow-deep-purple/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {authLoading ? (authMode === 'login' ? 'Logging in...' : 'Creating account...') : (authMode === 'login' ? 'Login' : 'Sign Up')}
            </button>
          </form>
        </div>
        <Navbar />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-deep-purple/30 border-t-deep-purple rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-matte-black pb-24">
      {/* Cover Image Placeholder (Optional) */}
      <div className="h-48 bg-gradient-to-b from-deep-purple/20 to-matte-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-matte-black to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative -mt-20">
        {/* Profile Header */}
        <div className="glass-panel rounded-3xl p-6 mb-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-deep-purple to-[#7B4B27]" />

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative group mx-auto md:mx-0">
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-deep-purple to-[#7B4B27] shadow-[0_0_30px_rgba(147,51,234,0.3)]">
                <div className="w-full h-full rounded-full bg-matte-black overflow-hidden relative">
                  {data.user.profileImage ? (
                    <img
                      src={data.user.profileImage}
                      alt={data.user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-deep-purple/20 text-deep-purple text-4xl font-bold">
                      {data.user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              {data.user.isLive && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg border-2 border-matte-black animate-pulse">
                  LIVE
                </div>
              )}
            </div>

            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1 shadow-black drop-shadow-md">
                    {data.user.firstName && data.user.lastName
                      ? `${data.user.firstName} ${data.user.lastName}`
                      : data.user.username}
                  </h1>
                  <p className="text-accent-beige/60 font-medium">@{data.user.username}</p>
                </div>

                {isOwnProfile ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setIsEditing(!isEditing);
                        setBio(data.user.bio || '');
                      }}
                      className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all border border-white/10 hover:border-deep-purple/50"
                    >
                      <Edit size={20} />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen((v) => !v)}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all border border-white/10 hover:border-deep-purple/50"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                      >
                        <MoreVertical size={20} />
                      </button>
                      {menuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-matte-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden animate-fade-in">
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              navigate('/live');
                            }}
                            className="w-full text-left px-5 py-3 text-accent-beige hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
                          >
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Go Live
                          </button>
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              navigate('/balance');
                            }}
                            className="w-full text-left px-5 py-3 text-accent-beige hover:bg-white/10 hover:text-white transition-colors"
                          >
                            Wallet & Balance
                          </button>
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              setCustomizeOpen(true);
                            }}
                            className="w-full text-left px-5 py-3 text-accent-beige hover:bg-white/10 hover:text-white transition-colors"
                          >
                            Customize Profile
                          </button>
                          <div className="h-px bg-white/5 my-1" />
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              navigate('/settings');
                            }}
                            className="w-full text-left px-5 py-3 text-accent-beige hover:bg-white/10 hover:text-white transition-colors"
                          >
                            Settings
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {currentUser ? (
                      data.user.followers.some(f => f._id === currentUser.id) ? (
                        <button
                          onClick={() => unfollowMutation.mutate()}
                          className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-bold transition-all"
                        >
                          Unfollow
                        </button>
                      ) : (
                        <button
                          onClick={() => followMutation.mutate()}
                          className="px-6 py-2.5 bg-deep-purple hover:bg-deep-purple/80 text-white rounded-full font-bold shadow-lg shadow-deep-purple/20 transition-all transform hover:scale-105"
                        >
                          Follow
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-2.5 bg-deep-purple hover:bg-deep-purple/80 text-white rounded-full font-bold shadow-lg shadow-deep-purple/20 transition-all transform hover:scale-105"
                      >
                        Follow
                      </button>
                    )}
                    <button
                      onClick={() => navigate('/chat')}
                      className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-bold transition-all"
                    >
                      Message
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4 animate-fade-in">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-deep-purple resize-none placeholder:text-white/20"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setBio(data.user.bio || '');
                      }}
                      className="px-5 py-2 bg-transparent text-accent-beige/60 hover:text-white font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveBio}
                      className="px-6 py-2 bg-deep-purple hover:bg-deep-purple/80 text-white rounded-full font-bold shadow-lg shadow-deep-purple/20 transition-all"
                    >
                      Save Bio
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-accent-beige/80 mb-6 text-lg leading-relaxed max-w-2xl">{data.user.bio || 'No bio yet'}</p>
              )}

              <div className="flex justify-center md:justify-start gap-8 border-t border-white/5 pt-6">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-2xl font-bold text-white">{data.posts.length}</span>
                  <span className="text-accent-beige/40 text-xs font-bold uppercase tracking-wider">Posts</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-2xl font-bold text-white">{data.user.followers.length}</span>
                  <span className="text-accent-beige/40 text-xs font-bold uppercase tracking-wider">Followers</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-2xl font-bold text-white">{data.user.following.length}</span>
                  <span className="text-accent-beige/40 text-xs font-bold uppercase tracking-wider">Following</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {(data.user.achievements.length > 0 || data.user.badges.length > 0) && (
          <div className="glass-panel rounded-3xl p-6 mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-lg">
                <Trophy className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold text-white">Achievements & Badges</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {data.user.achievements.map((achievement, i) => (
                <div
                  key={i}
                  className="px-4 py-2 bg-deep-purple/10 border border-deep-purple/30 rounded-full text-deep-purple text-sm font-bold flex items-center gap-2"
                >
                  <span>🏆</span> {achievement}
                </div>
              ))}
              {data.user.badges.map((badge, i) => (
                <div
                  key={i}
                  className="px-4 py-2 bg-[#7B4B27]/10 border border-[#7B4B27]/30 rounded-full text-[#7B4B27] text-sm font-bold flex items-center gap-2"
                >
                  <span>🎖️</span> {badge}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/5 rounded-lg">
              <Video className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Posts</h2>
          </div>

          {data.posts.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-3xl border-dashed border-2 border-white/10">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video size={32} className="text-accent-beige/20" />
              </div>
              <p className="text-accent-beige/60 text-lg">No posts yet</p>
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/upload')}
                  className="mt-4 px-6 py-2 bg-deep-purple text-white rounded-full font-bold hover:bg-deep-purple/80 transition-all"
                >
                  Create your first post
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {data.posts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => navigate(`/feed?post=${post._id}`)}
                  className="aspect-square bg-white/5 rounded-xl overflow-hidden cursor-pointer relative group"
                >
                  {post.mediaType === 'text' ? (
                    <div className="w-full h-full bg-gradient-to-br from-deep-purple/20 to-black p-4 flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                      <p className="text-white text-xs font-serif text-center line-clamp-4 leading-relaxed z-10">
                        {post.caption}
                      </p>
                      <FileText className="absolute bottom-2 right-2 text-white/20" size={24} />
                    </div>
                  ) : post.mediaType === 'audio' ? (
                    <div className="w-full h-full bg-gradient-to-br from-[#7B4B27]/40 to-black flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Music size={32} className="text-white/80" />
                    </div>
                  ) : (
                    <img
                      src={post.thumbnail || post.mediaUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex flex-col gap-2 text-white font-bold">
                      <div className="flex items-center gap-2">
                        <Heart size={16} className="fill-white" />
                        <span>{post.likes.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video size={16} />
                        <span>{post.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customize Profile Modal */}
      {customizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-matte-black border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h2 className="text-xl font-bold text-white">Customize Profile</h2>
              <button
                onClick={() => setCustomizeOpen(false)}
                className="text-accent-beige/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-deep-purple bg-black">
                    {avatarFile ? (
                      <img src={URL.createObjectURL(avatarFile)} className="w-full h-full object-cover" />
                    ) : data.user.profileImage ? (
                      <img src={data.user.profileImage} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-deep-purple/20 text-deep-purple text-2xl font-bold">
                        {data.user.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                    <ImageIcon className="text-white" size={24} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) setAvatarFile(e.target.files[0]);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-accent-beige/80 mb-2 text-xs font-bold uppercase tracking-wider">First name</label>
                  <input
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-deep-purple focus:bg-black/60 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-accent-beige/80 mb-2 text-xs font-bold uppercase tracking-wider">Last name</label>
                  <input
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-deep-purple focus:bg-black/60 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-accent-beige/80 mb-2 text-xs font-bold uppercase tracking-wider">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-purple" size={18} />
                  <input
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-deep-purple focus:bg-black/60 transition-all"
                    minLength={3}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-accent-beige/80 mb-2 text-xs font-bold uppercase tracking-wider">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full h-32 p-4 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-deep-purple focus:bg-black/60 resize-none transition-all"
                  maxLength={500}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCustomizeSave}
                  disabled={saving}
                  className="flex-1 px-4 py-3.5 bg-deep-purple hover:bg-deep-purple/80 text-white rounded-2xl font-bold shadow-lg shadow-deep-purple/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setCustomizeOpen(false)}
                  className="flex-1 px-4 py-3.5 bg-transparent border border-white/10 hover:bg-white/5 text-white rounded-2xl font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Navbar />
    </div>
  );
};

export default Profile;

