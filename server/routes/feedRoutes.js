import express from 'express';
import { getFeed, createPost, likePost, commentPost, searchContent, deletePost, updatePost } from '../controllers/feedController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', getFeed);
router.get('/search', searchContent);
router.post('/', protect, upload.single('media'), createPost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

export default router;

