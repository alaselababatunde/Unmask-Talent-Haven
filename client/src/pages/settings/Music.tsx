import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Music } from 'lucide-react';

const MusicSettings = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-matte-black pb-24">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate('/settings')} className="text-accent-beige hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-accent-beige">Music</h1>
                </div>

                <div className="bg-white/5 rounded-2xl p-8 text-center border border-white/10">
                    <div className="w-16 h-16 bg-deep-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Music size={32} className="text-deep-purple" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Music Preferences</h2>
                    <p className="text-accent-beige/60">Manage your saved sounds and music settings.</p>
                    <div className="mt-6 p-4 bg-black/40 rounded-xl border border-white/5 text-sm text-accent-beige/40">
                        Coming Soon
                    </div>
                </div>
            </div>
            <Navbar />
        </div>
    );
};

export default MusicSettings;
