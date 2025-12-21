import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, ArrowLeft, TrendingUp, Users, Play, Music, Mic2, Video, User, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Search = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'creators' | 'content' | 'mine'>('all');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data, isLoading } = useQuery({
        queryKey: ['search', debouncedQuery, activeFilter],
        queryFn: async () => {
            if (!debouncedQuery.trim()) return { users: [], posts: [] };
            const response = await api.get('/feed/search', {
                params: {
                    q: debouncedQuery,
                    onlyMine: activeFilter === 'mine'
                }
            });
            return response.data;
        },
        enabled: debouncedQuery.length > 0
    });

    const categories = [
        { name: 'Music', icon: Music, color: 'text-neon-purple', bg: 'bg-neon-purple/10' },
        { name: 'Dance', icon: Play, color: 'text-neon-blue', bg: 'bg-neon-blue/10' },
        { name: 'Singing', icon: Mic2, color: 'text-red-500', bg: 'bg-red-500/10' },
        { name: 'Trending', icon: TrendingUp, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    ];

    const results = data || { users: [], posts: [] };

    return (
        <div className="h-[100dvh] w-full bg-primary flex flex-col relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

            {/* Fixed Header / Search Bar */}
            <div className="sticky top-0 z-[100] bg-primary/40 backdrop-blur-xl border-b border-white/5 px-6 pt-12 pb-6">
                <div className="flex items-center gap-4 max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 glass-button rounded-full text-white/40 hover:text-white transition-all active:scale-90"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1 relative group">
                        <SearchIcon className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${searchQuery ? 'text-neon-purple' : 'text-white/20'}`} size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search talents, creators..."
                            className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] py-4 pl-14 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-neon-purple/30 focus:bg-white/10 transition-all duration-300"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors p-1"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Filters */}
                {debouncedQuery && (
                    <div className="flex gap-3 mt-6 overflow-x-auto no-scrollbar pb-2 max-w-4xl mx-auto">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'creators', label: 'Creators' },
                            { id: 'content', label: 'Content' },
                            { id: 'mine', label: 'My Uploads', hide: !currentUser }
                        ].map(f => !f.hide && (
                            <button
                                key={f.id}
                                onClick={() => setActiveFilter(f.id as any)}
                                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === f.id
                                    ? 'bg-neon-purple text-black shadow-[0_0_20px_rgba(176,38,255,0.4)]'
                                    : 'bg-white/5 text-white/40 hover:text-white/60'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar relative z-10">
                <div className="max-w-4xl mx-auto pt-8">
                    {!debouncedQuery ? (
                        <>
                            {/* Categories Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-12">
                                {categories.map((cat, i) => (
                                    <button
                                        key={i}
                                        className="glass-panel p-8 rounded-[2.5rem] border-white/5 flex flex-col items-center gap-4 hover:bg-white/5 transition-all group active:scale-95"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                                            <cat.icon className={cat.color} size={28} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/80 transition-colors">{cat.name}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <SearchIcon size={32} className="text-white/10" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Discover Talent</h3>
                                <p className="text-white/40 text-sm max-w-[200px] mx-auto">Search for creators, tags, or specific talent categories</p>
                            </div>
                        </>
                    ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6">
                            <div className="w-12 h-12 border-4 border-neon-purple/10 border-t-neon-purple rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 animate-pulse">Searching the Haven...</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Creators Section */}
                            {(activeFilter === 'all' || activeFilter === 'creators') && results.users.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-6 px-2">
                                        <h2 className="text-[10px] font-black uppercase tracking-widest text-white/20">Creators</h2>
                                        <Users size={14} className="text-neon-blue/40" />
                                    </div>
                                    <div className="space-y-4">
                                        {results.users.map((creator: any) => (
                                            <div
                                                key={creator._id}
                                                onClick={() => navigate(`/profile/${creator._id}`)}
                                                className="glass-panel p-5 rounded-[2.5rem] border-white/5 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer active:scale-[0.98]"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="relative">
                                                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 group-hover:border-neon-blue/50 transition-colors duration-500">
                                                            {creator.profileImage ? (
                                                                <img src={creator.profileImage} alt={creator.username} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-neon-blue/10 flex items-center justify-center text-neon-blue font-bold text-xl">
                                                                    {creator.username[0].toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {creator.isLive && (
                                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-primary animate-pulse" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white group-hover:text-neon-blue transition-colors">@{creator.username}</h3>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{creator.followers?.length || 0} followers</p>
                                                            {creator.isFollowing && (
                                                                <span className="text-[8px] px-2 py-0.5 bg-neon-purple/10 text-neon-purple rounded-full font-black uppercase">Following</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-neon-blue/10 group-hover:text-neon-blue transition-all">
                                                    <User size={20} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Content Section */}
                            {(activeFilter === 'all' || activeFilter === 'content' || activeFilter === 'mine') && results.posts.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-6 px-2">
                                        <h2 className="text-[10px] font-black uppercase tracking-widest text-white/20">
                                            {activeFilter === 'mine' ? 'My Uploads' : 'Content'}
                                        </h2>
                                        <Video size={14} className="text-neon-purple/40" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {results.posts.map((post: any) => (
                                            <div
                                                key={post._id}
                                                onClick={() => navigate(`/feed?post=${post._id}`)}
                                                className="glass-panel aspect-[3/4] rounded-[2.5rem] border-white/5 overflow-hidden relative group cursor-pointer active:scale-[0.98]"
                                            >
                                                {post.thumbnail || post.mediaUrl ? (
                                                    <img
                                                        src={post.thumbnail || post.mediaUrl}
                                                        alt={post.caption}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-obsidian flex items-center justify-center">
                                                        <Play size={40} className="text-white/5" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <p className="text-xs font-bold text-white line-clamp-2 mb-2">{post.caption}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-white/10 overflow-hidden">
                                                            {post.user?.profileImage && <img src={post.user.profileImage} className="w-full h-full object-cover" />}
                                                        </div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/60">@{post.user?.username}</p>
                                                    </div>
                                                </div>
                                                {/* Play indicator */}
                                                <div className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Play size={12} className="text-white fill-white" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {results.users.length === 0 && results.posts.length === 0 && (
                                <div className="text-center py-32">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <X size={32} className="text-white/10" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">No Results</h3>
                                    <p className="text-white/40 text-sm max-w-[200px] mx-auto">We couldn't find anything matching "{debouncedQuery}"</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Navbar />
        </div>
    );
};

export default Search;
