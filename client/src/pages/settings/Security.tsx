import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Smartphone } from 'lucide-react';

const Security = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

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
                            <button className="w-full py-5 bg-neon-purple text-black rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-neon-purple/20 active:scale-95 transition-all">
                                Update Password
                            </button>
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
                            <button className="px-6 py-3 glass-button rounded-full text-xs font-black uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all">
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
