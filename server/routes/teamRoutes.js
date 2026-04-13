import express from 'express';
import { body, param } from 'express-validator';
import { createTeam, joinTeam } from '../controllers/teamController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('name').trim().notEmpty().withMessage('Team name is required').isLength({ max: 150 }),
    body('hackathonId').trim().isMongoId().withMessage('Valid hackathon ID is required'),
    body('requiredSkills').optional().isArray()
  ],
  validate,
  createTeam
);
router.post('/:id/join', protect, [param('id').isMongoId().withMessage('Invalid team ID')], validate, joinTeam);

export default router;
