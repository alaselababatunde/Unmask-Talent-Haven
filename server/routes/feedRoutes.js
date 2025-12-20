import express from 'express';
import { getFeed, getRecommendedFeed, createPost, likePost, commentPost, searchContent, deletePost, updatePost, getSinglePost, archivePost } from '../controllers/feedController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import multer from 'multer';

const router = express.Router();

router.get('/', getFeed);
router.get('/recommended', getRecommendedFeed);
router.get('/search', searchContent);
// Wrap multer upload middleware to catch file/Cloudinary errors and respond with JSON
const uploadHandler = (req, res, next) => {
	upload.single('media')(req, res, (err) => {
		if (err) {
			console.error('Upload middleware error:', err);
			if (err instanceof multer.MulterError) {
				return res.status(400).json({ message: err.message, details: err.code || null });
			}
			return res.status(500).json({ message: err.message || 'Upload failed', details: err.code || err.name || null });
		}
		next();
	});
};

router.post('/', protect, uploadHandler, createPost);
router.get('/:id', getSinglePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentPost);
router.put('/:id', protect, updatePost);
router.post('/:id/archive', protect, archivePost);
router.delete('/:id', protect, deletePost);

export default router;

