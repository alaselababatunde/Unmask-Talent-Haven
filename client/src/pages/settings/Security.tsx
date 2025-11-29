import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Smartphone } from 'lucide-react';

const Security = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    return (
        <div className="min-h-screen bg-matte-black pb-24">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => navigate('/settings')} className="text-accent-beige hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-accent-beige">Security</h1>
                </div>

                <div className="space-y-6">
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-deep-purple/20 rounded-lg text-deep-purple">
                                <Key size={20} />
                            </div>
                            <h3 className="text-white font-bold">Change Password</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-accent-beige/60 text-sm mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-deep-purple"
                                />
                            </div>
                            <div>
                                <label className="block text-accent-beige/60 text-sm mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-deep-purple"
                                />
                            </div>
                            <button className="w-full py-3 bg-deep-purple text-white rounded-xl font-bold hover:bg-deep-purple/80 transition-colors">
                                Update Password
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-deep-purple/20 rounded-lg text-deep-purple">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">Two-Factor Authentication</h3>
                                    <p className="text-accent-beige/60 text-sm">Add an extra layer of security</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors">
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
