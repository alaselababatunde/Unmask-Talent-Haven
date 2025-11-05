import Post from '../models/Post.js';

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

export const createPost = async (req, res) => {
  try {
    const { caption, tags, category, mediaType } = req.body;
    let mediaUrl = req.file ? req.file.path : req.body.mediaUrl;

    // For text posts, use the text content as mediaUrl
    if (mediaType === 'text' && req.body.mediaUrl) {
      mediaUrl = req.body.mediaUrl;
    }

    if (!mediaUrl) {
      return res.status(400).json({ message: 'Media URL or content is required' });
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
    res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only allow one like per user - if already liked, return unchanged
    if (post.likes.includes(req.user._id)) {
      return res.json(post);
    }

    post.likes.push(req.user._id);
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

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      text,
    });

    await post.save();
    await post.populate('comments.user', 'username profileImage');

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
    const posts = await Post.find({
      $or: [
        { caption: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
    })
      .populate('user', '_id username profileImage isLive')
      .limit(10);
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

