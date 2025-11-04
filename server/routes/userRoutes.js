import express from 'express';
import { getUser, updateUser } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/:id', getUser);
router.put('/:id', protect, upload.single('profileImage'), updateUser);

export default router;

