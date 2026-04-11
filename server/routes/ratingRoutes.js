import express from 'express';
import { submitRating, getMyRatings } from '../controllers/ratingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyRatings);
router.post('/', protect, submitRating);

export default router;
