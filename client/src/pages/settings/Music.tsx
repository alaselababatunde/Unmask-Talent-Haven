import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Radio } from 'lucide-react';

const MusicSettings = () => {
  const navigate = useNavigate();
  const [autoplay, setAutoplay] = useState(true);
  const [quality, setQuality] = useState('high');

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
          <h1 className="text-3xl font-bold font-display tracking-tight">Music</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar relative z-10">
        <div className="glass-panel p-8 rounded-[3rem] border-white/5 space-y-10 animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-neon-purple/10 flex items-center justify-center">
                <Radio className="text-neon-purple" size={24} />
              </div>
              <div>
                <h3 className="font-bold">Autoplay</h3>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Play next track automatically</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer group">
              <input type="checkbox" checked={autoplay} onChange={(e) => setAutoplay(e.target.checked)} className="sr-only peer" />
              <div className="w-14 h-8 bg-white/5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/20 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-neon-purple peer-checked:after:bg-black peer-checked:after:shadow-lg peer-checked:after:shadow-neon-purple/50"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 flex items-center justify-center">
                <Volume2 className="text-neon-blue" size={24} />
              </div>
              <div>
                <h3 className="font-bold">Audio Quality</h3>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Streaming fidelity</p>
              </div>
            </div>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="bg-obsidian/60 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-neon-blue transition-all appearance-none cursor-pointer"
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
