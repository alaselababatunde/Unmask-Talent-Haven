import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { Users, DollarSign, Heart, MessageSquare, Trophy } from 'lucide-react';

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

  const handleSendThankYou = (supporterId: string) => {
    // Navigate to chat - in a real implementation, this would open a chat with the supporter
    navigate('/chat');
    // Show a message that the feature is coming or navigate to chat
    setTimeout(() => {
      alert('Thank you message feature coming soon! For now, you can message supporters from the Chat page.');
    }, 100);
  };

  const totalAmount = supporters.reduce((sum, s) => sum + s.totalAmount, 0);
  const topSupporter = supporters[0];

  return (
    <div className="min-h-screen bg-matte-black pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-deep-purple/20 rounded-full glow-purple">
            <Users className="text-deep-purple" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-accent-beige">Your Supporters</h1>
            <p className="text-accent-beige/60 text-sm">People who believe in your talent</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="gradient-purple-brown p-6 rounded-2xl glow-purple">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-accent-beige" size={32} />
              <span className="text-accent-beige/60 text-sm">Total</span>
            </div>
            <p className="text-3xl font-bold text-accent-beige">{supporters.length}</p>
            <p className="text-accent-beige/80 text-sm mt-1">Supporters</p>
          </div>

          <div className="bg-matte-black border border-deep-purple/30 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="text-deep-purple" size={32} />
              <span className="text-accent-beige/60 text-sm">Total</span>
            </div>
            <p className="text-3xl font-bold text-accent-beige">${totalAmount.toFixed(2)}</p>
            <p className="text-accent-beige/80 text-sm mt-1">Donated</p>
          </div>

          {topSupporter && (
            <div className="bg-matte-black border border-deep-purple/30 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <Trophy className="text-deep-purple" size={32} />
                <span className="text-accent-beige/60 text-sm">Top</span>
              </div>
              <p className="text-xl font-bold text-accent-beige truncate">{topSupporter.user.username}</p>
              <p className="text-accent-beige/80 text-sm mt-1">${topSupporter.totalAmount.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Supporters List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-accent-beige/60">Loading supporters...</p>
          </div>
        ) : supporters.length === 0 ? (
          <div className="text-center py-12 bg-matte-black border border-deep-purple/30 rounded-2xl">
            <Users className="mx-auto mb-4 text-accent-beige/40" size={48} />
            <p className="text-accent-beige/60">No supporters yet</p>
            <p className="text-accent-beige/40 text-sm mt-2">Keep sharing your talent!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {supporters.map((supporter, index) => (
              <div
                key={supporter.user._id}
                className="bg-matte-black border border-deep-purple/30 rounded-2xl p-6 hover:border-deep-purple transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-deep-purple/30 flex items-center justify-center overflow-hidden border-2 border-deep-purple">
                      {supporter.user.profileImage ? (
                        <img
                          src={supporter.user.profileImage}
                          alt={supporter.user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-deep-purple text-xl font-bold">
                          {supporter.user.username[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-accent-beige">{supporter.user.username}</h3>
                        {index === 0 && (
                          <Trophy className="text-deep-purple" size={20} />
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <DollarSign className="text-deep-purple" size={16} />
                          <span className="text-accent-beige font-semibold">
                            ${supporter.totalAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="text-deep-purple" size={16} />
                          <span className="text-accent-beige/60 text-sm">
                            {supporter.donations.length} {supporter.donations.length === 1 ? 'donation' : 'donations'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Donations */}
                <div className="space-y-2 pt-4 border-t border-deep-purple/10">
                  {supporter.donations.map((donation, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between p-3 bg-matte-black border border-deep-purple/10 rounded-2xl"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="text-deep-purple" size={14} />
                          <span className="text-accent-beige font-semibold">${donation.amount.toFixed(2)}</span>
                        </div>
                        {donation.message && (
                          <div className="flex items-start gap-2 mt-2">
                            <MessageSquare className="text-deep-purple mt-0.5" size={14} />
                            <p className="text-accent-beige/70 text-sm">{donation.message}</p>
                          </div>
                        )}
                        <p className="text-accent-beige/40 text-xs mt-2">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Send Thank You Button */}
                <button 
                  onClick={() => handleSendThankYou(supporter.user._id)}
                  className="mt-4 w-full py-3 bg-deep-purple/20 hover:bg-deep-purple/30 border border-deep-purple/30 hover:border-deep-purple text-accent-beige rounded-2xl font-semibold transition-all"
                >
                  Send Thank You
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Navbar />
    </div>
  );
};

export default Supporters;

