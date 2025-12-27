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

  // Like, follow, comment, delete, archive, update mutations remain the same as your original code
  // ...omitted here for brevity, can be copied from your old feed

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent, postId: string) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected
      handleLike(postId);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = playerRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) {
              setPlayingIndex(index);
              setIsPaused(false);
            }
          }
        });
      },
      { threshold: 0.5 }
    );
    playerRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [posts]);

  return (
    <div className="fixed-screen bg-black">
      {/* Floating Tabs */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-6 pb-2 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <div className="w-full overflow-x-auto no-scrollbar px-6 pointer-events-auto">
          <div className="flex items-center justify-center gap-8 min-w-max pb-2">
            {[
              { id: 'following', label: 'Following' },
              { id: 'video', label: 'For You' },
              { id: 'sign-language', label: 'Sign' },
              { id: 'audio', label: 'Audio' },
              { id: 'text', label: 'Poetry' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-[15px] font-bold transition-all duration-300 relative py-1 drop-shadow-md ${activeTab === tab.id ? 'text-white scale-105' : 'text-white/60 hover:text-white/80'}`}
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

      {/* Feed */}
      <div className="scrollable-content snap-y snap-mandatory">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-neon-purple/20 border-t-neon-purple rounded-full animate-spin" />
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-center p-10 text-white/40">
            <VideoIcon size={40} className="mb-4" />
            <p className="text-xl font-bold">{activeTab === 'following' ? "You're not following anyone yet." : "No talent discovered yet"}</p>
          </div>
        ) : (
          displayPosts.map((post, index) => (
            <div
              key={post._id}
              ref={el => (playerRefs.current[index] = el)}
              className="snap-start h-[100dvh] w-full relative flex items-center justify-center overflow-hidden"
            >
              {/* Media */}
              <div className="w-full h-full relative cursor-pointer" onClick={e => handleDoubleTap(e, post._id)}>
                {(post.mediaType === 'video' || post.mediaType === 'sign-language') && (
                  <ReactPlayer
                    url={post.mediaUrl}
                    playing={playingIndex === index && !isPaused}
                    controls={false}
                    loop
                    muted={false} // auto-play with sound
                    width="100%"
                    height="100%"
                    className="!h-full !w-full object-cover"
                    playsinline
                    config={{
                      file: { attributes: { playsInline: true, preload: 'auto' } }
                    }}
                  />
                )}
                {/* Audio & Text Handling Same as Old Code */}
                {/* ...can be copied directly from your original feed */}
                
                {/* Heart & Pause Overlay */}
                {showHeart && <div className="fixed z-[100] pointer-events-none animate-ping" style={{ left: heartPos.x - 40, top: heartPos.y - 40 }}><Heart size={80} className="text-neon-purple fill-neon-purple drop-shadow-[0_0_20px_rgba(176,38,255,0.8)]" /></div>}
                {isPaused && <div className="absolute inset-0 flex items-center justify-center z-10 animate-fade-in pointer-events-none"><div className="w-20 h-20 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10"><div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1" /></div></div>}
              </div>

              {/* Right Side Icons */}
              <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 z-20">
                {/* User Avatar & Follow */}
                <div className="relative mb-4">
                  <button onClick={() => navigate(`/profile/${post.user._id}`)} className="w-12 h-12 rounded-full border border-white p-0.5 overflow-hidden shadow-lg">
                    {post.user.profileImage ? <img src={post.user.profileImage} alt={post.user.username} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-black font-black text-sm">{post.user.username[0].toUpperCase()}</div>}
                  </button>
                  {currentUser?.id !== post.user._id && (
                    <button
                      onClick={() => followMutation.mutate({ targetId: post.user._id, isFollowing: currentUser?.following?.some(f => f._id === post.user._id) || false })}
                      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${currentUser?.following?.some(f => f._id === post.user._id) ? 'bg-white text-black' : 'bg-neon-purple text-black'}`}
                    >
                      {currentUser?.following?.some(f => f._id === post.user._id) ? <Check size={12} strokeWidth={4} /> : <Plus size={12} strokeWidth={4} />}
                    </button>
                  )}
                </div>

                {/* Action Icons */}
                <div className="flex flex-col items-center gap-4">
                  <button onClick={() => handleLike(post._id)} className="flex flex-col items-center gap-1"><Heart size={32} className={`transition-colors duration-200 ${post.likes.includes(currentUser?.id || '') ? 'fill-neon-purple text-neon-purple' : 'text-white'}`} strokeWidth={post.likes.includes(currentUser?.id || '') ? 0 : 2} /><span className="text-xs text-white">{post.likes.length}</span></button>
                  <button onClick={() => setOpenCommentsPostId(post._id)} className="flex flex-col items-center gap-1"><MessageCircle size={32} className="text-white" strokeWidth={2} /><span className="text-xs text-white">{post.comments.length}</span></button>
                  <button onClick={() => setOpenSharePostId(post._id)} className="flex flex-col items-center gap-1"><Share2 size={32} className="text-white" strokeWidth={2} /><span className="text-xs text-white">Share</span></button>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="absolute left-4 right-20 bottom-4 p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none">
                <div className="max-w-[80%] pointer-events-auto">
                  <h3 className="text-lg font-bold text-white cursor-pointer" onClick={() => navigate(`/profile/${post.user._id}`)}>@{post.user.username}</h3>
                  <p className="text-white/90 text-[15px] leading-snug mb-2">{post.caption}</p>
                  {post.tags.length > 0 && <div className="flex flex-wrap gap-2">{post.tags.map((tag, i) => <span key={i} className="text-white font-bold text-xs opacity-90">#{tag}</span>)}</div>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;
