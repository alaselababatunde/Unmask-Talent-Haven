import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import { Wallet, TrendingUp, Users, DollarSign } from 'lucide-react';
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
    <div className="min-h-screen bg-matte-black pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-accent-beige">Your Balance</h1>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-matte-black border border-deep-purple/30 hover:border-deep-purple text-accent-beige rounded-2xl text-sm"
          >
            Back to Profile
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="gradient-purple-brown p-6 rounded-2xl glow-purple">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="text-accent-beige" size={32} />
              <span className="text-accent-beige/60 text-sm">Current</span>
            </div>
            <p className="text-3xl font-bold text-accent-beige">${data?.balance.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-matte-black border border-deep-purple/30 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-deep-purple" size={32} />
              <span className="text-accent-beige/60 text-sm">Total</span>
            </div>
            <p className="text-3xl font-bold text-accent-beige">${data?.totalEarnings.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-matte-black border border-deep-purple/30 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-deep-purple" size={32} />
              <span className="text-accent-beige/60 text-sm">Supporters</span>
            </div>
            <p className="text-3xl font-bold text-accent-beige">{data?.donations.length || 0}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowWithdraw(!showWithdraw)}
            className="flex-1 py-4 bg-deep-purple hover:bg-deep-purple/80 text-accent-beige rounded-2xl font-semibold transition-all glow-purple flex items-center justify-center gap-2"
          >
            <DollarSign size={20} />
            Withdraw
          </button>
          <button
            onClick={() => navigate('/supporters')}
            className="flex-1 py-4 bg-matte-black border border-deep-purple/30 hover:border-deep-purple text-accent-beige rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Users size={20} />
            View Supporters
          </button>
        </div>

        {/* Withdraw Form */}
        {showWithdraw && (
          <div className="bg-matte-black border border-deep-purple/30 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-accent-beige mb-4">Withdraw Funds</h2>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-accent-beige/80 mb-2 text-sm">Amount</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full p-4 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple focus:glow-purple"
                  placeholder="0.00"
                  min="0"
                  max={data?.balance || 0}
                  step="0.01"
                  required
                />
                <p className="text-accent-beige/60 text-xs mt-1">
                  Available: ${data?.balance.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <label className="block text-accent-beige/80 mb-2 text-sm">Account Details</label>
                <textarea
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full p-4 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple focus:glow-purple resize-none"
                  placeholder="Bank account, PayPal, or other payment details"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={withdrawMutation.isPending}
                  className="flex-1 py-3 bg-deep-purple hover:bg-deep-purple/80 text-accent-beige rounded-2xl font-semibold transition-all glow-purple disabled:opacity-50"
                >
                  {withdrawMutation.isPending ? 'Processing...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 py-3 bg-matte-black border border-deep-purple/30 hover:border-deep-purple text-accent-beige rounded-2xl font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Donation History */}
        <div className="bg-matte-black border border-deep-purple/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-accent-beige mb-6">Donation History</h2>
          {data?.donations.length === 0 ? (
            <p className="text-accent-beige/60 text-center py-8">No donations yet</p>
          ) : (
            <div className="space-y-4">
              {data?.donations.map((donation, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-matte-black border border-deep-purple/10 rounded-2xl"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="text-deep-purple" size={16} />
                      <span className="text-accent-beige font-semibold">${donation.amount.toFixed(2)}</span>
                    </div>
                    {donation.message && (
                      <p className="text-accent-beige/60 text-sm">{donation.message}</p>
                    )}
                    <p className="text-accent-beige/40 text-xs mt-1">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </p>
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

