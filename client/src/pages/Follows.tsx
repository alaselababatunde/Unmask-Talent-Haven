import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Users, UserPlus, UserMinus, Search, X } from 'lucide-react';

interface FollowUser {
    _id: string;
    username: string;
    profileImage?: string;
    bio?: string;
}

const Follows = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') === 'requests' ? 'requests' : (searchParams.get('tab') === 'following' ? 'following' : 'followers');
    const [activeTab, setActiveTab] = useState<'followers' | 'following' | 'requests'>(initialTab);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { user: currentUser, updateFollowing, acceptFollowRequest, declineFollowRequest } = useAuth();

    const userId = id || currentUser?.id;

    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['user-basic', userId],
        queryFn: async () => {
            const response = await api.get(`/user/${userId}`);
            return response.data.user;
        },
        enabled: !!userId,
    });

    const { data: followers = [], isLoading: followersLoading, refetch: refetchFollowers } = useQuery<FollowUser[]>({
        queryKey: ['followers', userId],
        queryFn: async () => {
            const response = await api.get(`/user/${userId}/followers`);
            return response.data.followers;
        },
        enabled: !!userId && activeTab === 'followers',
    });

    const { data: following = [], isLoading: followingLoading, refetch: refetchFollowing } = useQuery<FollowUser[]>({
        queryKey: ['following', userId],
        queryFn: async () => {
            const response = await api.get(`/user/${userId}/following`);
            return response.data.following;
        },
        enabled: !!userId && activeTab === 'following',
    });

    const { data: requests = [], isLoading: requestsLoading, refetch: refetchRequests } = useQuery<FollowUser[]>({
        queryKey: ['follow-requests', userId],
        queryFn: async () => {
            const response = await api.get(`/user/${userId}`);
            return response.data.user.followRequests || [];
        },
        enabled: !!userId && activeTab === 'requests' && userId === currentUser?.id,
    });

    const followMutation = useMutation({
        mutationFn: async (targetId: string) => {
            await api.post(`/user/${targetId}/follow`);
        },
        onMutate: (targetId) => {
            updateFollowing(targetId, true);
        },
        onSuccess: () => {
            refetchFollowers();
            refetchFollowing();
        },
    });

    const unfollowMutation = useMutation({
        mutationFn: async (targetId: string) => {
            await api.post(`/user/${targetId}/unfollow`);
        },
        onMutate: (targetId) => {
            updateFollowing(targetId, false);
        },
        onSuccess: () => {
            refetchFollowers();
            refetchFollowing();
        },
    });

    const list = activeTab === 'followers' ? followers : (activeTab === 'following' ? following : requests);
    const isLoading = activeTab === 'followers' ? followersLoading : (activeTab === 'following' ? followingLoading : requestsLoading);

    const filteredList = list.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isFollowing = (targetId: string) => {
        return currentUser?.following?.some((f: any) => f._id === targetId);
    };

    return (
        <div className="h-[100dvh] w-full bg-primary flex flex-col relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="px-6 pt-8 pb-4 relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="p-3 glass-button rounded-full text-white/40 hover:text-white transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold font-display tracking-tight">
                            {userLoading ? '...' : userData?.username}
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                            Social Network
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-obsidian/50 p-1.5 rounded-2xl border border-white/5 mb-6">
                    <button
                        onClick={() => setActiveTab('followers')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'followers' ? 'bg-white text-black shadow-lg' : 'text-white/40'}`}
                    >
                        Followers
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'following' ? 'bg-white text-black shadow-lg' : 'text-white/40'}`}
                    >
                        Following
                    </button>
                    {userId === currentUser?.id && (
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-white text-black shadow-lg' : 'text-white/40'}`}
                        >
                            Requests
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neon-purple transition-colors" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${activeTab}...`}
                        className="w-full bg-obsidian/40 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:outline-none focus:border-neon-purple transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar relative z-10">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center opacity-20">
                        <div className="w-10 h-10 border-4 border-neon-purple border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-sm font-bold">Loading {activeTab}...</p>
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users size={40} className="text-white/10" />
                        </div>
                        <p className="text-lg font-bold mb-2">
                            {searchQuery ? "No matches found" : activeTab === 'followers' ? "No followers yet" : activeTab === 'following' ? "Not following anyone yet" : "No pending requests"}
                        </p>
                        <p className="text-sm text-white/40 max-w-xs mx-auto">
                            {searchQuery ? "Try searching for another username." : activeTab === 'followers' ? "Share your talent to attract more followers!" : activeTab === 'following' ? "Discover talented creators to follow." : "When people request to follow your private account, they'll show up here."}
                        </p>
                        {!searchQuery && activeTab === 'following' && (
                            <button
                                onClick={() => navigate('/search')}
                                className="mt-8 px-8 py-3 bg-neon-purple text-black rounded-2xl font-bold shadow-lg shadow-neon-purple/20 active:scale-95 transition-all"
                            >
                                Find Creators
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredList.map((u) => (
                            <div
                                key={u._id}
                                className="glass-panel p-4 rounded-[2rem] border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all animate-scale-in"
                            >
                                <div
                                    className="flex items-center gap-4 cursor-pointer"
                                    onClick={() => navigate(`/profile/${u._id}`)}
                                >
                                    <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-neon-purple to-neon-blue">
                                        <div className="w-full h-full rounded-full bg-obsidian overflow-hidden">
                                            {u.profileImage ? (
                                                <img src={u.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neon-purple font-bold text-xl">
                                                    {u.username[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-neon-blue transition-colors">{u.username}</h3>
                                        <p className="text-xs text-white/40 line-clamp-1 max-w-[150px]">{u.bio || "Creator"}</p>
                                    </div>
                                </div>

                                {currentUser?.id !== u._id && activeTab !== 'requests' && (
                                    <button
                                        onClick={() => isFollowing(u._id) ? unfollowMutation.mutate(u._id) : followMutation.mutate(u._id)}
                                        className={`p-3 rounded-2xl transition-all ${isFollowing(u._id)
                                            ? 'bg-white/5 text-white/40 hover:text-red-500 hover:bg-red-500/10'
                                            : 'bg-neon-purple text-black shadow-lg shadow-neon-purple/20 active:scale-90'}`}
                                    >
                                        {isFollowing(u._id) ? <UserMinus size={20} /> : <UserPlus size={20} />}
                                    </button>
                                )}

                                {activeTab === 'requests' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={async () => {
                                                await acceptFollowRequest(u._id);
                                                refetchRequests();
                                            }}
                                            className="p-3 bg-neon-purple text-black rounded-2xl shadow-lg shadow-neon-purple/20 active:scale-90 transition-all"
                                        >
                                            <UserPlus size={20} />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                await declineFollowRequest(u._id);
                                                refetchRequests();
                                            }}
                                            className="p-3 bg-white/5 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Navbar />
        </div>
    );
};

export default Follows;
