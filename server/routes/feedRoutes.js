import express from 'express';
import { getFeed, createPost, likePost, commentPost, searchContent, deletePost, updatePost } from '../controllers/feedController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import multer from 'multer';

const router = express.Router();

router.get('/', getFeed);
router.get('/search', searchContent);
// Wrap multer upload middleware to catch file/Cloudinary errors and respond with JSON
const uploadHandler = (req, res, next) => {
	upload.single('media')(req, res, (err) => {
		if (err) {
			console.error('Upload middleware error:', err);
			if (err instanceof multer.MulterError) {
				return res.status(400).json({ message: err.message });
			}
			return res.status(500).json({ message: err.message || 'Upload failed' });
		}
		next();
	});
};

router.post('/', protect, uploadHandler, createPost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

export default router;

