import User from '../models/User.js';
import Post from '../models/Post.js';

export const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const posts = await Post.find({ user: req.user._id });
    const allDonations = posts.flatMap(post => 
      post.donations.map(donation => ({
        ...donation.toObject(),
        postId: post._id,
        postCaption: post.caption,
      }))
    );

    res.json({
      balance: user.balance,
      donations: allDonations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      totalEarnings: allDonations.reduce((sum, d) => sum + d.amount, 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const withdraw = async (req, res) => {
  try {
    const { amount, accountDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(req.user._id);
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    user.balance -= amount;
    await user.save();

    // In production, integrate with payment gateway here
    res.json({
      message: 'Withdrawal request processed',
      newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSupporters = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id });
    const supportersMap = {};

    posts.forEach(post => {
      post.donations.forEach(donation => {
        const userId = donation.user.toString();
        if (!supportersMap[userId]) {
          supportersMap[userId] = {
            user: donation.user,
            totalAmount: 0,
            donations: [],
          };
        }
        supportersMap[userId].totalAmount += donation.amount;
        supportersMap[userId].donations.push({
          amount: donation.amount,
          message: donation.message,
          postId: post._id,
          createdAt: donation.createdAt,
        });
      });
    });

    const supporters = await Promise.all(
      Object.values(supportersMap).map(async (supporter) => {
        const user = await User.findById(supporter.user).select('username profileImage');
        return {
          user,
          totalAmount: supporter.totalAmount,
          donations: supporter.donations,
        };
      })
    );

    supporters.sort((a, b) => b.totalAmount - a.totalAmount);

    res.json(supporters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

