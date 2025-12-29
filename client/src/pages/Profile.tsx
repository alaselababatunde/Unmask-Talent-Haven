import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api';
import MobileLayout from '../components/MobileLayout';
import { useAuth } from '../context/AuthContext';
import { Trophy, Heart, Video, MoreVertical, Image as ImageIcon, X, Music, Archive, Trash2, Edit, BarChart2, Users, Activity, ShieldOff } from 'lucide-react';
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
    settings?: {
      isPrivate: boolean;
    };
  };
  posts: Array<{
    _id: string;
    mediaType: 'video' | 'audio' | 'text' | 'sign-language';
    mediaUrl: string;
    thumbnail?: string;
    caption: string;
    tags: string[];
    isArchived?: boolean;
    likes: string[];
    views: number;
  }>;
}

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, login, signup, updateFollowing } = useAuth();
  const navigate = useNavigate();
  const [customizeOpen, setCustomizeOpen] = useState(false);
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
  const [selectedPostForActions, setSelectedPostForActions] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<any | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editTags, setEditTags] = useState('');
  const [insightsOpen, setInsightsOpen] = useState(false);

  const userId = id || currentUser?.id;

  const { data, refetch } = useQuery<UserData>({
    queryKey: ['user', userId],
    queryFn: async () => {
      // Logic: This consumes the same post source as FYP via the user-filtered controller.
      const response = await api.get(`/user/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });

  const isOwnProfile = userId === currentUser?.id;


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
    onMutate: () => {
      if (userId) updateFollowing(userId, true);
    },
    onError: () => {
      if (userId) updateFollowing(userId, false);
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
    onMutate: () => {
      if (userId) updateFollowing(userId, false);
    },
    onError: () => {
      if (userId) updateFollowing(userId, true);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      await api.delete(`/feed/${postId}`);
    },
    onSuccess: () => {
      refetch();
      setIsDeleting(null);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (postId: string) => {
      await api.post(`/feed/${postId}/archive`);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ postId, caption, tags }: { postId: string; caption: string; tags: string }) => {
      const response = await api.put(`/feed/${postId}`, { caption, tags });
      return response.data;
    },
    onSuccess: () => {
      refetch();
      setIsEditing(null);
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
      <MobileLayout>
        <div className="h-full w-full bg-primary flex items-center justify-center p-6 relative overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/20 rounded-full blur-[120px] animate-pulse" />

          <div className="w-full max-w-md glass-panel p-10 rounded-[3rem] border-white/5 relative z-10 animate-scale-in">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold font-display mb-3 tracking-tight">Unmask</h2>
              <p className="text-white/40 text-lg">Join the future of talent</p>
            </div>

            <div className="flex bg-obsidian/50 p-1.5 rounded-2xl border border-white/5 mb-8">
              <button
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${authMode === 'login' ? 'bg-neon-purple text-black shadow-lg shadow-neon-purple/20' : 'text-white/40'}`}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${authMode === 'signup' ? 'bg-neon-purple text-black shadow-lg shadow-neon-purple/20' : 'text-white/40'}`}
                onClick={() => setAuthMode('signup')}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-6">
              {authError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 text-sm flex items-center gap-3 animate-shake">
                  <X size={18} className="flex-shrink-0" /> {authError}
                </div>
              )}

              {authMode === 'signup' && (
                <div className="space-y-6 animate-slide-up">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-obsidian/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-neon-purple transition-all"
                      placeholder="First"
                      required
                    />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-obsidian/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-neon-purple transition-all"
                      placeholder="Last"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-obsidian/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-neon-purple transition-all"
                    placeholder="Username"
                    required
                  />
                </div>
              )}

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-obsidian/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-neon-purple transition-all"
                placeholder="Email"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-obsidian/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-neon-purple transition-all pr-16"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white font-bold text-xs uppercase"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-5 bg-neon-purple text-black rounded-[2rem] font-bold text-lg shadow-xl shadow-neon-purple/20 active:scale-95 transition-all disabled:opacity-50 mt-4"
              >
                {authLoading ? 'Processing...' : authMode === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!data) {
    return (
      <MobileLayout>
        <div className="h-full w-full bg-primary flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-neon-purple/20 border-t-neon-purple rounded-full animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="h-full w-full overflow-y-auto no-scrollbar">
        {/* Immersive Header */}
        <div className="h-64 bg-gradient-to-b from-neon-purple/20 to-primary relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent" />

          <div className="absolute top-8 left-6 right-6 flex items-center justify-between z-20">
            <button onClick={() => navigate(-1)} className="p-2 glass-button rounded-full">
              <X size={24} />
            </button>
            <div className="flex gap-3">
              {isOwnProfile && (
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 glass-button rounded-full relative">
                  <MoreVertical size={24} />
                  {menuOpen && (
                    <div className="absolute right-0 mt-4 w-56 glass-panel rounded-2xl border-white/5 shadow-2xl z-50 overflow-hidden animate-scale-in origin-top-right">
                      <button onClick={() => navigate('/settings')} className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors">Settings</button>
                      <button onClick={() => navigate('/balance')} className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors">Wallet</button>
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-20 -mt-32 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Profile Card */}
            <div className="glass-panel rounded-[3rem] p-10 border-white/5 shadow-2xl mb-10 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="relative">
                  <div className="w-36 h-36 rounded-full p-1 bg-gradient-to-br from-neon-purple to-neon-blue shadow-[0_0_40px_rgba(176,38,255,0.3)]">
                    <div className="w-full h-full rounded-full bg-obsidian overflow-hidden">
                      {data.user.profileImage ? (
                        <img src={data.user.profileImage} alt={data.user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neon-purple text-5xl font-bold">
                          {data.user.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  {data.user.isLive && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-red-500 text-white text-[10px] font-black rounded-full shadow-lg border-4 border-obsidian animate-pulse">
                      LIVE
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                    <div className="w-full">
                      <h1 className="text-3xl font-bold font-display tracking-tight mb-1 truncate">
                        {data.user.firstName ? `${data.user.firstName} ${data.user.lastName}` : data.user.username}
                      </h1>
                      <p className="text-neon-blue font-bold text-sm">@{data.user.username}</p>
                    </div>

                    <div className="flex gap-3">
                      {isOwnProfile ? (
                        <>
                          <button
                            onClick={() => setCustomizeOpen(true)}
                            className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all"
                          >
                            Edit Profile
                          </button>
                          <button
                            onClick={() => setInsightsOpen(true)}
                            className="p-3 glass-button rounded-2xl text-neon-blue"
                          >
                            <BarChart2 size={24} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => data.user.followers.some(f => f._id === currentUser?.id) ? unfollowMutation.mutate() : followMutation.mutate()}
                            className={`px-8 py-3 rounded-2xl font-bold transition-all ${data.user.followers.some(f => f._id === currentUser?.id)
                              ? 'bg-white/5 border border-white/10'
                              : 'bg-neon-purple text-black shadow-lg shadow-neon-purple/20'
                              }`}
                          >
                            {data.user.followers.some(f => f._id === currentUser?.id) ? 'Following' : 'Follow'}
                          </button>
                          <button onClick={() => navigate('/chat')} className="p-3 glass-button rounded-2xl">
                            <Music size={24} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-white/60 text-base leading-relaxed mb-8 max-w-2xl break-words">
                    {data.user.bio || "No bio yet. Unmask your talent!"}
                  </p>

                  <div className="flex justify-center md:justify-start gap-12 border-t border-white/5 pt-8">
                    <div className="text-center md:text-left">
                      <p className="text-2xl font-black">{data.posts.length}</p>
                      <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Posts</p>
                    </div>
                    <div
                      className="text-center md:text-left cursor-pointer hover:opacity-70 transition-opacity"
                      onClick={() => navigate(`/profile/${userId}/follows?tab=followers`)}
                    >
                      <p className="text-2xl font-black">{data.user.followers.length}</p>
                      <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Followers</p>
                    </div>
                    <div
                      className="text-center md:text-left cursor-pointer hover:opacity-70 transition-opacity"
                      onClick={() => navigate(`/profile/${userId}/follows?tab=following`)}
                    >
                      <p className="text-2xl font-black">{data.user.following.length}</p>
                      <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Following</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements & Badges */}
            {(data.user.achievements?.length > 0 || data.user.badges?.length > 0) && (
              <div className="mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between mb-4 px-4">
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-white/20">Achievements & Badges</h2>
                  <Trophy size={14} className="text-neon-purple" />
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2">
                  {data.user.badges?.map((badge, i) => (
                    <div key={`badge-${i}`} className="flex-shrink-0 w-32 h-32 glass-panel rounded-3xl border-white/5 flex flex-col items-center justify-center gap-2 group hover:bg-white/5 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Trophy className="text-neon-blue" size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60 text-center px-2">{badge}</span>
                    </div>
                  ))}
                  {data.user.achievements?.map((achievement, i) => (
                    <div key={`ach-${i}`} className="flex-shrink-0 w-32 h-32 glass-panel rounded-3xl border-white/5 flex flex-col items-center justify-center gap-2 group hover:bg-white/5 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-neon-purple/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Trophy className="text-neon-purple" size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60 text-center px-2">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Grid */}
            <div className="flex items-center justify-between mb-6 px-4">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-white/20">Talent Showcase</h2>
              <Video size={14} className="text-white/20" />
            </div>

            {data.user.settings?.isPrivate && !isOwnProfile && !data.user.followers.some(f => f._id === currentUser?.id) ? (
              <div className="glass-panel rounded-[3rem] p-20 border-white/5 text-center space-y-6 animate-scale-in">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <ShieldOff size={40} className="text-white/20" />
                </div>
                <h3 className="text-2xl font-bold">This Account is Private</h3>
                <p className="text-white/40 max-w-xs mx-auto">Follow this creator to see their talent showcase and exclusive content.</p>
              </div>
            ) : data.posts.length === 0 ? (
              <div className="glass-panel rounded-[3rem] p-20 border-white/5 text-center space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Video size={40} className="text-white/20" />
                </div>
                <h3 className="text-2xl font-bold">No Posts Yet</h3>
                <p className="text-white/40 max-w-xs mx-auto">This creator hasn't unmasked any talent yet. Stay tuned!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 md:gap-6">
                {data.posts.map((post) => (
                  <div
                    key={post._id}
                    onClick={() => navigate(`/feed?post=${post._id}`)}
                    className="aspect-[3/4] rounded-3xl overflow-hidden relative group cursor-pointer bg-obsidian/40 border border-white/5"
                  >
                    {post.mediaType === 'text' ? (
                      <div className="w-full h-full p-6 flex items-center justify-center text-center">
                        <p className="text-sm font-display line-clamp-6 leading-relaxed">{post.caption}</p>
                      </div>
                    ) : (
                      <img src={post.thumbnail || post.mediaUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6">
                      <div className="flex items-center gap-4 text-white">
                        <div className="flex items-center gap-1.5">
                          <Heart size={16} className="fill-neon-purple text-neon-purple" />
                          <span className="text-xs font-bold">{post.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Video size={16} className="text-neon-blue" />
                          <span className="text-xs font-bold">{post.views || 0}</span>
                        </div>
                      </div>
                    </div>

                    {isOwnProfile && (
                      <div className="absolute top-4 right-4 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPostForActions(post);
                          }}
                          className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 transition-all"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Post Actions Bottom Sheet */}
      {selectedPostForActions && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedPostForActions(null)}
          />
          <div className="relative w-full max-w-lg bg-obsidian rounded-t-[3rem] border-t border-white/10 shadow-2xl animate-slide-up overflow-hidden">
            <div className="p-6 border-b border-white/5 flex flex-col items-center">
              <div className="w-12 h-1.5 bg-white/10 rounded-full mb-6" />
              <h3 className="text-lg font-bold">Post Options</h3>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setIsEditing(selectedPostForActions);
                  setEditCaption(selectedPostForActions.caption);
                  setEditTags(selectedPostForActions.tags?.join(', ') || '');
                  setSelectedPostForActions(null);
                }}
                className="w-full flex items-center gap-4 p-5 rounded-2xl hover:bg-white/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-neon-blue/10 flex items-center justify-center text-neon-blue group-active:scale-90 transition-transform">
                  <Edit size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold">Edit Post</p>
                  <p className="text-xs text-white/40">Change caption or tags</p>
                </div>
              </button>

              <button
                onClick={() => {
                  archiveMutation.mutate(selectedPostForActions._id);
                  setSelectedPostForActions(null);
                }}
                className="w-full flex items-center gap-4 p-5 rounded-2xl hover:bg-white/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-neon-purple/10 flex items-center justify-center text-neon-purple group-active:scale-90 transition-transform">
                  <Archive size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold">{selectedPostForActions.isArchived ? 'Unarchive Post' : 'Archive Post'}</p>
                  <p className="text-xs text-white/40">{selectedPostForActions.isArchived ? 'Make it visible again' : 'Hide from your profile'}</p>
                </div>
              </button>

              <div className="h-px bg-white/5 mx-4 my-2" />

              <button
                onClick={() => {
                  setIsDeleting(selectedPostForActions._id);
                  setSelectedPostForActions(null);
                }}
                className="w-full flex items-center gap-4 p-5 rounded-2xl hover:bg-red-500/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-active:scale-90 transition-transform">
                  <Trash2 size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-red-500">Delete Post</p>
                  <p className="text-xs text-red-500/40">This action is permanent</p>
                </div>
              </button>
            </div>
            <div className="p-6 pb-10">
              <button
                onClick={() => setSelectedPostForActions(null)}
                className="w-full py-4 bg-white/5 rounded-2xl font-bold text-white/60 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customize Modal */}
      {customizeOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setCustomizeOpen(false)} />
          <div className="relative w-full max-w-2xl glass-panel rounded-[3rem] border-white/5 shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-2xl font-bold font-display">Edit Profile</h2>
              <button onClick={() => setCustomizeOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-center">
                <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-neon-purple bg-obsidian">
                    {avatarFile ? (
                      <img src={URL.createObjectURL(avatarFile)} className="w-full h-full object-cover" />
                    ) : (
                      <img src={data.user.profileImage} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded-full cursor-pointer">
                    <ImageIcon className="text-white" size={32} />
                    <input type="file" className="hidden" onChange={(e) => e.target.files && setAvatarFile(e.target.files[0])} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <input
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full bg-obsidian/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-neon-purple transition-all"
                  placeholder="First Name"
                />
                <input
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full bg-obsidian/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-neon-purple transition-all"
                  placeholder="Last Name"
                />
              </div>
              <input
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="w-full bg-obsidian/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-neon-purple transition-all"
                placeholder="Username"
              />
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full h-32 bg-obsidian/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-neon-purple transition-all resize-none"
                placeholder="Bio"
              />

              <button
                onClick={handleCustomizeSave}
                disabled={saving}
                className="w-full py-5 bg-neon-purple text-black rounded-[2rem] font-bold text-lg shadow-xl shadow-neon-purple/20 active:scale-95 transition-all"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Post Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsEditing(null)} />
          <div className="relative w-full max-w-lg glass-panel rounded-[3rem] border-white/5 shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-2xl font-bold font-display">Edit Post</h2>
              <button onClick={() => setIsEditing(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-white/40 uppercase tracking-widest mb-3">Caption</label>
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    className="w-full h-32 bg-obsidian/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-neon-purple transition-all resize-none"
                    placeholder="Update your caption..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/40 uppercase tracking-widest mb-3">Tags</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full bg-obsidian/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-neon-purple transition-all"
                    placeholder="#talent, #art"
                  />
                </div>
              </div>
              <button
                onClick={() => updateMutation.mutate({ postId: isEditing._id, caption: editCaption, tags: editTags })}
                className="w-full py-5 bg-neon-purple text-black rounded-[2rem] font-bold text-lg shadow-xl shadow-neon-purple/20 active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsDeleting(null)} />
          <div className="relative w-full max-w-sm glass-panel rounded-[3rem] border-red-500/20 shadow-2xl overflow-hidden animate-scale-in text-center p-10">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="text-red-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Delete Post?</h2>
            <p className="text-white/60 mb-10">This action is permanent and cannot be undone. Your talent will be unmasked from the world.</p>
            <div className="space-y-4">
              <button
                onClick={() => deleteMutation.mutate(isDeleting)}
                className="w-full py-5 bg-red-500 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-red-500/20 active:scale-95 transition-all"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => setIsDeleting(null)}
                className="w-full py-5 bg-white/5 text-white rounded-[2rem] font-bold text-lg hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insights Modal */}
      {insightsOpen && data && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setInsightsOpen(false)} />
          <div className="relative w-full max-w-2xl glass-panel rounded-[3rem] border-white/5 shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neon-blue/10 rounded-xl">
                  <BarChart2 className="text-neon-blue" size={24} />
                </div>
                <h2 className="text-2xl font-bold font-display">Creator Insights</h2>
              </div>
              <button onClick={() => setInsightsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-10 space-y-10">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 glass-panel rounded-3xl border-white/5 bg-white/5">
                  <div className="flex items-center gap-3 text-white/40 mb-2">
                    <Video size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Total Views</span>
                  </div>
                  <p className="text-3xl font-black">{data.posts.reduce((acc, p) => acc + (p.views || 0), 0).toLocaleString()}</p>
                </div>
                <div className="p-6 glass-panel rounded-3xl border-white/5 bg-white/5">
                  <div className="flex items-center gap-3 text-white/40 mb-2">
                    <Heart size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Total Likes</span>
                  </div>
                  <p className="text-3xl font-black">{data.posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0).toLocaleString()}</p>
                </div>
                <div className="p-6 glass-panel rounded-3xl border-white/5 bg-white/5">
                  <div className="flex items-center gap-3 text-white/40 mb-2">
                    <Activity size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Engagement</span>
                  </div>
                  <p className="text-3xl font-black">
                    {data.posts.length > 0
                      ? ((data.posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0) / data.posts.reduce((acc, p) => acc + Math.max(1, p.views || 0), 0)) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
                <div className="p-6 glass-panel rounded-3xl border-white/5 bg-white/5">
                  <div className="flex items-center gap-3 text-white/40 mb-2">
                    <Users size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Followers</span>
                  </div>
                  <p className="text-3xl font-black">{data.user.followers.length.toLocaleString()}</p>
                </div>
              </div>


              <button
                onClick={() => setInsightsOpen(false)}
                className="w-full py-5 bg-white/5 text-white rounded-[2rem] font-bold text-lg hover:bg-white/10 transition-all"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default Profile;

