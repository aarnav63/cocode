import express from 'express';
import { body } from 'express-validator';
import { submitRating, getMyRatings } from '../controllers/ratingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyRatings);
router.post(
  '/',
  protect,
  [
    body('rateeId').trim().isMongoId().withMessage('Valid ratee ID is required'),
    body('hackathonId').trim().isMongoId().withMessage('Valid hackathon ID is required'),
    body('communication').isInt({ min: 1, max: 5 }).withMessage('Communication score must be 1-5'),
    body('leadership').isInt({ min: 1, max: 5 }).withMessage('Leadership score must be 1-5'),
    body('reliability').isInt({ min: 1, max: 5 }).withMessage('Reliability score must be 1-5')
  ],
  validate,
  submitRating
);

export default router;
