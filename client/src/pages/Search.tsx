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
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header / Search Bar */}
            <div className="px-6 pt-8 pb-4 relative z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 glass-button rounded-full text-white/40 hover:text-white transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1 relative group">
                        <SearchIcon className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-neon-purple' : 'text-white/20'}`} size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search talents, creators..."
                            className="w-full bg-obsidian/40 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-neon-purple/50 focus:bg-obsidian/60 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Filters */}
                {debouncedQuery && (
                    <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar pb-2">
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
                                    ? 'bg-neon-purple text-black shadow-lg shadow-neon-purple/20'
                                    : 'glass-button text-white/40 hover:text-white/60'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar relative z-10">
                {!debouncedQuery ? (
                    <>
                        {/* Categories Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            {categories.map((cat, i) => (
                                <button key={i} className="glass-panel p-6 rounded-3xl border-white/5 flex flex-col items-center gap-3 hover:bg-white/5 transition-all group">
                                    <div className={`w-12 h-12 rounded-2xl ${cat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <cat.icon className={cat.color} size={24} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-white/60">{cat.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="text-center py-20 opacity-20">
                            <SearchIcon size={48} className="mx-auto mb-6 text-white/20" />
                            <p className="text-lg font-bold">Search to discover talent</p>
                        </div>
                    </>
                ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-neon-purple/20 border-t-neon-purple rounded-full animate-spin" />
                        <p className="text-xs font-black uppercase tracking-widest text-white/20">Searching the Haven...</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Creators Section */}
                        {(activeFilter === 'all' || activeFilter === 'creators') && results.users.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-6 px-2">
                                    <h2 className="text-[10px] font-black uppercase tracking-widest text-white/20">Creators Found</h2>
                                    <Users size={14} className="text-neon-blue" />
                                </div>
                                <div className="space-y-3">
                                    {results.users.map((creator: any) => (
                                        <div
                                            key={creator._id}
                                            onClick={() => navigate(`/profile/${creator._id}`)}
                                            className="glass-panel p-4 rounded-[2rem] border-white/5 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 group-hover:border-neon-blue/50 transition-colors">
                                                    {creator.profileImage ? (
                                                        <img src={creator.profileImage} alt={creator.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-neon-blue/20 flex items-center justify-center text-neon-blue font-bold">
                                                            {creator.username[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-white/80">@{creator.username}</h3>
                                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{creator.followers?.length || 0} followers</p>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full glass-button flex items-center justify-center text-white/20 group-hover:text-neon-blue transition-colors">
                                                <User size={18} />
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
                                        {activeFilter === 'mine' ? 'My Uploads' : 'Content Found'}
                                    </h2>
                                    <Video size={14} className="text-neon-purple" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {results.posts.map((post: any) => (
                                        <div
                                            key={post._id}
                                            onClick={() => navigate(`/feed?post=${post._id}`)}
                                            className="glass-panel aspect-[3/4] rounded-[2rem] border-white/5 overflow-hidden relative group cursor-pointer"
                                        >
                                            {post.thumbnail || post.mediaUrl ? (
                                                <img
                                                    src={post.thumbnail || post.mediaUrl}
                                                    alt={post.caption}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-obsidian flex items-center justify-center">
                                                    <Play size={32} className="text-white/10" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end">
                                                <p className="text-[10px] font-bold text-white line-clamp-2 mb-1">{post.caption}</p>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">@{post.user?.username}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {results.users.length === 0 && results.posts.length === 0 && (
                            <div className="text-center py-20 opacity-20">
                                <SearchIcon size={48} className="mx-auto mb-6 text-white/20" />
                                <p className="text-lg font-bold">No results found</p>
                                <p className="text-sm mt-2">Try searching for something else</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Navbar />
        </div>
    );
};

export default Search;
