import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ArrowLeft, TrendingUp, Users, Play, Music, Mic2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const Search = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { name: 'Music', icon: Music, color: 'text-neon-purple', bg: 'bg-neon-purple/10' },
        { name: 'Dance', icon: Play, color: 'text-neon-blue', bg: 'bg-neon-blue/10' },
        { name: 'Singing', icon: Mic2, color: 'text-red-500', bg: 'bg-red-500/10' },
        { name: 'Trending', icon: TrendingUp, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    ];

    const trendingTags: string[] = [];
    const suggestedCreators: any[] = [];

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
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neon-purple transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search talents, creators..."
                            className="w-full bg-obsidian/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-neon-purple/50 focus:bg-obsidian/60 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar relative z-10">
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

                {/* Trending Tags */}
                {trendingTags.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/20">Trending Now</h2>
                            <TrendingUp size={14} className="text-neon-purple" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {trendingTags.map((tag, i) => (
                                <button key={i} className="px-4 py-2 glass-button rounded-full text-[10px] font-bold text-white/60 hover:text-white transition-all">
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Suggested Creators */}
                {suggestedCreators.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/20">Suggested Creators</h2>
                            <Users size={14} className="text-neon-blue" />
                        </div>
                        <div className="space-y-3">
                            {suggestedCreators.map((creator) => (
                                <div key={creator.id} className="glass-panel p-4 rounded-[2rem] border-white/5 flex items-center justify-between hover:bg-white/5 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 group-hover:border-neon-blue/50 transition-colors">
                                            <img src={creator.avatar} alt={creator.username} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white/80">@{creator.username}</h3>
                                            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{creator.followers} followers</p>
                                        </div>
                                    </div>
                                    <button onClick={() => navigate(`/profile/${creator.id}`)} className="px-5 py-2 glass-button rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all">
                                        View
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {trendingTags.length === 0 && suggestedCreators.length === 0 && !searchQuery && (
                    <div className="text-center py-20 opacity-20">
                        <SearchIcon size={48} className="mx-auto mb-6 text-white/20" />
                        <p className="text-lg font-bold">Search to discover talent</p>
                    </div>
                )}
            </div>

            <Navbar />
        </div>
    );
};

export default Search;
