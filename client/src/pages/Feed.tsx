import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import Navbar from '../components/Navbar';
import ReactPlayer from 'react-player';
import { Heart, MessageCircle, Share2, Music, MoreVertical, X, Plus, Check, Archive, Trash2, Edit, AlertCircle, Video as VideoIcon, Search, MoreHorizontal, Send } from 'lucide-react';
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
  const { user: currentUser, updateFollowing, socket } = useAuth();
  const [activeTab, setActiveTab] = useState<'following' | 'video' | 'sign-language' | 'audio' | 'text'>('video');
  const [playingIndex, setPlayingIndex] = useState(0);
  const playerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [openSharePostId, setOpenSharePostId] = useState<string | null>(null);
  const [shareSearch, setShareSearch] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);
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
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();


  const { data: posts = [], refetch, isLoading } = useQuery<Post[]>({
    queryKey: ['feed', activeTab],
    queryFn: async () => {
      const endpoint = activeTab === 'following' ? '/feed/following' : '/feed/recommended';
      const params: any = {};
      if (activeTab !== 'following') {
        params.mediaType = activeTab;
      }
      const response = await api.get(endpoint, { params });
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
    onMutate: async ({ postId, text }) => {
      const queryKey = singlePostId ? ['post', singlePostId] : ['feed', activeTab];
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      if (singlePostId) {
        queryClient.setQueryData<Post>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            comments: [
              ...old.comments,
              {
                user: {
                  username: currentUser?.username || 'You',
                  profileImage: currentUser?.profileImage
                },
                text,
                createdAt: new Date().toISOString(),
              }
            ]
          };
        });
      } else {
        queryClient.setQueryData<Post[]>(queryKey, (old) => {
          if (!old) return [];
          return old.map(post => {
            if (post._id === postId) {
              return {
                ...post,
                comments: [
                  ...post.comments,
                  {
                    user: {
                      username: currentUser?.username || 'You',
                      profileImage: currentUser?.profileImage
                    },
                    text,
                    createdAt: new Date().toISOString(),
                  }
                ]
              };
            }
            return post;
          });
        });
      }

      return { previousData, queryKey };
    },
    onError: (_err, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      alert('Failed to post comment. Please try again.');
    },
    onSettled: (_, __, ___, context) => {
      queryClient.invalidateQueries({ queryKey: context?.queryKey });
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

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (openCommentsPostId) {
      // Small delay to ensure the DOM has updated
      setTimeout(scrollToBottom, 100);
    }
  }, [openCommentsPostId, displayPosts.find(p => p._id === openCommentsPostId)?.comments?.length]);

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
    <div className="fixed-screen">
      {/* Floating Header - Minimalist */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-6 pb-2 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <div className="w-full overflow-x-auto no-scrollbar px-6 pointer-events-auto">
          <div className="flex items-center justify-center gap-8 min-w-max pb-2">
            {[
              { id: 'following', label: 'Following' },
              { id: 'video', label: 'For You' },
              { id: 'sign-language', label: 'Sign' },
              { id: 'audio', label: 'Audio' },
              { id: 'text', label: 'Poetry' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-[15px] font-bold transition-all duration-300 relative py-1 drop-shadow-md ${activeTab === tab.id
                  ? 'text-white scale-105'
                  : 'text-white/60 hover:text-white/80'
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed Container */}
      <div className="scrollable-content snap-y snap-mandatory bg-black">
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
                onClick={() => setActiveTab('video')}
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
                    <div className="w-72 h-72 bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 rounded-[3rem] flex items-center justify-center relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple to-neon-blue opacity-20 blur-3xl group-hover:opacity-40 transition-opacity" />
                      <div className="w-48 h-48 bg-black/40 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-2xl relative z-10">
                        <Music size={64} className="text-neon-purple animate-pulse" />
                      </div>
                      {/* Animated Waveform Placeholder */}
                      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1 items-end h-12">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-neon-blue/40 rounded-full animate-waveform"
                            style={{
                              height: `${Math.random() * 100}%`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-12 w-full max-w-xs space-y-4">
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-blue w-1/3 shadow-[0_0_10px_rgba(0,243,255,0.5)]" />
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/20">
                        <span>0:45</span>
                        <span>3:20</span>
                      </div>
                    </div>
                    <ReactPlayer
                      url={post.mediaUrl}
                      playing={playingIndex === index && !isPaused}
                      width="0"
                      height="0"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-obsidian flex items-center justify-center p-8 relative overflow-hidden">
                    {/* Poetry Background Theme */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(176,38,255,0.1),transparent_70%)]" />
                      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(0,243,255,0.1),transparent_70%)]" />
                    </div>

                    <div className="max-w-xl w-full glass-panel p-12 rounded-[3.5rem] border-white/5 relative z-10 shadow-2xl">
                      <div className="w-12 h-1 bg-neon-purple/40 rounded-full mb-10 mx-auto" />
                      <p className="text-2xl md:text-3xl font-display leading-[1.6] text-center font-medium tracking-tight text-white/90 italic">
                        "{post.caption}"
                      </p>
                      <div className="w-12 h-1 bg-neon-blue/40 rounded-full mt-10 mx-auto" />
                    </div>
                  </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

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
                  <div className="absolute inset-0 flex items-center justify-center z-10 animate-fade-in pointer-events-none">
                    <div className="w-20 h-20 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                      <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side Actions - Clean Floating Icons */}
              <div className="absolute right-2 bottom-20 flex flex-col items-center gap-6 z-20 pb-4">
                {/* Creator Avatar & Follow Button */}
                <div className="relative mb-4">
                  <button
                    onClick={() => navigate(`/profile/${post.user._id}`)}
                    className="w-12 h-12 rounded-full border border-white p-0.5 overflow-hidden shadow-lg active:scale-90 transition-transform"
                  >
                    {post.user.profileImage ? (
                      <img src={post.user.profileImage} alt={post.user.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-black font-black text-sm">
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
                      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all z-30 ${currentUser?.following?.some((f: any) => f._id === post.user._id)
                        ? 'bg-white text-black'
                        : 'bg-neon-purple text-black'
                        }`}
                    >
                      {currentUser?.following?.some((f: any) => f._id === post.user._id) ? (
                        <Check size={12} strokeWidth={4} />
                      ) : (
                        <Plus size={12} strokeWidth={4} />
                      )}
                    </button>
                  )}
                </div>

                {/* Floating Action Icons */}
                <div className="flex flex-col items-center gap-5">
                  {/* Like */}
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex flex-col items-center gap-1 group active:scale-90 transition-transform tap-target"
                  >
                    <Heart
                      size={32}
                      className={`drop-shadow-lg transition-colors duration-200 ${post.likes.includes(currentUser?.id || '') ? 'fill-neon-purple text-neon-purple' : 'text-white'}`}
                      strokeWidth={post.likes.includes(currentUser?.id || '') ? 0 : 2}
                    />
                    <span className="text-xs font-bold text-white drop-shadow-md">{post.likes.length}</span>
                  </button>

                  {/* Comment */}
                  <button
                    onClick={() => setOpenCommentsPostId(post._id)}
                    className="flex flex-col items-center gap-1 group active:scale-90 transition-transform tap-target"
                  >
                    <MessageCircle size={32} className="text-white drop-shadow-lg" strokeWidth={2} />
                    <span className="text-xs font-bold text-white drop-shadow-md">{post.comments.length}</span>
                  </button>

                  {/* Share */}
                  <button
                    onClick={() => setOpenSharePostId(post._id)}
                    className="flex flex-col items-center gap-1 group active:scale-90 transition-transform tap-target"
                  >
                    <Share2 size={32} className="text-white drop-shadow-lg" strokeWidth={2} />
                    <span className="text-xs font-bold text-white drop-shadow-md">Share</span>
                  </button>

                  {/* More */}
                  <div className="relative post-menu tap-target mt-2">
                    <button
                      onClick={() => setPostMenuOpen(postMenuOpen === post._id ? null : post._id)}
                      className="text-white active:scale-90 transition-transform"
                    >
                      <MoreVertical size={32} className="drop-shadow-lg" strokeWidth={2} />
                    </button>

                    {postMenuOpen === post._id && (
                      <div className="absolute right-12 bottom-0 w-56 glass-panel rounded-2xl border-white/10 shadow-2xl overflow-hidden animate-scale-in origin-bottom-right z-[100]">
                        {post.user._id === currentUser?.id ? (
                          <>
                            <button
                              onClick={() => {
                                setIsEditing(post);
                                setEditCaption(post.caption);
                                setEditTags(post.tags.join(', '));
                                setPostMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-white font-bold"
                            >
                              <Edit size={18} className="text-neon-blue" />
                              <span className="text-sm">Edit</span>
                            </button>
                            <button
                              onClick={() => archiveMutation.mutate(post._id)}
                              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-white font-bold"
                            >
                              <Archive size={18} className="text-neon-purple" />
                              <span className="text-sm">{post.isArchived ? 'Unarchive' : 'Archive'}</span>
                            </button>
                            <button
                              onClick={() => setIsDeleting(post._id)}
                              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-red-500 font-bold"
                            >
                              <Trash2 size={18} />
                              <span className="text-sm">Delete</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleNotInterested(post._id)}
                              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-white font-bold"
                            >
                              <AlertCircle size={18} className="text-white/40" />
                              <span className="text-sm">Not Interested</span>
                            </button>
                            <button
                              onClick={() => handleReport(post._id)}
                              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-red-500 font-bold"
                            >
                              <AlertCircle size={18} />
                              <span className="text-sm">Report</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Info - Refined & Less Intrusive */}
              <div className="absolute left-0 right-16 bottom-0 p-4 pb-24 bg-gradient-to-t from-black/80 via-black/20 to-transparent pt-16 pointer-events-none">
                <div className="max-w-[85%] pointer-events-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <h3
                      className="text-lg font-bold text-white text-shadow cursor-pointer hover:underline"
                      onClick={() => navigate(`/profile/${post.user._id}`)}
                    >
                      @{post.user.username}
                    </h3>
                  </div>
                  <p className="text-white/90 text-[15px] leading-snug mb-2 line-clamp-2 text-shadow font-medium">
                    {post.caption}
                  </p>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      {post.tags.map((tag, i) => (
                        <span key={i} className="text-white font-bold text-xs opacity-90 text-shadow">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {post.mediaType === 'audio' && (
                    <div className="flex items-center gap-2 mt-3 p-1.5 pl-2 pr-3 bg-black/40 backdrop-blur-sm rounded-full border border-white/10 w-fit">
                      <Music size={12} className="text-neon-purple" />
                      <div className="text-[10px] font-bold text-white/80 marquee-text">Original Sound</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {displayPosts.find(p => p._id === openCommentsPostId)?.comments.map((comment, i) => (
                <div key={i} className="flex gap-4 animate-fade-in">
                  <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex-shrink-0 flex items-center justify-center text-neon-purple font-bold border border-neon-purple/20">
                    {comment.user.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{comment.user.username}</span>
                      <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>
            <div className="p-6 border-t border-white/5 bg-obsidian/80 backdrop-blur pb-10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newCommentText.trim()) {
                    handleComment(openCommentsPostId, newCommentText);
                  }
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-neon-purple transition-all placeholder:text-white/20 text-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim() || commentMutation.isPending}
                  className="bg-neon-purple text-black p-4 rounded-2xl font-bold shadow-lg shadow-neon-purple/20 active:scale-90 transition-all disabled:opacity-50 disabled:active:scale-100"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {openSharePostId && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {
            setOpenSharePostId(null);
            setShareSuccess(false);
            setShareSearch('');
          }} />
          <div className="relative w-full max-w-lg bg-obsidian rounded-t-[2.5rem] h-[60vh] flex flex-col animate-slide-up border-t border-white/10">
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <h2 className="text-xl font-bold font-display">Share</h2>
              <button onClick={() => {
                setOpenSharePostId(null);
                setShareSuccess(false);
                setShareSearch('');
              }} className="p-2 hover:bg-white/5 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              {/* External Share Options */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  {
                    label: 'Copy Link', icon: <Plus size={20} />, action: () => {
                      navigator.clipboard.writeText(`${window.location.origin}/feed?post=${openSharePostId}`);
                      setShareSuccess(true);
                      setTimeout(() => setShareSuccess(false), 2000);
                    }
                  },
                  {
                    label: 'WhatsApp', icon: <MessageCircle size={20} />, color: 'bg-[#25D366]', action: () => {
                      window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this post on UTH: ${window.location.origin}/feed?post=${openSharePostId}`)}`);
                    }
                  },
                  {
                    label: 'Twitter', icon: <Send size={20} />, color: 'bg-[#1DA1F2]', action: () => {
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this post on UTH: ${window.location.origin}/feed?post=${openSharePostId}`)}`);
                    }
                  },
                  {
                    label: 'More', icon: <MoreHorizontal size={20} />, action: () => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'UTH Post',
                          url: `${window.location.origin}/feed?post=${openSharePostId}`
                        });
                      }
                    }
                  }
                ].map((opt, i) => (
                  <button
                    key={i}
                    onClick={opt.action}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all group-active:scale-90 ${opt.color || 'bg-white/5 border border-white/10'}`}>
                      {opt.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{opt.label}</span>
                  </button>
                ))}
              </div>

              {/* Internal Share (Creators) */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/20">Send to Creators</h3>
                <div className="glass-panel p-1 rounded-full border border-white/5 flex items-center gap-2">
                  <Search size={16} className="ml-4 text-white/20" />
                  <input
                    type="text"
                    value={shareSearch}
                    onChange={(e) => setShareSearch(e.target.value)}
                    placeholder="Search creators..."
                    className="flex-1 bg-transparent py-3 text-sm focus:outline-none placeholder:text-white/10"
                  />
                </div>

                <div className="space-y-2">
                  {currentUser?.following?.filter((f: any) =>
                    f.username?.toLowerCase().includes(shareSearch.toLowerCase())
                  ).map((creator: any) => (
                    <button
                      key={creator._id}
                      onClick={() => {
                        if (socket && currentUser) {
                          socket.emit('message', {
                            text: `Shared a post: ${window.location.origin}/feed?post=${openSharePostId}`,
                            room: creator._id,
                            userId: currentUser.id,
                            username: currentUser.username
                          });
                          setShareSuccess(true);
                          setTimeout(() => {
                            setShareSuccess(false);
                            setOpenSharePostId(null);
                          }, 1500);
                        }
                      }}
                      className="w-full flex items-center justify-between p-4 glass-panel rounded-2xl border-white/5 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple font-bold">
                          {creator.username?.[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-sm">{creator.username}</span>
                      </div>
                      <div className="px-4 py-1.5 bg-neon-purple text-black text-[10px] font-black uppercase tracking-widest rounded-full">Send</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {shareSuccess && (
              <div className="absolute top-24 left-1/2 -translate-x-1/2 px-6 py-3 bg-neon-blue text-black font-black uppercase tracking-widest text-xs rounded-full shadow-2xl animate-bounce">
                Shared Successfully!
              </div>
            )}
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
      <Navbar />
    </div>
  );
};

export default Feed;
