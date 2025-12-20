import User from '../models/User.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username profileImage')
      .populate('following', 'username profileImage');
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

export const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.user._id;

    if (userId.toString() === targetId.toString()) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const target = await User.findById(targetId);
    const user = await User.findById(userId);

    if (!target || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (target.followers.includes(userId)) {
      return res.status(400).json({ message: 'Already following' });
    }

    if (target.settings?.isPrivate) {
      if (target.followRequests.includes(userId)) {
        return res.status(400).json({ message: 'Follow request already sent' });
      }
      target.followRequests.push(userId);
      await target.save();

      // create notification
      try {
        const notif = await Notification.create({
          user: target._id,
          from: user._id,
          type: 'follow_request',
          message: `${user.username} requested to follow you`,
        });
        const io = req.app.get('io');
        if (io) io.to(`user:${target._id}`).emit('notification', notif);
      } catch (e) {
        console.error('Notification error', e.message || e);
      }

      return res.json({ message: 'Follow request sent' });
    }

    target.followers.push(userId);
    user.following.push(targetId);

    await target.save();
    await user.save();

    // create notification
    try {
      const notif = await Notification.create({
        user: target._id,
        from: user._id,
        type: 'follow',
        message: `${user.username} started following you`,
      });
      // emit to target's personal room if io available
      const io = req.app.get('io');
      if (io) io.to(`user:${target._id}`).emit('notification', notif);
    } catch (e) {
      // ignore notification errors
      console.error('Notification error', e.message || e);
    }

    res.json({ message: 'Followed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptFollowRequest = async (req, res) => {
  try {
    const requesterId = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.followRequests.includes(requesterId)) {
      return res.status(400).json({ message: 'No follow request found' });
    }

    // Remove from requests
    user.followRequests = user.followRequests.filter(id => id.toString() !== requesterId.toString());

    // Add to followers/following
    user.followers.push(requesterId);
    requester.following.push(userId);

    await user.save();
    await requester.save();

    // create notification
    try {
      const notif = await Notification.create({
        user: requester._id,
        from: user._id,
        type: 'follow_accept',
        message: `${user.username} accepted your follow request`,
      });
      const io = req.app.get('io');
      if (io) io.to(`user:${requester._id}`).emit('notification', notif);
    } catch (e) {
      console.error('Notification error', e.message || e);
    }

    res.json({ message: 'Follow request accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const declineFollowRequest = async (req, res) => {
  try {
    const requesterId = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.followRequests = user.followRequests.filter(id => id.toString() !== requesterId.toString());
    await user.save();

    res.json({ message: 'Follow request declined' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.user._id;

    if (userId.toString() === targetId.toString()) {
      return res.status(400).json({ message: "You can't unfollow yourself" });
    }

    const target = await User.findById(targetId);
    const user = await User.findById(userId);

    if (!target || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    target.followers = target.followers.filter(f => f.toString() !== userId.toString());
    user.following = user.following.filter(f => f.toString() !== targetId.toString());

    await target.save();
    await user.save();

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username profileImage');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ followers: user.followers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username profileImage');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ following: user.following });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

