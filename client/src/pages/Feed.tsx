import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api';
import Navbar from '../components/Navbar';
import ReactPlayer from 'react-player';
import { Heart, MessageCircle, Share2, Play, Pause } from 'lucide-react';

interface Post {
  _id: string;
  user: {
    username: string;
    profileImage?: string;
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

  const { data: posts = [], refetch } = useQuery<Post[]>({
    queryKey: ['feed'],
    queryFn: async () => {
      const response = await api.get('/feed');
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

  return (
    <div className="min-h-screen bg-matte-black pb-24">
      {/* Weekly Challenge Banner */}
      <div className="gradient-purple-brown p-4 mb-4 rounded-b-2xl glow-purple">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-accent-beige font-bold text-lg mb-1">Weekly Challenge</h2>
          <p className="text-accent-beige/80 text-sm">Showcase your talent this week and win amazing prizes!</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {posts.map((post, index) => (
          <div
            key={post._id}
            ref={(el) => {
              playerRefs.current[index] = el;
            }}
            className="bg-matte-black border border-deep-purple/20 rounded-2xl overflow-hidden"
          >
            {/* Post Header */}
            <div className="flex items-center gap-3 p-4 border-b border-deep-purple/10">
              <div className="w-10 h-10 rounded-full bg-deep-purple/30 flex items-center justify-center overflow-hidden">
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

            {/* Media */}
            <div className="relative bg-matte-black aspect-video">
              {post.mediaType === 'video' || post.mediaType === 'sign-language' ? (
                <ReactPlayer
                  url={post.mediaUrl}
                  playing={playingIndex === index}
                  controls
                  width="100%"
                  height="100%"
                  className="react-player"
                />
              ) : post.mediaType === 'audio' ? (
                <div className="flex items-center justify-center h-full">
                  <ReactPlayer
                    url={post.mediaUrl}
                    playing={playingIndex === index}
                    controls
                    width="100%"
                    height="60px"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-8">
                  <p className="text-accent-beige text-lg leading-relaxed whitespace-pre-wrap">{post.caption}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`flex items-center gap-2 ${
                    post.likes.length > 0 ? 'text-deep-purple' : 'text-accent-beige/60'
                  } hover:text-deep-purple transition-colors`}
                >
                  <Heart className={post.likes.length > 0 ? 'fill-current' : ''} size={24} />
                  <span>{post.likes.length}</span>
                </button>
                <button className="flex items-center gap-2 text-accent-beige/60 hover:text-deep-purple transition-colors">
                  <MessageCircle size={24} />
                  <span>{post.comments.length}</span>
                </button>
                <button className="flex items-center gap-2 text-accent-beige/60 hover:text-deep-purple transition-colors">
                  <Share2 size={24} />
                </button>
              </div>

              {/* Caption */}
              {post.caption && (
                <div>
                  <p className="text-accent-beige/80 text-sm">
                    <span className="font-semibold">{post.user.username}</span> {post.caption}
                  </p>
                </div>
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="text-deep-purple text-xs bg-deep-purple/10 px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Comments */}
              {post.comments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-deep-purple/10">
                  {post.comments.slice(0, 3).map((comment, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="font-semibold text-accent-beige text-sm">{comment.user.username}</span>
                      <span className="text-accent-beige/70 text-sm">{comment.text}</span>
                    </div>
                  ))}
                  {post.comments.length > 3 && (
                    <button className="text-deep-purple text-sm">View all {post.comments.length} comments</button>
                  )}
                </div>
              )}

              {/* Add Comment */}
              <div className="flex gap-2 pt-2 border-t border-deep-purple/10">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 bg-matte-black border border-deep-purple/30 rounded-full px-4 py-2 text-accent-beige text-sm focus:outline-none focus:border-deep-purple"
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
          <div className="text-center py-12">
            <p className="text-accent-beige/60">No posts yet. Be the first to share your talent!</p>
          </div>
        )}
      </div>

      <Navbar />
    </div>
  );
};

export default Feed;

