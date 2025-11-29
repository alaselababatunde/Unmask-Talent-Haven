import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const getFeed = async (req, res) => {
  try {
    const filter = {};
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
    const validMediaTypes = ['video', 'audio', 'text', 'sign-language'];
    if (!validMediaTypes.includes(mediaType)) {
      return res.status(400).json({ message: 'Invalid media type' });
    }

    // Support a few possible properties Multer/Cloudinary storage might return
    let mediaUrl = req.file ? (req.file.path || req.file.url || req.file.secure_url || req.file.filename) : req.body.mediaUrl;

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

    const likeIndex = post.likes.findIndex(id => id.toString() === req.user._id.toString());

    if (likeIndex === -1) {
      // Like
      post.likes.push(req.user._id);

      // Create and emit notification if liker is not the post owner
      if (post.user._id.toString() !== req.user._id.toString()) {
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
    }

    await post.save();
    res.json(post);
  } catch (error) {
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
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json([]);
    }

    // Search for users matching the query
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } }
      ]
    }).select('_id');

    const userIds = users.map(user => user._id);

    // Search for posts matching caption/tags OR belonging to found users
    const posts = await Post.find({
      $or: [
        { caption: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { user: { $in: userIds } }
      ],
    })
      .populate('user', '_id username profileImage isLive')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(posts);
  } catch (error) {
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

