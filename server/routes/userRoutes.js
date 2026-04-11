import express from 'express';
import { getDevelopers, getUserStats, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/developers', getDevelopers);
router.get('/:id/stats', getUserStats);
router.put('/profile', protect, updateProfile);

export default router;
