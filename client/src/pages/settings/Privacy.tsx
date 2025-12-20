import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, MessageCircle } from 'lucide-react';

const Privacy = () => {
    const navigate = useNavigate();
    const [isPrivate, setIsPrivate] = useState(false);
    const [allowComments, setAllowComments] = useState(true);
    const [showActivity, setShowActivity] = useState(true);

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
                    <h1 className="text-3xl font-bold font-display tracking-tight">Privacy</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar relative z-10">
                <div className="space-y-6">
                    <div className="glass-panel p-8 rounded-[3rem] border-white/5 animate-scale-in">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-neon-purple/10 flex items-center justify-center">
                                    <Lock className="text-neon-purple" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Private Account</h3>
                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Only followers can see posts</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="sr-only peer" />
                                <div className="w-14 h-8 bg-white/5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/20 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-neon-purple peer-checked:after:bg-black peer-checked:after:shadow-lg peer-checked:after:shadow-neon-purple/50"></div>
                            </label>
                        </div>
                    </div>

                    <div className="glass-panel p-8 rounded-[3rem] border-white/5 space-y-10 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 flex items-center justify-center">
                                    <MessageCircle className="text-neon-blue" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Allow Comments</h3>
                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Let people interact</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} className="sr-only peer" />
                                <div className="w-14 h-8 bg-white/5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/20 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-neon-blue peer-checked:after:bg-black peer-checked:after:shadow-lg peer-checked:after:shadow-neon-blue/50"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                    <Eye className="text-white/40" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Activity Status</h3>
                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Show when you're online</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input type="checkbox" checked={showActivity} onChange={(e) => setShowActivity(e.target.checked)} className="sr-only peer" />
                                <div className="w-14 h-8 bg-white/5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/20 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-white/20 peer-checked:after:bg-black"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <Navbar />
        </div>
    );
};

export default Privacy;
