import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { // recipient
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  from: { // actor
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  type: {
    type: String,
    enum: ['follow', 'comment', 'donation', 'like', 'system'],
    default: 'system',
  },
  message: {
    type: String,
    default: '',
  },
  read: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
