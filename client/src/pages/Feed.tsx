import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api';
import Navbar from '../components/Navbar';
import ReactPlayer from 'react-player';
import { Heart, MessageCircle, Share2, Video, Music, FileText, Hand, Search } from 'lucide-react';

interface Post {
  _id: string;
  user: {
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
  const [playingIndex, setPlayingIndex] = useState(0);
  const playerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'text' | 'sign-language'>('video');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);

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

  const commentMutation = useMutation({
    mutationFn: async ({ postId, text }: { postId: string; text: string }) => {
      const response = await api.post(`/feed/${postId}/comment`, { text });
      return response.data;
    },
    onSuccess: () => {
      refetch();
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

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId);
  };

  const handleComment = (postId: string, text: string) => {
    if (text.trim()) {
      commentMutation.mutate({ postId, text });
    }
  };

  const isVideoTab = activeTab === 'video' || activeTab === 'sign-language';

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
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
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

      {isVideoTab ? (
      <div className="h-[calc(100vh-56px)] overflow-y-scroll snap-y snap-mandatory no-scrollbar relative">
        {posts.map((post, index) => (
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
              <div className="flex items-center gap-3">
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
                  {post.tags.map((tag, i) => (
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
          {posts.map((post) => (
            <div key={post._id} className="bg-matte-black border border-deep-purple/20 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-deep-purple/10">
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
              </div>

              {post.mediaType === 'audio' ? (
                <div className="p-4">
                  <ReactPlayer url={post.mediaUrl} controls width="100%" height="60px" />
                </div>
              ) : post.mediaType === 'text' ? (
                <div className="p-6">
                  <p className="text-accent-beige text-lg leading-relaxed whitespace-pre-wrap">{post.caption}</p>
                </div>
              ) : (
                <div className="p-4">
                  <ReactPlayer url={post.mediaUrl} controls width="100%" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-center gap-4 mb-3">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-2 ${post.likes.length > 0 ? 'text-deep-purple' : 'text-accent-beige/60'} hover:text-deep-purple transition-colors`}
                  >
                    <Heart className={post.likes.length > 0 ? 'fill-current' : ''} size={20} />
                    <span>{post.likes.length}</span>
                  </button>
                  <button
                    onClick={() => setOpenCommentsPostId(post._id)}
                    className="flex items-center gap-2 text-accent-beige/60 hover:text-deep-purple transition-colors"
                  >
                    <MessageCircle size={20} />
                    <span>{post.comments.length}</span>
                  </button>
                </div>

                {post.caption && (
                  <p className="text-accent-beige/80 text-sm">
                    <span className="font-semibold">{post.user.username}</span> {post.caption}
                  </p>
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

      {/* Comments Drawer */}
      {openCommentsPostId && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenCommentsPostId(null)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-matte-black border-t border-deep-purple/30 rounded-t-2xl max-h-[70vh]">
            <div className="p-4 border-b border-deep-purple/20 flex items-center justify-between">
              <span className="text-accent-beige font-semibold">Comments</span>
              <button
                onClick={() => setOpenCommentsPostId(null)}
                className="text-accent-beige/60 hover:text-accent-beige"
              >
                Close
              </button>
            </div>
            <div className="px-4 py-2 overflow-y-auto space-y-3 max-h-[50vh]">
              {posts
                .find((p) => p._id === openCommentsPostId)?.comments.map((comment, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="font-semibold text-accent-beige text-sm">{comment.user.username}</span>
                    <span className="text-accent-beige/70 text-sm">{comment.text}</span>
                  </div>
                ))}
              {posts.find((p) => p._id === openCommentsPostId)?.comments.length === 0 && (
                <p className="text-accent-beige/60 text-sm">No comments yet.</p>
              )}
            </div>
            <div className="p-4 border-t border-deep-purple/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-matte-black border border-deep-purple/30 rounded-full px-4 py-2 text-accent-beige text-sm focus:outline-none focus:border-deep-purple"
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
                  className="px-4 py-2 bg-deep-purple text-accent-beige rounded-full text-sm font-semibold hover:bg-deep-purple/80"
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


