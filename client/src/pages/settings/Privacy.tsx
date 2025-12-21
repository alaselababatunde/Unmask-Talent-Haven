import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import api from '../../api';

const Privacy = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [isPrivate, setIsPrivate] = useState<boolean>(user?.settings?.isPrivate ?? false);
    const [allowComments, setAllowComments] = useState<boolean>(user?.settings?.allowComments ?? true);
    const [showActivity, setShowActivity] = useState<boolean>(user?.settings?.showActivity ?? true);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (user?.settings) {
            setIsPrivate(user.settings.isPrivate);
            setAllowComments(user.settings.allowComments);
            setShowActivity(user.settings.showActivity);
        }
    }, [user]);

    const mutation = useMutation({
        mutationFn: async (newSettings: any) => {
            const response = await api.put('/auth/settings', { settings: newSettings });
            return response.data;
        },
        onSuccess: () => {
            setFeedback({ type: 'success', message: 'Privacy settings updated' });
            refreshUser();
            setTimeout(() => setFeedback(null), 3000);
        },
        onError: (error: any) => {
            setFeedback({ type: 'error', message: error.response?.data?.message || 'Failed to update settings' });
            setTimeout(() => setFeedback(null), 3000);
        }
    });

    const handleToggle = (key: string, value: boolean) => {
        const newSettings = {
            isPrivate: key === 'isPrivate' ? value : isPrivate,
            allowComments: key === 'allowComments' ? value : allowComments,
            showActivity: key === 'showActivity' ? value : showActivity,
        };

        if (key === 'isPrivate') setIsPrivate(value);
        if (key === 'allowComments') setAllowComments(value);
        if (key === 'showActivity') setShowActivity(value);

        mutation.mutate(newSettings);
    };

    return (
        <div className="fixed-screen">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Fixed Glassy Header */}
            <div className="absolute top-0 left-0 right-0 z-[100] bg-primary/40 backdrop-blur-xl border-b border-white/5 px-6 pt-12 pb-6">
                <div className="flex items-center gap-4 max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/settings')}
                        className="p-3 glass-button rounded-full text-white/40 hover:text-white transition-all active:scale-90"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold font-display tracking-tight">Privacy</h1>
                </div>
            </div>

            <div className="scrollable-content px-6 pb-32 no-scrollbar">
                <div className="max-w-4xl mx-auto pt-32">
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
                                    <input
                                        type="checkbox"
                                        checked={isPrivate}
                                        onChange={(e) => handleToggle('isPrivate', e.target.checked)}
                                        className="sr-only peer"
                                        disabled={mutation.isPending}
                                    />
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
                                    <input
                                        type="checkbox"
                                        checked={allowComments}
                                        onChange={(e) => handleToggle('allowComments', e.target.checked)}
                                        className="sr-only peer"
                                        disabled={mutation.isPending}
                                    />
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
                                    <input
                                        type="checkbox"
                                        checked={showActivity}
                                        onChange={(e) => handleToggle('showActivity', e.target.checked)}
                                        className="sr-only peer"
                                        disabled={mutation.isPending}
                                    />
                                    <div className="w-14 h-8 bg-white/5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/20 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-white/20 peer-checked:after:bg-black"></div>
                                </label>
                            </div>
                        </div>

                        {feedback && (
                            <div className={`p-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest animate-scale-in ${feedback.type === 'success' ? 'bg-neon-purple/20 text-neon-purple' : 'bg-red-500/20 text-red-500'
                                }`}>
                                {feedback.message}
                            </div>
                        )}

                        {mutation.isPending && (
                            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                                <Loader2 size={14} className="animate-spin" />
                                Saving changes...
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Navbar />
        </div>
    );
};

export default Privacy;
