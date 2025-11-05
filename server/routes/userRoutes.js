import express from 'express';
import { getUser, updateUser, setLiveStatus } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/:id', getUser);
router.put('/:id', protect, upload.single('profileImage'), updateUser);
router.put('/:id/live', protect, setLiveStatus);

export default router;

