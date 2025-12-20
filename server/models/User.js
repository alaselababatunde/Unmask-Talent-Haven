import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    default: '',
    trim: true,
  },
  lastName: {
    type: String,
    default: '',
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.oauthProvider;
    },
  },
  profileImage: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500,
  },
  oauthProvider: {
    type: String,
    enum: ['google', 'github', 'facebook'],
    default: null,
  },
  oauthId: {
    type: String,
    default: null,
  },
  balance: {
    type: Number,
    default: 0,
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  followRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  achievements: [{
    type: String,
  }],
  badges: [{
    type: String,
  }],
  isVerified: {
    type: Boolean,
    default: false,
  },
  isLive: {
    type: Boolean,
    default: false,
  },
  settings: {
    isPrivate: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
    showActivity: { type: Boolean, default: true },
    notifications: {
      newFollowers: { type: Boolean, default: true },
      newComments: { type: Boolean, default: true },
      newLikes: { type: Boolean, default: true },
      donations: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
    }
  }
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);

