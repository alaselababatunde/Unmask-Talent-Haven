import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, UserPlus } from 'lucide-react';

const Notifications = () => {
    const navigate = useNavigate();
    const [likes, setLikes] = useState(true);
    const [comments, setComments] = useState(true);
    const [follows, setFollows] = useState(true);

    return (
        <div className="h-[100dvh] w-full bg-primary flex flex-col relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="px-6 py-8 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/settings')} className="p-3 glass-button rounded-full text-white/40 hover:text-white transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold font-display tracking-tight">Notifications</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar relative z-10">
                <div className="glass-panel p-8 rounded-[3rem] border-white/5 space-y-10 animate-scale-in">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-neon-purple/10 flex items-center justify-center">
                                <Heart className="text-neon-purple" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold">Likes</h3>
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">When someone likes posts</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer group">
                            <input type="checkbox" checked={likes} onChange={(e) => setLikes(e.target.checked)} className="sr-only peer" />
                            <div className="w-14 h-8 bg-white/5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/20 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-neon-purple peer-checked:after:bg-black peer-checked:after:shadow-lg peer-checked:after:shadow-neon-purple/50"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 flex items-center justify-center">
                                <MessageCircle className="text-neon-blue" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold">Comments</h3>
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">When someone comments</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer group">
                            <input type="checkbox" checked={comments} onChange={(e) => setComments(e.target.checked)} className="sr-only peer" />
                            <div className="w-14 h-8 bg-white/5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/20 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-neon-blue peer-checked:after:bg-black peer-checked:after:shadow-lg peer-checked:after:shadow-neon-blue/50"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                <UserPlus className="text-white/40" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold">New Followers</h3>
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">When someone follows you</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer group">
                            <input type="checkbox" checked={follows} onChange={(e) => setFollows(e.target.checked)} className="sr-only peer" />
                            <div className="w-14 h-8 bg-white/5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/20 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-white/20 peer-checked:after:bg-black"></div>
                        </label>
                    </div>
                </div>
            </div>
            <Navbar />
        </div>
    );
};

export default Notifications;
