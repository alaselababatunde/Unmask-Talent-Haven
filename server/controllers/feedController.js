import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Smart recommendation algorithm
export const getRecommendedFeed = async (req, res) => {
  try {
    const userId = req.user?._id;
    const filter = { isArchived: false };
    if (req.query.mediaType) {
      filter.mediaType = req.query.mediaType;
    }

    let recommendedPosts = [];

    if (userId) {
      // Get user data for personalization
      const user = await User.findById(userId).populate('following', '_id').lean();
      if (!user) return res.status(404).json({ message: 'User not found' });

      // 1. Posts from followed users (60% weight)
      const followingIds = user.following.map(f => f._id);
      const followedPosts = await Post.find({ ...filter, user: { $in: followingIds } })
        .populate('user', '_id username profileImage isLive')
        .sort({ createdAt: -1 })
        .limit(12)
        .lean();

      // 2. Get user's liked posts to find favorite tags
      const userLikedPosts = await Post.find({ likes: userId }).select('tags').limit(50).lean();
      const tagCounts = {};
      userLikedPosts.forEach(post => {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      const favoriteTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);

      // 3. Trending posts with favorite tags (30% weight)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      let trendingPosts = [];
      if (favoriteTags.length > 0) {
        trendingPosts = await Post.find({
          ...filter,
          tags: { $in: favoriteTags },
          createdAt: { $gte: oneDayAgo },
          user: { $ne: userId }
        })
          .populate('user', '_id username profileImage isLive')
          .lean();

        trendingPosts = trendingPosts
          .map(post => ({ ...post, score: (post.likes?.length || 0) * 2 + (post.comments?.length || 0) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 6);
      }

      // 4. Discover new content (10% weight)
      const discoverPosts = await Post.find({
        ...filter,
        user: { $nin: [...followingIds, userId] },
        createdAt: { $gte: oneDayAgo }
      })
        .populate('user', '_id username profileImage isLive')
        .lean();

      const scoredDiscoverPosts = discoverPosts
        .map(post => ({ ...post, score: (post.likes?.length || 0) * 2 + (post.comments?.length || 0) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

      // Merge and remove duplicates
      recommendedPosts = [...followedPosts, ...trendingPosts, ...scoredDiscoverPosts];
      const seen = new Set();
      recommendedPosts = recommendedPosts
        .filter(post => {
          if (seen.has(post._id.toString())) return false;
          seen.add(post._id.toString());
          return true;
        })
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);

    } else {
      // Not logged in - show trending
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const trendingPosts = await Post.find({ ...filter, createdAt: { $gte: oneDayAgo } })
        .populate('user', '_id username profileImage isLive')
        .lean();

      recommendedPosts = trendingPosts
        .map(post => ({ ...post, score: (post.likes?.length || 0) * 2 + (post.comments?.length || 0) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
    }

    console.log(`Recommended ${recommendedPosts.length} posts for user ${userId || 'anonymous'}`);
    res.json(recommendedPosts);
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getFollowingFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('following').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const followingIds = user.following;
    const filter = {
      isArchived: false,
      user: { $in: followingIds }
    };

    if (req.query.mediaType) {
      filter.mediaType = req.query.mediaType;
    }

    const posts = await Post.find(filter)
      .populate('user', '_id username profileImage isLive')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeed = async (req, res) => {
  try {
    const filter = { isArchived: false };
    if (req.query.mediaType) {
      filter.mediaType = req.query.mediaType;
    }

    console.log('getFeed filter:', filter);
    const posts = await Post.find(filter)
      .populate('user', '_id username profileImage isLive')
      .sort({ createdAt: -1 })
      .limit(20);
    console.log(`getFeed found ${posts.length} posts`);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSinglePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', '_id username profileImage isLive')
      .populate('comments.user', 'username profileImage');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    console.log('createPost request body:', { body: req.body, file: req.file ? { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size } : null, user: req.user ? req.user._id : null });
    const { caption, tags, category, mediaType } = req.body;

    // Validate media type
    const validMediaTypes = ['video', 'audio', 'text', 'sign-language', 'image'];
    if (!validMediaTypes.includes(mediaType)) {
      return res.status(400).json({ message: 'Invalid media type' });
    }

    // Support a few possible properties Multer/Cloudinary storage might return
    let mediaUrl = req.file ? (req.file.path || req.file.url || req.file.secure_url || req.file.filename) : req.body.mediaUrl;

    // Generate thumbnail for videos
    let thumbnail = '';
    if (req.file && (mediaType === 'video' || mediaType === 'sign-language')) {
      // Cloudinary auto-generates thumbnails for videos
      // We can get the thumbnail by replacing the file extension with .jpg and adding transformation
      const publicId = req.file.filename || req.file.path?.split('/').pop()?.split('.')[0];
      if (publicId) {
        // Generate thumbnail URL: first frame as JPG
        thumbnail = mediaUrl.replace(/\.(mp4|webm|mov|avi|mkv)$/, '.jpg');
      }
    }

    // For text posts, use the text content as mediaUrl
    if (mediaType === 'text' && req.body.mediaUrl) {
      mediaUrl = req.body.mediaUrl;
      if (!mediaUrl || mediaUrl.trim().length === 0) {
        return res.status(400).json({ message: 'Text content is required for text posts' });
      }
    } else if (mediaType !== 'text') {
      // For media uploads, ensure we have a file
      if (!mediaUrl) {
        return res.status(400).json({
          message: 'Media file is required',
          details: req.file ? 'File upload failed' : 'No file provided'
        });
      }

      // Validate file size on backend (should have been caught by multer, but double check)
      if (req.file) {
        const maxSize = (mediaType === 'video' || mediaType === 'sign-language')
          ? 100 * 1024 * 1024  // 100MB
          : 50 * 1024 * 1024;  // 50MB

        if (req.file.size > maxSize) {
          return res.status(400).json({
            message: `File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
          });
        }
      }
    }

    const post = await Post.create({
      user: req.user._id,
      mediaType: mediaType || 'video',
      mediaUrl,
      thumbnail: thumbnail || '',
      caption: mediaType === 'text' ? mediaUrl : (caption || ''),
      tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
      category: category || 'Other',
    });

    await post.populate('user', '_id username profileImage');

    res.status(201).json(post);
  } catch (error) {
    console.error('Upload error:', error);

    // Provide user-friendly error messages
    if (error.message.includes('File type')) {
      return res.status(400).json({ message: 'Invalid file type. Please upload a valid video or audio file.', details: error.code || error.name || error.message });
    }

    if (error.message.includes('size')) {
      return res.status(400).json({ message: 'File is too large. Please upload a smaller file.', details: error.code || error.name || error.message });
    }

    if (error.message.includes('Cloudinary') || error.message.includes('cloud') || error.http_code === 400) {
      console.error('Cloudinary Error Details:', JSON.stringify(error, null, 2));
      return res.status(500).json({
        message: 'Video storage configuration error or upload failed.',
        details: {
          message: error.message,
          http_code: error.http_code,
          name: error.name,
          ...error
        }
      });
    }

    res.status(500).json({
      message: error.message,
      details: {
        code: error.code,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', '_id username');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id.toString();
    const likeIndex = post.likes.findIndex(id => id.toString() === userId);

    console.log(`[Like Debug] Post: ${post._id}, User: ${userId}, LikeIndex: ${likeIndex}, CurrentLikes: ${post.likes.length}`);

    if (likeIndex === -1) {
      // Like
      post.likes.push(req.user._id);
      console.log(`[Like Debug] Added like for user ${userId}`);

      // Create and emit notification if liker is not the post owner
      if (post.user._id.toString() !== userId) {
        const notification = await Notification.create({
          user: post.user._id,
          from: req.user._id,
          type: 'like',
          message: `${req.user.username} liked your post`,
        });

        // Emit notification via socket
        const app = req.app || global.app;
        const io = app.get ? app.get('io') : null;
        if (io) {
          io.to(`user:${post.user._id}`).emit('notification', notification);
        }
      }
    } else {
      // Unlike
      post.likes.splice(likeIndex, 1);
      console.log(`[Like Debug] Removed like for user ${userId}`);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error('[Like Error]', error);
    res.status(500).json({ message: error.message });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id).populate('user', '_id username');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      text,
    });

    await post.save();
    await post.populate('comments.user', 'username profileImage');

    // Create and emit notification if commenter is not the post owner
    if (post.user._id.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        user: post.user._id,
        from: req.user._id,
        type: 'comment',
        message: `${req.user.username} commented: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
      });

      // Emit notification via socket
      const app = req.app || global.app;
      const io = app.get ? app.get('io') : null;
      if (io) {
        io.to(`user:${post.user._id}`).emit('notification', notification);
      }
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchContent = async (req, res) => {
  try {
    const { q, onlyMine } = req.query;
    const currentUserId = req.user?._id;

    if (!q || !q.trim()) {
      return res.json({ users: [], posts: [] });
    }

    // Get current user's blocked list and following list
    let blockedIds = [];
    let followingIds = [];
    if (currentUserId) {
      const currentUser = await User.findById(currentUserId).select('blockedUsers following').lean();
      if (currentUser) {
        blockedIds = currentUser.blockedUsers || [];
        followingIds = currentUser.following || [];
      }
    }

    // 1. Search for Users
    let users = [];
    if (!onlyMine) {
      users = await User.find({
        $and: [
          {
            $or: [
              { username: { $regex: q, $options: 'i' } },
              { firstName: { $regex: q, $options: 'i' } },
              { lastName: { $regex: q, $options: 'i' } }
            ]
          },
          { _id: { $nin: blockedIds } }, // Exclude users blocked by current user
          { blockedUsers: { $ne: currentUserId } } // Exclude users who blocked current user
        ]
      })
        .select('_id username firstName lastName profileImage bio followers isLive settings')
        .limit(15)
        .lean();
    }

    // 2. Search for Posts
    const postFilter = {
      isArchived: false,
      $and: [
        {
          $or: [
            { caption: { $regex: q, $options: 'i' } },
            { tags: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    };

    if (onlyMine && currentUserId) {
      postFilter.user = currentUserId;
    } else {
      // If not only mine, filter by privacy and blocks
      const userIds = users.map(u => u._id);

      // Add users found by name to the search scope
      postFilter.$and[0].$or.push({ user: { $in: userIds } });

      // Exclude posts from blocked users or users who blocked us
      postFilter.user = { $nin: blockedIds };
      postFilter.$and.push({ user: { $nin: blockedIds } }); // Redundant but safe

      // Privacy logic: Only show posts from private accounts if we follow them
      // This is complex for a single query, so we'll filter after fetching or use a more complex $or
      // For now, let's fetch and then filter or use a better query
    }

    let posts = await Post.find(postFilter)
      .populate('user', '_id username profileImage isLive settings followers')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // Final filtering for privacy and blocks (in case query didn't catch everything)
    posts = posts.filter(post => {
      if (!post.user) return false;

      // Blocked check
      if (blockedIds.some(id => id.toString() === post.user._id.toString())) return false;
      if (post.user.blockedUsers?.some(id => id.toString() === currentUserId?.toString())) return false;

      // Privacy check
      if (post.user.settings?.isPrivate && post.user._id.toString() !== currentUserId?.toString()) {
        const isFollowing = followingIds.some(id => id.toString() === post.user._id.toString());
        if (!isFollowing) return false;
      }

      return true;
    });

    res.json({
      users: users.map(u => ({
        ...u,
        isFollowing: followingIds.some(id => id.toString() === u._id.toString())
      })),
      posts: posts.slice(0, 20)
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { caption, tags } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (caption !== undefined) post.caption = caption;
    if (tags !== undefined) post.tags = tags.split(',').map(t => t.trim()).filter(t => t);

    await post.save();
    await post.populate('user', '_id username profileImage isLive');
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const archivePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.isArchived = !post.isArchived;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
