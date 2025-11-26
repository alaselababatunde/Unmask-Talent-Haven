import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api';
import Navbar from '../components/Navbar';
import ReactPlayer from 'react-player';
import { Heart, MessageCircle, Share2, Video, Music, FileText, Hand, Search, MoreVertical, Trash2, Edit, Forward } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  });

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
      } catch (e) {}
    },
    onError: (err, targetId) => {
      // rollback
      try { updateFollowing(targetId, false); } catch (e) {}
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
      try { updateFollowing(targetId, false); } catch (e) {}
    },
    onError: (err, targetId) => {
      try { updateFollowing(targetId, true); } catch (e) {}
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
      refetch();
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
    likeMutation.mutate(postId);
  };

  const handleComment = (postId: string, text: string) => {
    if (text.trim()) {
      commentMutation.mutate({ postId, text });
    }
  };

  const isVideoTab = activeTab === 'video' || activeTab === 'sign-language';
  const displayPosts = searchQuery.trim() && searchResults.length > 0 ? searchResults : posts;

  return (
    <div className="min-h-screen bg-matte-black">
      {/* Category Tabs with Search */}
      <div className="sticky top-0 z-40 bg-matte-black/80 backdrop-blur border-b border-deep-purple/20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3 overflow-x-auto flex-1">
              {[
                { key: 'video', label: 'Video', icon: Video },
                { key: 'audio', label: 'Audio', icon: Music },
                { key: 'text', label: 'Poetry', icon: FileText },
                { key: 'sign-language', label: 'Sign', icon: Hand },
              ].map((t: { key: string; label: string; icon: any }) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setActiveTab(t.key as any);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition border whitespace-nowrap ${
                    activeTab === (t.key as any)
                      ? 'bg-deep-purple text-accent-beige border-deep-purple'
                      : 'bg-matte-black text-accent-beige/70 border-deep-purple/30 hover:border-deep-purple'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {t.icon ? <t.icon size={16} /> : null}
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="ml-2 p-2 rounded-full bg-matte-black border border-deep-purple/30 hover:border-deep-purple text-accent-beige"
            >
              <Search size={20} />
            </button>
          </div>
          {showSearch && (
            <div className="pb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Search profiles or content..."
                className="w-full px-4 py-2 bg-matte-black border border-deep-purple/30 rounded-full text-accent-beige focus:outline-none focus:border-deep-purple"
              />
            </div>
          )}
        </div>
      </div>

      {searchQuery.trim() && searchResults.length === 0 && (
        <div className="text-center py-12">
          <p className="text-accent-beige/60">No results found for "{searchQuery}"</p>
        </div>
      )}

      {isVideoTab && !(searchQuery.trim() && searchResults.length > 0) ? (
      <div className="h-[calc(100vh-56px)] overflow-y-scroll snap-y snap-mandatory no-scrollbar relative">
        {displayPosts.map((post: Post, index: number) => (
          <div
            key={post._id}
            ref={(el) => {
              playerRefs.current[index] = el;
            }}
            className="snap-start h-screen w-full relative"
          >
            {/* Media layer */}
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              {post.mediaType === 'video' || post.mediaType === 'sign-language' ? (
                <div className="w-full h-full">
                <ReactPlayer
                  url={post.mediaUrl}
                  playing={playingIndex === index}
                    controls={false}
                    loop
                  width="100%"
                  height="100%"
                    className="!h-full !w-full object-contain"
                />
                </div>
              ) : post.mediaType === 'audio' ? (
                <div className="flex items-center justify-center w-full h-full">
                  <ReactPlayer
                    url={post.mediaUrl}
                    playing={playingIndex === index}
                    controls
                    width="90%"
                    height="80px"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-full p-8">
                  <p className="text-accent-beige text-xl leading-relaxed whitespace-pre-wrap max-w-2xl text-center">
                    {post.caption}
                  </p>
                </div>
              )}
            </div>

            {/* Top bar (user info) */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
              <button
                onClick={() => navigate(`/profile/${post.user._id}`)}
                className="flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-full bg-deep-purple/30 flex items-center justify-center overflow-hidden border ${post.user.isLive ? 'border-red-500' : 'border-deep-purple/40'}`}>
                  {post.user.profileImage ? (
                    <img src={post.user.profileImage} alt={post.user.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-deep-purple font-bold">{post.user.username[0].toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-accent-beige font-semibold">{post.user.username}</h3>
                  <p className="text-accent-beige/60 text-xs">{post.category}</p>
                </div>
              </button>
              <div className="flex items-center gap-3">
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
                    className="px-3 py-1 rounded-full bg-deep-purple text-accent-beige text-sm font-semibold border border-deep-purple/60 hover:bg-deep-purple/80"
                  >
                    {(currentUser as any)?.following && (currentUser as any).following.find((f: any) => f._id === post.user._id || f === post.user._id) ? 'Following' : 'Follow'}
                  </button>
                )}
                <div className="relative post-menu">
                <button
                  onClick={() => setPostMenuOpen(postMenuOpen === post._id ? null : post._id)}
                  className="p-2 rounded-full bg-black/40 border border-white/10 text-accent-beige hover:bg-black/60"
                >
                  <MoreVertical size={20} />
                </button>
                {postMenuOpen === post._id && (
                  <div className="absolute right-0 mt-2 w-48 bg-matte-black border border-deep-purple/30 rounded-2xl shadow-xl z-50 post-menu">
                    {currentUser?.id === post.user._id && (
                      <>
                        <button
                          onClick={() => {
                            setEditPostId(post._id);
                            setEditCaption(post.caption);
                            setEditTags(post.tags.join(', '));
                            setPostMenuOpen(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-accent-beige hover:bg-deep-purple/10 rounded-t-2xl"
                        >
                          <Edit size={18} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this post?')) {
                              deleteMutation.mutate(post._id);
                            }
                          }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 size={18} />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        navigator.share?.({
                          title: post.caption,
                          url: window.location.href,
                        }).catch(() => {});
                        setPostMenuOpen(null);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-accent-beige hover:bg-deep-purple/10"
                    >
                      <Share2 size={18} />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={() => {
                        // Forward functionality
                        setPostMenuOpen(null);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-accent-beige hover:bg-deep-purple/10 rounded-b-2xl"
                    >
                      <Forward size={18} />
                      <span>Forward</span>
                    </button>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Right-side actions */}
            <div className="absolute right-4 bottom-32 flex flex-col items-center gap-5">
                <button
                  onClick={() => handleLike(post._id)}
                className={`p-3 rounded-full bg-black/40 border border-white/10 hover:bg-black/60 transition ${
                  post.likes.length > 0 ? 'text-deep-purple' : 'text-accent-beige'
                }`}
                >
                <Heart className={post.likes.length > 0 ? 'fill-current' : ''} size={28} />
                <span className="block text-center text-xs mt-1">{post.likes.length}</span>
                </button>
              <button
                className="p-3 rounded-full bg-black/40 border border-white/10 text-accent-beige hover:bg-black/60 transition"
                onClick={() => setOpenCommentsPostId(post._id)}
              >
                <MessageCircle size={28} />
                <span className="block text-center text-xs mt-1">{post.comments.length}</span>
                </button>
              <button className="p-3 rounded-full bg-black/40 border border-white/10 text-accent-beige hover:bg-black/60 transition">
                <Share2 size={28} />
                </button>
              </div>

            {/* Bottom caption */}
            <div className="absolute left-4 right-20 bottom-8">
              {post.caption && (
                <p className="text-accent-beige/90 text-sm">
                  <span className="font-semibold mr-2">{post.user.username}</span>
                  {post.caption}
                  </p>
              )}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {post.tags.map((tag: string, i: number) => (
                    <span key={i} className="text-deep-purple text-xs bg-deep-purple/10 px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {/* inline comment input */}
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="w-full bg-black/40 border border-white/10 rounded-full px-4 py-2 text-accent-beige text-sm focus:outline-none focus:border-deep-purple"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleComment(post._id, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="snap-start h-screen w-full flex items-center justify-center">
            <p className="text-accent-beige/60">No posts yet. Be the first to share your talent!</p>
          </div>
        )}
      </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
          {displayPosts.map((post: Post) => (
            <div key={post._id} className="bg-matte-black border border-deep-purple/20 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-deep-purple/10">
                <button
                  onClick={() => navigate(`/profile/${post.user._id}`)}
                  className="flex items-center gap-3 flex-1"
                >
                  <div className={`w-10 h-10 rounded-full bg-deep-purple/30 flex items-center justify-center overflow-hidden border ${post.user.isLive ? 'border-red-500' : 'border-deep-purple/40'}`}>
                    {post.user.profileImage ? (
                      <img src={post.user.profileImage} alt={post.user.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-deep-purple font-bold">{post.user.username[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-accent-beige font-semibold">{post.user.username}</h3>
                    <p className="text-accent-beige/60 text-xs">{post.category}</p>
                  </div>
                </button>
                <div className="flex items-center gap-3">
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
                      className="px-3 py-1 rounded-full bg-deep-purple text-accent-beige text-sm font-semibold border border-deep-purple/60 hover:bg-deep-purple/80"
                    >
                      {(currentUser as any)?.following && (currentUser as any).following.find((f: any) => f._id === post.user._id || f === post.user._id) ? 'Following' : 'Follow'}
                    </button>
                  )}
                  <div className="relative post-menu">
                  <button
                    onClick={() => setPostMenuOpen(postMenuOpen === post._id ? null : post._id)}
                    className="p-2 rounded-full bg-matte-black border border-deep-purple/30 text-accent-beige hover:bg-deep-purple/10"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {postMenuOpen === post._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-matte-black border border-deep-purple/30 rounded-2xl shadow-xl z-50 post-menu">
                      {currentUser?.id === post.user._id && (
                        <>
                          <button
                            onClick={() => {
                              setEditPostId(post._id);
                              setEditCaption(post.caption);
                              setEditTags(post.tags.join(', '));
                              setPostMenuOpen(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-3 text-accent-beige hover:bg-deep-purple/10 rounded-t-2xl"
                          >
                            <Edit size={18} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this post?')) {
                                deleteMutation.mutate(post._id);
                              }
                            }}
                            className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 size={18} />
                            <span>Delete</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          navigator.share?.({
                            title: post.caption,
                            url: window.location.href,
                          }).catch(() => {});
                          setPostMenuOpen(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-accent-beige hover:bg-deep-purple/10"
                      >
                        <Share2 size={18} />
                        <span>Share</span>
                      </button>
                      <button
                        onClick={() => {
                          setPostMenuOpen(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-accent-beige hover:bg-deep-purple/10 rounded-b-2xl"
                      >
                        <Forward size={18} />
                        <span>Forward</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {post.mediaType === 'audio' ? (
                <div className="p-4 bg-gradient-to-br from-deep-purple/10 to-matte-black rounded-xl">
                  <ReactPlayer url={post.mediaUrl} controls width="100%" height="60px" />
                </div>
              ) : post.mediaType === 'text' ? (
                <div className="p-6 bg-gradient-to-br from-deep-purple/5 to-matte-black/50 rounded-xl">
                  <p className="text-accent-beige text-lg leading-relaxed whitespace-pre-wrap">{post.caption}</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl overflow-hidden bg-black">
                  <ReactPlayer url={post.mediaUrl} controls width="100%" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-center gap-4 mb-3">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-2 transition-all transform hover:scale-110 ${post.likes.length > 0 ? 'text-deep-purple' : 'text-accent-beige/60'} hover:text-deep-purple`}
                  >
                    <Heart className={post.likes.length > 0 ? 'fill-current' : ''} size={20} />
                    <span className="text-sm font-semibold">{post.likes.length}</span>
                  </button>
                  <button
                    onClick={() => setOpenCommentsPostId(post._id)}
                    className="flex items-center gap-2 text-accent-beige/60 hover:text-deep-purple transition-all transform hover:scale-110"
                  >
                    <MessageCircle size={20} />
                    <span className="text-sm font-semibold">{post.comments.length}</span>
                  </button>
                  <button className="flex items-center gap-2 text-accent-beige/60 hover:text-deep-purple transition-all transform hover:scale-110 ml-auto">
                    <Share2 size={20} />
                  </button>
                </div>

                {post.caption && (
                  <p className="text-accent-beige/80 text-sm line-clamp-2">
                    <span className="font-semibold text-accent-beige">{post.user.username}</span>{' '}
                    {post.caption}
                  </p>
                )}

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.slice(0, 3).map((tag: string, i: number) => (
                      <span key={i} className="text-deep-purple text-xs bg-deep-purple/10 px-2 py-1 rounded-full hover:bg-deep-purple/20 transition-colors cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-accent-beige/60 text-xs px-2 py-1">+{post.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <p className="text-center text-accent-beige/60 py-12">No posts yet.</p>
          )}
        </div>
      )}

      <Navbar />

      {/* Edit Post Modal */}
      {editPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur">
          <div className="bg-matte-black border border-deep-purple/30 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-deep-purple/20 flex items-center justify-between">
              <h2 className="text-xl font-bold text-accent-beige">Edit Post</h2>
              <button
                onClick={() => {
                  setEditPostId(null);
                  setEditCaption('');
                  setEditTags('');
                }}
                className="text-accent-beige/60 hover:text-accent-beige transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-accent-beige/80 mb-2 text-sm font-semibold">Caption</label>
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full h-24 p-3 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple resize-none"
                  maxLength={1000}
                />
              </div>
              <div>
                <label className="block text-accent-beige/80 mb-2 text-sm font-semibold">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full p-3 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple"
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
                  className="flex-1 px-4 py-3 bg-deep-purple hover:bg-deep-purple/80 text-accent-beige rounded-2xl font-semibold disabled:opacity-50 transition-all transform hover:scale-105"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditPostId(null);
                    setEditCaption('');
                    setEditTags('');
                  }}
                  className="flex-1 px-4 py-3 bg-matte-black border border-deep-purple/30 hover:border-deep-purple text-accent-beige rounded-2xl font-semibold transition-colors"
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
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur"
            onClick={() => setOpenCommentsPostId(null)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-matte-black border-t border-deep-purple/30 rounded-t-3xl max-h-[70vh] shadow-2xl">
            <div className="p-4 border-b border-deep-purple/20 flex items-center justify-between sticky top-0 bg-matte-black/95">
              <span className="text-accent-beige font-bold text-lg">Comments</span>
              <button
                onClick={() => setOpenCommentsPostId(null)}
                className="text-accent-beige/60 hover:text-accent-beige transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="px-4 py-3 overflow-y-auto space-y-4 max-h-[45vh]">
              {posts
                .find((p) => p._id === openCommentsPostId)?.comments.map((comment: Post['comments'][0], i: number) => (
                  <div key={i} className="flex gap-3 p-3 bg-deep-purple/5 rounded-xl hover:bg-deep-purple/10 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-deep-purple/30 flex-shrink-0 flex items-center justify-center border border-deep-purple/40">
                      <span className="text-xs text-deep-purple font-bold">{comment.user.username[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-accent-beige text-sm">{comment.user.username}</span>
                      <span className="text-accent-beige/70 text-sm block mt-1">{comment.text}</span>
                    </div>
                  </div>
                ))}
              {posts.find((p) => p._id === openCommentsPostId)?.comments.length === 0 && (
                <p className="text-accent-beige/60 text-center py-8">No comments yet. Be the first!</p>
              )}
            </div>
            <div className="p-4 border-t border-deep-purple/20 bg-matte-black/95 sticky bottom-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="flex-1 bg-matte-black border border-deep-purple/30 rounded-full px-4 py-2 text-accent-beige text-sm focus:outline-none focus:border-deep-purple placeholder-accent-beige/40"
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
                  className="px-4 py-2 bg-deep-purple text-accent-beige rounded-full text-sm font-bold hover:bg-deep-purple/80 transition-all transform hover:scale-105"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;



