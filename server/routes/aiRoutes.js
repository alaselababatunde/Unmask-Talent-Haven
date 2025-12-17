import express from 'express';
import { generateImage } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', protect, generateImage);

export default router;
