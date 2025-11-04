import express from 'express';
import { getBalance, withdraw, getSupporters } from '../controllers/balanceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getBalance);
router.post('/withdraw', protect, withdraw);
router.get('/supporters', protect, getSupporters);

export default router;

