import express from 'express';
import { submitRating } from '../controllers/ratingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, submitRating);

export default router;
