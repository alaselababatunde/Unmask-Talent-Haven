import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api';
import Navbar from '../components/Navbar';
import ReactPlayer from 'react-player';
import { Heart, MessageCircle, Share2, Music, MoreVertical, Forward, X, Plus, Check, Archive, Trash2, Edit, AlertCircle, Video as VideoIcon } from 'lucide-react';
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
  isArchived?: boolean;
}

const Feed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const singlePostId = searchParams.get('post');
  const { user: currentUser, updateFollowing } = useAuth();
  const [activeTab, setActiveTab] = useState<'recommended' | 'following'>('recommended');
  const [playingIndex, setPlayingIndex] = useState(0);
  const playerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [postMenuOpen, setPostMenuOpen] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [heartPos, setHeartPos] = useState({ x: 0, y: 0 });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [reportedPosts, setReportedPosts] = useState<string[]>([]);
  const [notInterestedPosts, setNotInterestedPosts] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState<Post | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editTags, setEditTags] = useState('');


  const { data: posts = [], refetch, isLoading } = useQuery<Post[]>({
    queryKey: ['feed', activeTab],
    queryFn: async () => {
      const endpoint = activeTab === 'following' ? '/feed/following' : '/feed/recommended';
      const response = await api.get(endpoint, { params: { mediaType: 'video' } });
      return response.data;
    },
    enabled: !singlePostId,
  });

  const { data: singlePost } = useQuery<Post>({
    queryKey: ['post', singlePostId],
    queryFn: async () => {
      const response = await api.get(`/feed/${singlePostId}`);
      return response.data;
    },
    enabled: !!singlePostId,
  });

  const displayPosts = (singlePostId && singlePost ? [singlePost] : posts)
    .filter(p => !reportedPosts.includes(p._id) && !notInterestedPosts.includes(p._id));

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.post(`/feed/${postId}/like`);
      return response.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const followMutation = useMutation({
    mutationFn: async ({ targetId, isFollowing }: { targetId: string, isFollowing: boolean }) => {
      const endpoint = isFollowing ? `/user/${targetId}/unfollow` : `/user/${targetId}/follow`;
      const res = await api.post(endpoint);
      return res.data;
    },
    onMutate: async ({ targetId, isFollowing }) => {
      updateFollowing(targetId, !isFollowing);
    },
    onError: (_, { targetId, isFollowing }) => {
      updateFollowing(targetId, isFollowing);
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


  const handleComment = (postId: string, text: string) => {
    if (!text.trim()) return;
    commentMutation.mutate({ postId, text });
    setNewCommentText('');
  };

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      await api.delete(`/feed/${postId}`);
    },
    onSuccess: () => {
      refetch();
      setIsDeleting(null);
      setPostMenuOpen(null);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (postId: string) => {
      await api.post(`/feed/${postId}/archive`);
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
      setIsEditing(null);
      setPostMenuOpen(null);
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
              setIsPaused(false); // Reset pause when scrolling
            }
          }
        });
      },
      { threshold: 0.5 }
    );
    return () => observer.disconnect();
  }, [posts]);

  const handleReport = (postId: string) => {
    setReportedPosts(prev => [...prev, postId]);
    setPostMenuOpen(null);
  };

  const handleNotInterested = (postId: string) => {
    setNotInterestedPosts(prev => [...prev, postId]);
    setPostMenuOpen(null);
  };

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

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent, postId: string) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected
      handleLike(postId);

      // Show heart animation
      const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
      setHeartPos({ x: clientX, y: clientY });
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    } else {
      setIsPaused(!isPaused);
    }
    setLastTap(now);
  };

  // displayPosts is already defined above

  return (
    <div className="h-[100dvh] w-full bg-primary overflow-hidden relative">
      {/* Floating Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center py-8 px-6 pointer-events-none">
        <div className="flex gap-8 pointer-events-auto">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`text-lg font-bold transition-all duration-300 ${activeTab === 'recommended' ? 'text-white scale-110' : 'text-white/40 hover:text-white/60'}`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`text-lg font-bold transition-all duration-300 ${activeTab === 'following' ? 'text-white scale-110' : 'text-white/40 hover:text-white/60'}`}
          >
            Following
          </button>
        </div>
      </div>

      {/* Feed Container */}
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-neon-purple/20 border-t-neon-purple rounded-full animate-spin" />
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-center p-10">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <VideoIcon size={40} className="text-white/20" />
            </div>
            <p className="text-xl font-bold">
              {activeTab === 'following' ? "You're not following anyone yet." : "No talent discovered yet"}
            </p>
            <p className="text-sm mt-2 text-white/40">
              {activeTab === 'following' ? "Follow more creators to see their latest talent here." : "Follow more creators to fill your feed"}
            </p>
            {activeTab === 'following' && (
              <button
                onClick={() => setActiveTab('recommended')}
                className="mt-8 px-8 py-3 bg-neon-purple text-black rounded-2xl font-bold shadow-lg shadow-neon-purple/20 active:scale-95 transition-all"
              >
                Discover Creators
              </button>
            )}
          </div>
        ) : (
          displayPosts.map((post: Post, index: number) => (
            <div
              key={post._id}
              ref={(el) => {
                playerRefs.current[index] = el;
              }}
              className="snap-start h-[100dvh] w-full relative bg-black flex items-center justify-center overflow-hidden"
            >
              {/* Media Layer */}
              <div
                className="w-full h-full relative cursor-pointer"
                onClick={(e) => handleDoubleTap(e, post._id)}
              >
                {post.mediaType === 'video' || post.mediaType === 'sign-language' ? (
                  <ReactPlayer
                    url={post.mediaUrl}
                    playing={playingIndex === index && !isPaused}
                    controls={false}
                    loop
                    muted={playingIndex === index}
                    width="100%"
                    height="100%"
                    className="!h-full !w-full object-cover"
                    playsinline
                    config={{
                      file: {
                        attributes: {
                          playsInline: true,
                          preload: 'metadata',
                          controlsList: 'nodownload',
                        }
                      }
                    }}
                  />
                ) : post.mediaType === 'audio' ? (
                  <div className="w-full h-full bg-obsidian flex flex-col items-center justify-center p-8">
                    <div className="w-64 h-64 bg-gradient-to-br from-neon-purple to-neon-blue rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(176,38,255,0.3)] mb-12 animate-float">
                      <Music size={80} className="text-black" />
                    </div>
                    <ReactPlayer
                      url={post.mediaUrl}
                      playing={playingIndex === index && !isPaused}
                      width="100%"
                      height="4px"
                      className="max-w-xs"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-obsidian flex items-center justify-center p-6">
                    <div className="max-w-md w-full glass-panel p-10 rounded-[2.5rem] border-white/5">
                      <p className="text-2xl md:text-3xl font-display leading-relaxed text-center">
                        {post.caption}
                      </p>
                    </div>
                  </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

                {/* Double Tap Heart Animation */}
                {showHeart && (
                  <div
                    className="fixed z-[100] pointer-events-none animate-ping"
                    style={{ left: heartPos.x - 40, top: heartPos.y - 40 }}
                  >
                    <Heart size={80} className="text-neon-purple fill-neon-purple drop-shadow-[0_0_20px_rgba(176,38,255,0.8)]" />
                  </div>
                )}

                {/* Pause Indicator */}
                {isPaused && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 animate-fade-in">
                    <div className="w-24 h-24 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                      <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side Actions - Thumb Zone Optimized */}
              <div className="absolute right-4 bottom-32 flex flex-col items-center gap-8 z-20">
                {/* Creator Avatar */}
                <div className="relative mb-4">
                  <button
                    onClick={() => navigate(`/profile/${post.user._id}`)}
                    className="w-16 h-16 rounded-full border-2 border-white p-0.5 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] active:scale-90 transition-transform"
                  >
                    {post.user.profileImage ? (
                      <img src={post.user.profileImage} alt={post.user.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-black font-black text-xl">
                        {post.user.username[0].toUpperCase()}
                      </div>
                    )}
                  </button>
                  {currentUser?.id !== post.user._id && (
                    <button
                      onClick={() => followMutation.mutate({
                        targetId: post.user._id,
                        isFollowing: currentUser?.following?.some((f: any) => f._id === post.user._id) || false
                      })}
                      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full p-1.5 shadow-lg hover:scale-110 active:scale-90 transition-all ${currentUser?.following?.some((f: any) => f._id === post.user._id)
                          ? 'bg-white text-black'
                          : 'bg-neon-purple text-black'
                        }`}
                    >
                      {currentUser?.following?.some((f: any) => f._id === post.user._id) ? (
                        <Check size={16} strokeWidth={4} />
                      ) : (
                        <Plus size={16} strokeWidth={4} />
                      )}
                    </button>
                  )}
                </div>

                {/* Action Stack with Glass Backdrop */}
                <div className="flex flex-col items-center gap-6 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/5">
                  {/* Like */}
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex flex-col items-center gap-1.5 group active:scale-90 transition-transform"
                  >
                    <div className={`p-4 rounded-full glass-button ${post.likes.includes(currentUser?.id || '') ? 'text-neon-purple bg-neon-purple/10' : 'text-white'}`}>
                      <Heart className={`w-8 h-8 ${post.likes.includes(currentUser?.id || '') ? 'fill-current' : ''}`} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest drop-shadow-md">{post.likes.length}</span>
                  </button>

                  {/* Comment */}
                  <button
                    onClick={() => setOpenCommentsPostId(post._id)}
                    className="flex flex-col items-center gap-1.5 group active:scale-90 transition-transform"
                  >
                    <div className="p-4 rounded-full glass-button text-white">
                      <MessageCircle className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest drop-shadow-md">{post.comments.length}</span>
                  </button>

                  {/* Share */}
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: post.caption, url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                    className="flex flex-col items-center gap-1.5 group active:scale-90 transition-transform"
                  >
                    <div className="p-4 rounded-full glass-button text-white">
                      <Share2 className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest drop-shadow-md">Share</span>
                  </button>

                  {/* More */}
                  <div className="relative post-menu">
                    <button
                      onClick={() => setPostMenuOpen(postMenuOpen === post._id ? null : post._id)}
                      className="p-4 rounded-full glass-button text-white active:scale-90 transition-transform"
                    >
                      <MoreVertical className="w-8 h-8" />
                    </button>

                    {postMenuOpen === post._id && (
                      <div className="absolute right-0 bottom-full mb-6 w-64 glass-panel rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden animate-scale-in origin-bottom-right z-[100]">
                        {post.user._id === currentUser?.id ? (
                          <>
                            <button
                              onClick={() => {
                                setIsEditing(post);
                                setEditCaption(post.caption);
                                setEditTags(post.tags.join(', '));
                                setPostMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-4 px-8 py-5 hover:bg-white/5 transition-colors text-white font-bold"
                            >
                              <Edit size={20} className="text-neon-blue" />
                              <span className="text-sm">Edit Post</span>
                            </button>
                            <button
                              onClick={() => archiveMutation.mutate(post._id)}
                              className="w-full flex items-center gap-4 px-8 py-5 hover:bg-white/5 transition-colors text-white font-bold"
                            >
                              <Archive size={20} className="text-neon-purple" />
                              <span className="text-sm">{post.isArchived ? 'Unarchive' : 'Archive'}</span>
                            </button>
                            <button
                              onClick={() => setIsDeleting(post._id)}
                              className="w-full flex items-center gap-4 px-8 py-5 hover:bg-white/5 transition-colors text-red-500 font-bold"
                            >
                              <Trash2 size={20} />
                              <span className="text-sm">Delete</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleNotInterested(post._id)}
                              className="w-full flex items-center gap-4 px-8 py-5 hover:bg-white/5 transition-colors text-white font-bold"
                            >
                              <AlertCircle size={20} className="text-white/40" />
                              <span className="text-sm">Not Interested</span>
                            </button>
                            <button
                              onClick={() => handleReport(post._id)}
                              className="w-full flex items-center gap-4 px-8 py-5 hover:bg-white/5 transition-colors text-red-500 font-bold"
                            >
                              <AlertCircle size={20} />
                              <span className="text-sm">Report</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="absolute left-0 right-20 bottom-0 p-6 pb-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20">
                <div className="max-w-xl">
                  <h3
                    className="text-xl font-bold mb-2 cursor-pointer hover:text-neon-blue transition-colors"
                    onClick={() => navigate(`/profile/${post.user._id}`)}
                  >
                    @{post.user.username}
                  </h3>
                  <p className="text-white/90 text-base leading-relaxed mb-3 line-clamp-3">
                    {post.caption}
                  </p>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, i) => (
                        <span key={i} className="text-neon-blue font-medium text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Navbar />

      {/* Modals & Drawers */}
      {openCommentsPostId && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpenCommentsPostId(null)} />
          <div className="relative w-full max-w-lg bg-obsidian rounded-t-[2.5rem] h-[70vh] flex flex-col animate-slide-up border-t border-white/10">
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <h2 className="text-xl font-bold font-display">Comments</h2>
              <button onClick={() => setOpenCommentsPostId(null)} className="p-2 hover:bg-white/5 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {posts.find(p => p._id === openCommentsPostId)?.comments.map((comment, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex-shrink-0 flex items-center justify-center text-neon-purple font-bold">
                    {comment.user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-sm block mb-1">{comment.user.username}</span>
                    <p className="text-white/70 text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-white/5 bg-obsidian/80 backdrop-blur pb-10">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-neon-purple transition-all"
                />
                <button
                  onClick={() => {
                    if (newCommentText.trim()) {
                      handleComment(openCommentsPostId, newCommentText);
                      setNewCommentText('');
                    }
                  }}
                  className="bg-neon-purple text-black p-3 rounded-2xl font-bold"
                >
                  <Forward size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Post Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
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
    </div>
  );
};

export default Feed;
