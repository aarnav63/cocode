import express from 'express';
import { body, param } from 'express-validator';
import { getDevelopers, getUserStats, updateProfile, getUniqueSkills, getUniqueLocations } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/developers', getDevelopers);
router.get('/skills', getUniqueSkills);
router.get('/locations', getUniqueLocations);
router.get('/:id/stats', [param('id').isMongoId().withMessage('Invalid user ID')], validate, getUserStats);
router.put(
  '/profile',
  protect,
  [
    body('skills').optional().isArray(),
    body('location').optional().trim().isLength({ max: 100 }),
    body('phone').optional().trim().isLength({ min: 7, max: 20 }),
    body('githubUrl').optional().isURL().withMessage('GitHub URL must be valid')
  ],
  validate,
  updateProfile
);

export default router;
