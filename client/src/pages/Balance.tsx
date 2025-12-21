import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import { Wallet, TrendingUp, Users, DollarSign, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BalanceData {
  balance: number;
  donations: Array<{
    amount: number;
    message?: string;
    postId: string;
    postCaption: string;
    createdAt: string;
    user: string;
  }>;
  totalEarnings: number;
}

const Balance = () => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const navigate = useNavigate();

  const { data, refetch } = useQuery<BalanceData>({
    queryKey: ['balance'],
    queryFn: async () => {
      const response = await api.get('/balance');
      return response.data;
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async ({ amount, accountDetails }: { amount: number; accountDetails: string }) => {
      const response = await api.post('/balance/withdraw', { amount, accountDetails });
      return response.data;
    },
    onSuccess: () => {
      setShowWithdraw(false);
      setWithdrawAmount('');
      setAccountDetails('');
      refetch();
    },
  });

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= (data?.balance || 0)) {
      withdrawMutation.mutate({ amount, accountDetails });
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-primary flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Fixed Glassy Header */}
      <div className="sticky top-0 z-[100] bg-primary/40 backdrop-blur-xl border-b border-white/5 px-6 pt-12 pb-6">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-3 glass-button rounded-full text-white/40 hover:text-white transition-all active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold font-display tracking-tight">Wallet</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar relative z-10">
        {/* Main Balance Card */}
        <div className="glass-panel p-8 rounded-[3rem] border-white/5 mb-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Current Balance</span>
              <Wallet className="text-neon-purple" size={24} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold font-display tracking-tighter">₦{data?.balance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
              <span className="text-neon-blue text-xs font-black uppercase tracking-widest">NGN</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="glass-panel p-6 rounded-[2rem] border-white/5">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-neon-blue" size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Total</span>
            </div>
            <p className="text-xl font-bold">₦{data?.totalEarnings.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
          </div>
          <div className="glass-panel p-6 rounded-[2rem] border-white/5">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-neon-purple" size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Supporters</span>
            </div>
            <p className="text-xl font-bold">{data?.donations.length || 0}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-10">
          <button
            onClick={() => setShowWithdraw(!showWithdraw)}
            className="flex-1 py-5 bg-neon-purple text-black rounded-[2rem] font-bold text-sm shadow-xl shadow-neon-purple/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <DollarSign size={18} />
            Withdraw
          </button>
          <button
            onClick={() => navigate('/supporters')}
            className="flex-1 py-5 glass-button rounded-[2rem] text-white font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Users size={18} />
            Supporters
          </button>
        </div>

        {/* Withdraw Form */}
        {showWithdraw && (
          <div className="glass-panel p-8 rounded-[3rem] border-white/10 mb-10 animate-scale-in">
            <h2 className="text-xl font-bold mb-6">Withdraw Funds</h2>
            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest ml-4">Amount</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full p-5 bg-obsidian/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-neon-purple transition-all placeholder:text-white/10"
                  placeholder="₦0.00"
                  min="0"
                  max={data?.balance || 0}
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest ml-4">Account Details</label>
                <textarea
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full p-5 bg-obsidian/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-neon-purple transition-all placeholder:text-white/10 resize-none"
                  placeholder="PayPal, Bank, or Crypto Address"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={withdrawMutation.isPending}
                  className="flex-1 py-4 bg-neon-purple text-black rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-neon-purple/20 disabled:opacity-50"
                >
                  {withdrawMutation.isPending ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 py-4 glass-button rounded-2xl font-bold text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Donation History */}
        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/20 ml-2">Recent Activity</h2>
          {data?.donations.length === 0 ? (
            <div className="glass-panel p-10 rounded-[2rem] border-white/5 text-center">
              <p className="text-white/20 text-sm font-bold">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.donations.map((donation, index) => (
                <div
                  key={index}
                  className="glass-panel p-5 rounded-[2rem] border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-neon-purple/10 flex items-center justify-center">
                      <DollarSign className="text-neon-purple" size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">Received Support</span>
                        <span className="text-[10px] text-neon-blue font-black uppercase tracking-widest">+₦{donation.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
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

export default Balance;

