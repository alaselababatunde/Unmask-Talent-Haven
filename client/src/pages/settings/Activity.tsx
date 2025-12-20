import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, UserPlus } from 'lucide-react';

const Activity = () => {
    const navigate = useNavigate();

    const activities = [
        { type: 'like', text: 'You liked a post by @sarah_music', time: '2h ago', icon: Heart, color: 'text-neon-purple' },
        { type: 'comment', text: 'You commented on @jazz_master', time: '5h ago', icon: MessageCircle, color: 'text-neon-blue' },
        { type: 'follow', text: 'You started following @beat_maker', time: '1d ago', icon: UserPlus, color: 'text-white/40' },
        { type: 'like', text: 'You liked a post by @poetry_soul', time: '2d ago', icon: Heart, color: 'text-neon-purple' },
    ];

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
                    <h1 className="text-3xl font-bold font-display tracking-tight">Activity</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar relative z-10">
                <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden animate-scale-in">
                    {activities.map((activity, i) => {
                        const Icon = activity.icon;
                        return (
                            <div key={i} className="p-6 border-b border-white/5 last:border-0 flex items-center gap-4 hover:bg-white/5 transition-all group">
                                <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <Icon className={activity.color} size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white/80">{activity.text}</p>
                                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">{activity.time}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <Navbar />
        </div>
    );
};

export default Activity;
