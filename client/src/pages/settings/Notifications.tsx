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
        <div className="min-h-screen bg-matte-black pb-24">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => navigate('/settings')} className="text-accent-beige hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-accent-beige">Notifications</h1>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-deep-purple/20 rounded-lg text-deep-purple">
                                <Heart size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">Likes</h3>
                                <p className="text-accent-beige/60 text-sm">Notify when someone likes your post</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={likes} onChange={(e) => setLikes(e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-deep-purple"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-deep-purple/20 rounded-lg text-deep-purple">
                                <MessageCircle size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">Comments</h3>
                                <p className="text-accent-beige/60 text-sm">Notify when someone comments</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={comments} onChange={(e) => setComments(e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-deep-purple"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-deep-purple/20 rounded-lg text-deep-purple">
                                <UserPlus size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">New Followers</h3>
                                <p className="text-accent-beige/60 text-sm">Notify when someone follows you</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={follows} onChange={(e) => setFollows(e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-deep-purple"></div>
                        </label>
                    </div>
                </div>
            </div>
            <Navbar />
        </div>
    );
};

export default Notifications;
