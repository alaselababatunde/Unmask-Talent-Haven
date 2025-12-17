import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mediaType: {
    type: String,
    enum: ['video', 'audio', 'text', 'sign-language', 'image'],
    required: true,
  },
  mediaUrl: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    default: '',
  },
  caption: {
    type: String,
    maxlength: 1000,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  category: {
    type: String,
    enum: ['Dance', 'Music', 'Art', 'Acting', 'Poetry', 'Comedy', 'Other'],
    default: 'Other',
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  views: {
    type: Number,
    default: 0,
  },
  donations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      maxlength: 200,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

export default mongoose.model('Post', postSchema);

