import express from 'express';
import { getUser, updateUser, setLiveStatus, followUser, unfollowUser, getFollowers, getFollowing, acceptFollowRequest, declineFollowRequest } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/:id', getUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);
router.put('/:id', protect, upload.single('profileImage'), updateUser);
router.put('/:id/live', protect, setLiveStatus);
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);
router.post('/follow-request/:id/accept', protect, acceptFollowRequest);
router.post('/follow-request/:id/decline', protect, declineFollowRequest);

export default router;

