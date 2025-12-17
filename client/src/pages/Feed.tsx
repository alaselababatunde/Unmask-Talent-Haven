import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api';
import Navbar from '../components/Navbar';
import ReactPlayer from 'react-player';
import { Heart, MessageCircle, Share2, Video, Music, FileText, Hand, Search, MoreVertical, Trash2, Edit, Forward, X, Plus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Post {
  _id: string;
  user: {
    _id: string;
    username: string;
    profileImage?: string;
    isLive?: boolean;
  };
  mediaType: 'video' | 'audio' | 'text' | 'sign-language';
  mediaUrl: string;
  caption: string;
  tags: string[];
  category: string;
  likes: string[];
  comments: Array<{
    user: {
      username: string;
      profileImage?: string;
    };
    text: string;
    createdAt: string;
  }>;
  views: number;
}

const Feed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const singlePostId = searchParams.get('post');
  const { user: currentUser, updateFollowing } = useAuth();
  const [playingIndex, setPlayingIndex] = useState(0);
  const playerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'text' | 'sign-language'>('video');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [postMenuOpen, setPostMenuOpen] = useState<string | null>(null);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editTags, setEditTags] = useState('');

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get('/feed/search', { params: { q: query } });
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  const { data: posts = [], refetch } = useQuery<Post[]>({
    queryKey: ['feed', activeTab],
    queryFn: async () => {
      const response = await api.get('/feed', { params: { mediaType: activeTab } });
      return response.data;
    },
    enabled: !singlePostId,
  });

  const { data: singlePost, isLoading: isLoadingSingle } = useQuery<Post>({
    queryKey: ['post', singlePostId],
    queryFn: async () => {
      const response = await api.get(`/feed/${singlePostId}`);
      return response.data;
    },
    enabled: !!singlePostId,
  });

  const displayPosts = singlePostId && singlePost ? [singlePost] : (searchQuery.trim() && searchResults.length > 0 ? searchResults : posts);

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.post(`/feed/${postId}/like`);
      return response.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const followMutation = useMutation<string, any, string>({
    mutationFn: async (targetId: string) => {
      const res = await api.post(`/user/${targetId}/follow`);
      return res.data;
    },
    onMutate: async (targetId: string) => {
      // optimistic update
      try {
        updateFollowing(targetId, true);
      } catch (e) { }
    },
    onError: (_, targetId) => {
      // rollback
      try { updateFollowing(targetId, false); } catch (e) { }
    },
    onSuccess: () => {
      refetch();
    },
  });

  const unfollowMutation = useMutation<string, any, string>({
    mutationFn: async (targetId: string) => {
      const res = await api.post(`/user/${targetId}/unfollow`);
      return res.data;
    },
    onMutate: async (targetId: string) => {
      try { updateFollowing(targetId, false); } catch (e) { }
    },
    onError: (_, targetId) => {
      try { updateFollowing(targetId, true); } catch (e) { }
    },
    onSuccess: () => {
      refetch();
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, text }: { postId: string; text: string }) => {
      const response = await api.post(`/feed/${postId}/comment`, { text });
      return response.data;
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
      if (singlePostId) {
        navigate('/profile'); // Go back to profile if deleted from single view
      } else {
        refetch();
      }
      setPostMenuOpen(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ postId, caption, tags }: { postId: string; caption: string; tags: string }) => {
      const response = await api.put(`/feed/${postId}`, { caption, tags });
      return response.data;
    },
    onSuccess: () => {
      refetch();
      setEditPostId(null);
      setEditCaption('');
      setEditTags('');
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = playerRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) {
              setPlayingIndex(index);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    playerRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [posts]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (postMenuOpen && !(e.target as Element).closest('.post-menu')) {
        setPostMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [postMenuOpen]);

  const handleLike = (postId: string) => {
    if (!currentUser) {
      navigate('/profile');
      return;
    }

    // Optimistic update
    // We don't manually update state here because react-query refetch will handle it,
    // but for immediate feedback we could. However, since we fixed the backend toggle,
    // the refetch in onSuccess will be correct.

    likeMutation.mutate(postId, {
      onError: (err) => {
        console.error('Like failed', err);
      }
    });
  };

  const handleComment = (postId: string, text: string) => {
    if (text.trim()) {
      commentMutation.mutate({ postId, text });
    }
  };

  const isVideoTab = activeTab === 'video' || activeTab === 'sign-language';
  // displayPosts is already defined above

  return (
    <div className="min-h-screen bg-matte-black pb-20 md:pb-0">
      {/* Category Tabs with Search */}
      <div className="sticky top-0 z-40 bg-matte-black/95 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3 overflow-x-auto flex-1 no-scrollbar mask-linear-fade">
              {[
                { key: 'video', label: 'Video', icon: Video },
                { key: 'audio', label: 'Audio', icon: Music },
                { key: 'text', label: 'Poetry', icon: FileText },
                { key: 'sign-language', label: 'Sign', icon: Hand },
              ].map((t: { key: string; label: string; icon: any }) => {
                const Icon = t.icon;
                const isActive = activeTab === (t.key as any);
                return (
                  <button
                    key={t.key}
                    onClick={() => {
                      setActiveTab(t.key as any);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${isActive
                      ? 'bg-gradient-to-r from-deep-purple to-[#7B4B27] text-white shadow-lg shadow-deep-purple/25 scale-105'
                      : 'bg-white/5 text-accent-beige/60 hover:bg-white/10 hover:text-accent-beige'
                      }`}
                  >
                    {Icon ? <Icon size={16} /> : null}
                    {t.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-3 rounded-full transition-all duration-300 ${showSearch
                ? 'bg-deep-purple text-white rotate-90'
                : 'bg-white/5 text-accent-beige/60 hover:bg-white/10 hover:text-accent-beige'
                }`}
            >
              <Search size={20} />
            </button>
          </div>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showSearch ? 'max-h-20 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-beige/40" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Search profiles, tags, or content..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple/50 focus:bg-white/10 transition-all placeholder:text-accent-beige/20"
              />
            </div>
          </div>
        </div>
      </div>

      {searchQuery.trim() && searchResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Search size={32} className="text-accent-beige/20" />
          </div>
          <p className="text-accent-beige/60 text-lg">No results found for "{searchQuery}"</p>
          <p className="text-accent-beige/40 text-sm mt-2">Try searching for something else</p>
        </div>
      )}

      {/* Single Post View Header */}
      {singlePostId && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-matte-black/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <X size={24} />
          </button>
          <span className="text-white font-bold text-lg">Post</span>
        </div>
      )}

      {(isVideoTab || singlePostId) && !(searchQuery.trim() && searchResults.length > 0) && (
        <div className="h-[calc(100vh-80px)] overflow-y-scroll snap-y snap-mandatory no-scrollbar relative">
          {singlePostId && isLoadingSingle && (
            <div className="h-full flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-deep-purple border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isLoadingSingle && displayPosts.map((post: Post, index: number) => (
            <div
              key={post._id}
              ref={(el) => {
                playerRefs.current[index] = el;
              }}
              className="snap-start h-[calc(100vh-80px)] w-full relative bg-black flex items-center justify-center"
            >
              {/* Media layer */}
              <div className="w-full h-full relative">
                {post.mediaType === 'video' || post.mediaType === 'sign-language' ? (
                  <div className="w-full h-full bg-black">
                    <ReactPlayer
                      url={post.mediaUrl}
                      playing={playingIndex === index}
                      controls={false}
                      loop
                      width="100%"
                      height="100%"
                      className="!h-full !w-full object-contain"
                      playsinline
                    />
                    {/* Gradient Overlay for better text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
                  </div>
                ) : post.mediaType === 'audio' ? (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-deep-purple/20 to-black relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-xl" />
                    <div className="relative z-10 w-full max-w-md px-8">
                      <div className="w-48 h-48 mx-auto bg-gradient-to-br from-deep-purple to-[#7B4B27] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(147,51,234,0.3)] mb-8 animate-pulse">
                        <Music size={64} className="text-white" />
                      </div>
                      <ReactPlayer
                        url={post.mediaUrl}
                        playing={playingIndex === index}
                        controls
                        width="100%"
                        height="50px"
                        className="!bg-transparent"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-full p-4 md:p-8 bg-gradient-to-br from-black to-deep-purple/10">
                    <div className="w-full max-w-2xl glass-panel p-6 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[50vh]">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-deep-purple to-[#7B4B27]" />
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
                      <FileText size={40} className="text-deep-purple/20 absolute top-8 right-8" />
                      <div className="overflow-y-auto max-h-[60vh] w-full custom-scrollbar">
                        <p className="text-accent-beige text-xl md:text-3xl leading-relaxed whitespace-pre-wrap font-serif text-center drop-shadow-lg">
                          {post.caption}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right-side actions */}
              <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-20">
                <div className="relative group">
                  <button
                    onClick={() => navigate(`/profile/${post.user._id}`)}
                    className="w-12 h-12 rounded-full border-2 border-white/20 p-0.5 overflow-hidden transition-transform hover:scale-110 hover:border-deep-purple"
                  >
                    {post.user.profileImage ? (
                      <img src={post.user.profileImage} alt={post.user.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-deep-purple flex items-center justify-center text-white font-bold">
                        {post.user.username[0].toUpperCase()}
                      </div>
                    )}
                  </button>
                  {currentUser && currentUser.id !== post.user._id && (
                    <button
                      onClick={() => {
                        const isFollowing = !!(currentUser as any)?.following?.find((f: any) => f._id === post.user._id || f === post.user._id);
                        if (isFollowing) {
                          unfollowMutation.mutate(post.user._id);
                        } else {
                          followMutation.mutate(post.user._id);
                        }
                      }}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-deep-purple text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                    >
                      <Plus size={12} />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleLike(post._id)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`p-3 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 transition-all group-hover:scale-110 group-hover:bg-black/40 ${post.likes.length > 0 ? 'text-red-500' : 'text-white'}`}>
                    <Heart className={post.likes.length > 0 ? 'fill-current' : ''} size={28} />
                  </div>
                  <span className="text-xs font-medium text-white shadow-black drop-shadow-md">{post.likes.length}</span>
                </button>

                <button
                  onClick={() => setOpenCommentsPostId(post._id)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="p-3 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-white transition-all group-hover:scale-110 group-hover:bg-black/40">
                    <MessageCircle size={28} />
                  </div>
                  <span className="text-xs font-medium text-white shadow-black drop-shadow-md">{post.comments.length}</span>
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: post.caption,
                        url: window.location.href,
                      }).catch(() => { });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="p-3 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-white transition-all group-hover:scale-110 group-hover:bg-black/40">
                    <Share2 size={28} />
                  </div>
                  <span className="text-xs font-medium text-white shadow-black drop-shadow-md">Share</span>
                </button>

                <div className="relative post-menu">
                  <button
                    onClick={() => setPostMenuOpen(postMenuOpen === post._id ? null : post._id)}
                    className="p-3 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-white transition-all hover:bg-black/40"
                  >
                    <MoreVertical size={24} />
                  </button>
                  {postMenuOpen === post._id && (
                    <div className="absolute right-12 bottom-0 w-48 bg-matte-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50">
                      {currentUser?.id === post.user._id && (
                        <>
                          <button
                            onClick={() => {
                              setEditPostId(post._id);
                              setEditCaption(post.caption);
                              setEditTags(post.tags.join(', '));
                              setPostMenuOpen(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-accent-beige hover:bg-white/10 transition-colors"
                          >
                            <Edit size={18} />
                            <span className="text-sm font-medium">Edit Post</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this post?')) {
                                deleteMutation.mutate(post._id);
                              }
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={18} />
                            <span className="text-sm font-medium">Delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom caption area */}
              <div className="absolute left-0 right-16 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white font-bold text-lg shadow-black drop-shadow-md cursor-pointer hover:underline" onClick={() => navigate(`/profile/${post.user._id}`)}>
                      @{post.user.username}
                    </h3>
                    {post.category && (
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/80 text-[10px] font-medium uppercase tracking-wider border border-white/5 backdrop-blur-sm">
                        {post.category}
                      </span>
                    )}
                  </div>

                  {post.caption && (
                    <p className="text-white/90 text-sm leading-relaxed mb-2 line-clamp-2 shadow-black drop-shadow-sm">
                      {post.caption}
                    </p>
                  )}

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag: string, i: number) => (
                        <span key={i} className="text-white/80 text-xs font-medium hover:text-deep-purple transition-colors cursor-pointer">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Inline comment input */}
                  <div className="relative max-w-sm">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="w-full bg-white/10 border border-white/10 rounded-full pl-4 pr-10 py-2 text-white text-sm focus:outline-none focus:bg-black/60 focus:border-deep-purple/50 transition-all placeholder:text-white/40"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleComment(post._id, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-deep-purple transition-colors">
                      <MessageCircle size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}



          {!singlePostId && displayPosts.length === 0 && (
            <div className="snap-start h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Video size={48} className="text-accent-beige/20" />
              </div>
              <h3 className="text-2xl font-bold text-accent-beige mb-2">No posts yet</h3>
              <p className="text-accent-beige/60 max-w-xs mx-auto mb-8">Be the first to share your talent with the world!</p>
              <button
                onClick={() => navigate('/upload')}
                className="px-8 py-3 bg-deep-purple text-white rounded-2xl font-bold shadow-lg shadow-deep-purple/20 hover:scale-105 transition-transform"
              >
                Create Post
              </button>
            </div>
          )}
        </div>
      )}

      <Navbar />

      {/* Edit Post Modal */}
      {editPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-matte-black border border-white/10 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h2 className="text-xl font-bold text-accent-beige">Edit Post</h2>
              <button
                onClick={() => {
                  setEditPostId(null);
                  setEditCaption('');
                  setEditTags('');
                }}
                className="text-accent-beige/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-accent-beige/80 mb-2 text-sm font-bold uppercase tracking-wider">Caption</label>
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full h-32 p-4 bg-black/40 border border-white/10 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple focus:ring-1 focus:ring-deep-purple/50 resize-none transition-all"
                  maxLength={1000}
                />
              </div>
              <div>
                <label className="block text-accent-beige/80 mb-2 text-sm font-bold uppercase tracking-wider">Tags</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple focus:ring-1 focus:ring-deep-purple/50 transition-all"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    if (editPostId) {
                      updateMutation.mutate({
                        postId: editPostId,
                        caption: editCaption,
                        tags: editTags,
                      });
                    }
                  }}
                  disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-3.5 bg-deep-purple hover:bg-deep-purple/80 text-white rounded-2xl font-bold disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditPostId(null);
                    setEditCaption('');
                    setEditTags('');
                  }}
                  className="flex-1 px-4 py-3.5 bg-transparent border border-white/10 hover:bg-white/5 text-accent-beige rounded-2xl font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Drawer */}
      {openCommentsPostId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setOpenCommentsPostId(null)}
          />
          <div className="relative w-full max-w-lg bg-matte-black border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl max-h-[80vh] shadow-2xl flex flex-col animate-slide-up">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 rounded-t-3xl">
              <span className="text-accent-beige font-bold text-lg">Comments</span>
              <button
                onClick={() => setOpenCommentsPostId(null)}
                className="text-accent-beige/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
              {posts
                .find((p) => p._id === openCommentsPostId)?.comments.map((comment: Post['comments'][0], i: number) => (
                  <div key={i} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="w-10 h-10 rounded-full bg-deep-purple/20 flex-shrink-0 flex items-center justify-center border border-deep-purple/30 text-deep-purple font-bold">
                      {comment.user.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                      <span className="font-bold text-accent-beige text-sm block mb-1">{comment.user.username}</span>
                      <p className="text-accent-beige/80 text-sm leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              {posts.find((p) => p._id === openCommentsPostId)?.comments.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-60">
                  <MessageCircle size={48} className="mb-4 text-accent-beige/20" />
                  <p className="text-accent-beige/60">No comments yet</p>
                  <p className="text-accent-beige/40 text-sm">Start the conversation!</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-matte-black/95 backdrop-blur rounded-b-3xl">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-deep-purple/20 flex items-center justify-center text-deep-purple text-xs font-bold">
                  {currentUser?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-12 py-3 text-accent-beige text-sm focus:outline-none focus:bg-black/40 focus:border-deep-purple/50 transition-all placeholder:text-accent-beige/30"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newCommentText.trim() && openCommentsPostId) {
                        handleComment(openCommentsPostId, newCommentText.trim());
                        setNewCommentText('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newCommentText.trim() && openCommentsPostId) {
                        handleComment(openCommentsPostId, newCommentText.trim());
                        setNewCommentText('');
                      }
                    }}
                    disabled={!newCommentText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-deep-purple text-white rounded-full disabled:opacity-50 disabled:bg-white/10 transition-all hover:scale-110"
                  >
                    <Forward size={16} className={newCommentText.trim() ? 'ml-0.5' : ''} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;



