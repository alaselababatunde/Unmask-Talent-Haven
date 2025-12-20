import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { Users, DollarSign, Heart, MessageSquare, Trophy, ArrowLeft } from 'lucide-react';

interface Supporter {
  user: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  totalAmount: number;
  donations: Array<{
    amount: number;
    message?: string;
    postId: string;
    createdAt: string;
  }>;
}

const Supporters = () => {
  const navigate = useNavigate();
  const { data: supporters = [], isLoading } = useQuery<Supporter[]>({
    queryKey: ['supporters'],
    queryFn: async () => {
      const response = await api.get('/balance/supporters');
      return response.data;
    },
  });

  const handleSendThankYou = (_supporterId: string) => {
    navigate('/chat');
    setTimeout(() => {
      alert('Thank you message feature coming soon! For now, you can message supporters from the Chat page.');
    }, 100);
  };

  const totalAmount = supporters.reduce((sum, s) => sum + s.totalAmount, 0);
  const topSupporter = supporters[0];

  return (
    <div className="h-[100dvh] w-full bg-primary flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 glass-button rounded-full text-white/40 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold font-display tracking-tight">Supporters</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent opacity-50" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <Users className="text-neon-purple" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Community</span>
              </div>
              <p className="text-4xl font-bold font-display">{supporters.length}</p>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-transparent opacity-50" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="text-neon-blue" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Support</span>
              </div>
              <p className="text-4xl font-bold font-display">${totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {topSupporter && (
            <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="text-yellow-500" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Top Supporter</span>
                </div>
                <p className="text-xl font-bold truncate">{topSupporter.user.username}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">${topSupporter.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Supporters List */}
        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/20 ml-2">All Supporters</h2>

          {isLoading ? (
            <div className="text-center py-20 opacity-20">
              <div className="w-10 h-10 border-4 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold">Loading community...</p>
            </div>
          ) : supporters.length === 0 ? (
            <div className="glass-panel p-16 rounded-[3rem] border-white/5 text-center">
              <Users className="mx-auto mb-6 text-white/10" size={64} />
              <p className="text-lg font-bold mb-2">No supporters yet</p>
              <p className="text-sm text-white/40">Keep sharing your talent to grow your community!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {supporters.map((supporter, index) => (
                <div
                  key={supporter.user._id}
                  className="glass-panel p-6 rounded-[3rem] border-white/5 hover:bg-white/5 transition-all group animate-scale-in"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary p-1 border border-white/10">
                        <div className="w-full h-full rounded-full overflow-hidden">
                          {supporter.user.profileImage ? (
                            <img src={supporter.user.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-obsidian text-neon-purple font-bold text-xl">
                              {supporter.user.username[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold">{supporter.user.username}</h3>
                          {index === 0 && <Trophy className="text-yellow-500" size={16} />}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <DollarSign className="text-neon-blue" size={12} />
                            <span className="text-xs font-bold">${supporter.totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="text-neon-purple" size={12} />
                            <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                              {supporter.donations.length} {supporter.donations.length === 1 ? 'Support' : 'Supports'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendThankYou(supporter.user._id)}
                      className="p-4 glass-button rounded-full text-neon-purple hover:bg-neon-purple hover:text-black transition-all"
                    >
                      <MessageSquare size={20} />
                    </button>
                  </div>

                  {/* Recent Donations */}
                  <div className="space-y-2 px-2">
                    {supporter.donations.slice(0, 2).map((donation, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-neon-blue rounded-full" />
                          <p className="text-xs text-white/60 italic">"{donation.message || 'Sent support'}"</p>
                        </div>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default Supporters;