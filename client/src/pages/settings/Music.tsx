import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Music, Volume2, Radio } from 'lucide-react';

const MusicSettings = () => {
  const navigate = useNavigate();
  const [autoplay, setAutoplay] = useState(true);
  const [quality, setQuality] = useState('high');

  return (
    <div className="min-h-screen bg-matte-black pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/settings')} className="text-accent-beige hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-accent-beige">Music</h1>
        </div>

        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-deep-purple/20 rounded-lg text-deep-purple">
                <Radio size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold">Autoplay</h3>
                <p className="text-accent-beige/60 text-sm">Automatically play next track</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={autoplay} onChange={(e) => setAutoplay(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-deep-purple"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-deep-purple/20 rounded-lg text-deep-purple">
                <Volume2 size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold">Audio Quality</h3>
                <p className="text-accent-beige/60 text-sm">Streaming quality</p>
              </div>
            </div>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-deep-purple"
            >
              <option value="low">Data Saver</option>
              <option value="normal">Normal</option>
              <option value="high">High Quality</option>
            </select>
          </div>
        </div>
      </div>
      <Navbar />
    </div>
  );
};

export default MusicSettings;
