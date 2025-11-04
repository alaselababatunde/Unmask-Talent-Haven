import express from 'express';
import { getFeed, createPost, likePost, commentPost } from '../controllers/feedController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', getFeed);
router.post('/', protect, (req, res, next) => {
  // Only use multer for non-text posts
  if (req.body.mediaType === 'text') {
    return next();
  }
  upload.single('media')(req, res, next);
}, createPost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentPost);

export default router;

