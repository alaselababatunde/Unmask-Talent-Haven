import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Smartphone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '../../api';

const Security = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const passwordMutation = useMutation({
        mutationFn: async () => {
            if (!currentPassword || !newPassword) throw new Error('Please fill all fields');
            const response = await api.post('/auth/change-password', { currentPassword, newPassword });
            return response.data;
        },
        onSuccess: () => {
            setFeedback({ type: 'success', message: 'Password updated successfully' });
            setCurrentPassword('');
            setNewPassword('');
            setTimeout(() => setFeedback(null), 5000);
        },
        onError: (error: any) => {
            setFeedback({ type: 'error', message: error.response?.data?.message || error.message || 'Failed to update password' });
            setTimeout(() => setFeedback(null), 5000);
        }
    });

    const handle2FA = () => {
        setFeedback({ type: 'error', message: 'Two-Factor Authentication is coming soon!' });
        setTimeout(() => setFeedback(null), 3000);
    };

    return (
        <div className="h-[100dvh] w-full bg-primary flex flex-col relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Fixed Glassy Header */}
            <div className="sticky top-0 z-[100] bg-primary/40 backdrop-blur-xl border-b border-white/5 px-6 pt-12 pb-6">
                <div className="flex items-center gap-4 max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/settings')}
                        className="p-3 glass-button rounded-full text-white/40 hover:text-white transition-all active:scale-90"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold font-display tracking-tight">Security</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar relative z-10">
                <div className="space-y-6">
                    <div className="glass-panel p-8 rounded-[3rem] border-white/5 animate-scale-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-neon-purple/10 flex items-center justify-center">
                                <Key className="text-neon-purple" size={24} />
                            </div>
                            <h3 className="font-bold">Change Password</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest ml-4">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full p-5 bg-obsidian/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-neon-purple transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest ml-4">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-5 bg-obsidian/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-neon-purple transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                onClick={() => passwordMutation.mutate()}
                                disabled={passwordMutation.isPending}
                                className="w-full py-5 bg-neon-purple text-black rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-neon-purple/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                            >
                                {passwordMutation.isPending ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Updating...
                                    </>
                                ) : 'Update Password'}
                            </button>

                            {feedback && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-scale-in ${feedback.type === 'success' ? 'bg-neon-purple/20 text-neon-purple' : 'bg-red-500/20 text-red-500'
                                    }`}>
                                    {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    {feedback.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-panel p-8 rounded-[3rem] border-white/5 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 flex items-center justify-center">
                                    <Smartphone className="text-neon-blue" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Two-Factor Auth</h3>
                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Extra layer of security</p>
                                </div>
                            </div>
                            <button
                                onClick={handle2FA}
                                className="px-6 py-3 glass-button rounded-full text-xs font-black uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all"
                            >
                                Enable
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Navbar />
        </div>
    );
};

export default Security;
