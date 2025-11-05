import User from '../models/User.js';
import Post from '../models/Post.js';

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });

    res.json({
      user,
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, username, bio } = req.body;
    const userId = req.params.id;

    if (userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const update = {
      username,
      bio,
    };
    if (typeof firstName !== 'undefined') update.firstName = firstName;
    if (typeof lastName !== 'undefined') update.lastName = lastName;
    if (req.file && req.file.path) update.profileImage = req.file.path;

    const user = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true }).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setLiveStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { isLive } = req.body;
    const user = await User.findByIdAndUpdate(userId, { isLive: Boolean(isLive) }, { new: true }).select('-password');
    res.json({ isLive: user.isLive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

