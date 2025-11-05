import Navbar from '../components/Navbar';
import { Radio, Users, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Live = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-matte-black pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
          <div className="p-3 bg-deep-purple/20 rounded-full glow-purple">
            <Radio className="text-deep-purple" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-accent-beige">Live Streaming</h1>
            <p className="text-accent-beige/60 text-sm">Go live and share your talent in real-time</p>
          </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-matte-black border border-deep-purple/30 hover:border-deep-purple text-accent-beige rounded-2xl text-sm"
          >
            Back to Profile
          </button>
        </div>

        <div className="bg-matte-black border border-deep-purple/30 rounded-2xl p-12 text-center">
          <Radio className="mx-auto mb-4 text-deep-purple/60" size={64} />
          <h2 className="text-2xl font-bold text-accent-beige mb-4">Coming Soon</h2>
          <p className="text-accent-beige/60 mb-8">
            Live streaming feature will be available soon. Stay tuned!
          </p>
          <div className="flex items-center justify-center gap-6 text-accent-beige/40">
            <div className="flex items-center gap-2">
              <Users size={20} />
              <span>Connect with viewers</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={20} />
              <span>Real-time interaction</span>
            </div>
          </div>
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default Live;

