import express from 'express';
import { body, param } from 'express-validator';
import { createHackathon, getHackathons, getHackathonById, joinHackathon } from '../controllers/hackathonController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/').get(getHackathons).post(
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 150 }),
    body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('location').trim().notEmpty().withMessage('Location is required').isLength({ max: 200 }),
    body('rules').optional().trim().isLength({ max: 2000 }),
    body('endDate').custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must come after start date');
      }
      return true;
    })
  ],
  validate,
  createHackathon
);
router.route('/:id').get([param('id').isMongoId().withMessage('Invalid hackathon ID')], validate, getHackathonById);
router.route('/:id/join').post(protect, [param('id').isMongoId().withMessage('Invalid hackathon ID')], validate, joinHackathon);

export default router;
