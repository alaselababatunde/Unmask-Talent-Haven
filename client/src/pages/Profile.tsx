import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Edit, Trophy, Users, Heart, Video } from 'lucide-react';
import { useState } from 'react';

interface UserData {
  user: {
    _id: string;
    username: string;
    email: string;
    profileImage?: string;
    bio?: string;
    followers: string[];
    following: string[];
    achievements: string[];
    badges: string[];
  };
  posts: Array<{
    _id: string;
    mediaUrl: string;
    thumbnail?: string;
    caption: string;
    likes: string[];
    views: number;
  }>;
}

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');

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

  if (!data) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center">
        <div className="text-accent-beige">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-matte-black pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-matte-black border border-deep-purple/30 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-deep-purple/30 flex items-center justify-center overflow-hidden border-2 border-deep-purple">
              {data.user.profileImage ? (
                <img
                  src={data.user.profileImage}
                  alt={data.user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-deep-purple text-3xl font-bold">
                  {data.user.username[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-accent-beige">{data.user.username}</h1>
                {isOwnProfile && (
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setBio(data.user.bio || '');
                  }}
                  className="p-2 bg-deep-purple/20 hover:bg-deep-purple/30 rounded-full text-deep-purple transition-all"
                >
                  <Edit size={20} />
                </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple resize-none"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveBio}
                      className="px-4 py-2 bg-deep-purple hover:bg-deep-purple/80 text-accent-beige rounded-2xl text-sm font-semibold transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setBio(data.user.bio || '');
                      }}
                      className="px-4 py-2 bg-matte-black border border-deep-purple/30 hover:border-deep-purple text-accent-beige rounded-2xl text-sm font-semibold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-accent-beige/80 mb-4">{data.user.bio || 'No bio yet'}</p>
              )}

              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Video className="text-deep-purple" size={18} />
                  <span className="text-accent-beige font-semibold">{data.posts.length}</span>
                  <span className="text-accent-beige/60">posts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="text-deep-purple" size={18} />
                  <span className="text-accent-beige font-semibold">{data.user.followers.length}</span>
                  <span className="text-accent-beige/60">followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="text-deep-purple" size={18} />
                  <span className="text-accent-beige font-semibold">{data.user.following.length}</span>
                  <span className="text-accent-beige/60">following</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {(data.user.achievements.length > 0 || data.user.badges.length > 0) && (
          <div className="bg-matte-black border border-deep-purple/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-deep-purple" size={24} />
              <h2 className="text-xl font-bold text-accent-beige">Achievements & Badges</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {data.user.achievements.map((achievement, i) => (
                <div
                  key={i}
                  className="px-4 py-2 bg-deep-purple/20 border border-deep-purple/30 rounded-full text-accent-beige text-sm"
                >
                  {achievement}
                </div>
              ))}
              {data.user.badges.map((badge, i) => (
                <div
                  key={i}
                  className="px-4 py-2 bg-rich-brown/20 border border-rich-brown/30 rounded-full text-accent-beige text-sm"
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-accent-beige mb-4">Posts</h2>
          {data.posts.length === 0 ? (
            <div className="text-center py-12 bg-matte-black border border-deep-purple/30 rounded-2xl">
              <p className="text-accent-beige/60">No posts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {data.posts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => navigate(`/feed`)}
                  className="aspect-square bg-matte-black border border-deep-purple/20 rounded-2xl overflow-hidden cursor-pointer hover:border-deep-purple transition-all group relative"
                >
                  {post.mediaUrl && (
                    <img
                      src={post.thumbnail || post.mediaUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center gap-3 text-white text-xs">
                        <div className="flex items-center gap-1">
                          <Heart size={14} />
                          <span>{post.likes.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Video size={14} />
                          <span>{post.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default Profile;

