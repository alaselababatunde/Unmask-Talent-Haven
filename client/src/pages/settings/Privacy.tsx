import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, MessageCircle, Users } from 'lucide-react';

const Privacy = () => {
    const navigate = useNavigate();
    const [isPrivate, setIsPrivate] = useState(false);
    const [allowComments, setAllowComments] = useState(true);
    const [showActivity, setShowActivity] = useState(true);

    return (
        <div className="min-h-screen bg-matte-black pb-24">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => navigate('/settings')} className="text-accent-beige hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-accent-beige">Privacy</h1>
                </div>

                <div className="space-y-6">
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-deep-purple/20 rounded-lg text-deep-purple">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">Private Account</h3>
                                    <p className="text-accent-beige/60 text-sm">Only followers can see your posts</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-deep-purple"></div>
                            </label>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-deep-purple/20 rounded-lg text-deep-purple">
                                    <MessageCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">Allow Comments</h3>
                                    <p className="text-accent-beige/60 text-sm">Let people comment on your posts</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-deep-purple"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-deep-purple/20 rounded-lg text-deep-purple">
                                    <Eye size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">Activity Status</h3>
                                    <p className="text-accent-beige/60 text-sm">Show when you're active</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={showActivity} onChange={(e) => setShowActivity(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-deep-purple"></div>
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
