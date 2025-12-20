import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, UserPlus } from 'lucide-react';

const Activity = () => {
    const navigate = useNavigate();

    const activities = [
        { type: 'like', text: 'You liked a post by @sarah_music', time: '2h ago', icon: Heart },
        { type: 'comment', text: 'You commented on @jazz_master', time: '5h ago', icon: MessageCircle },
        { type: 'follow', text: 'You started following @beat_maker', time: '1d ago', icon: UserPlus },
        { type: 'like', text: 'You liked a post by @poetry_soul', time: '2d ago', icon: Heart },
    ];

    return (
        <div className="min-h-[100dvh] bg-matte-black pb-24">
            <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => navigate('/settings')} className="text-accent-beige hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold text-accent-beige">Activity Centre</h1>
                </div>

                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                    {activities.map((activity, i) => {
                        const Icon = activity.icon;
                        return (
                            <div key={i} className="p-4 border-b border-white/5 last:border-0 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                <div className="p-2 bg-deep-purple/20 rounded-full text-deep-purple">
                                    <Icon size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-sm font-medium">{activity.text}</p>
                                    <p className="text-accent-beige/40 text-xs mt-1">{activity.time}</p>
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
