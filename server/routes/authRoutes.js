import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, getMe, googleLogin, completeGoogleProfile, refreshToken, logout } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['developer', 'organizer']),
    body('skills').optional().isArray(),
    body('location').optional().trim().isLength({ max: 100 }),
    body('phone').optional().trim().isLength({ min: 7, max: 20 })
  ],
  validate,
  registerUser
);
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isString().notEmpty().withMessage('Password is required')
  ],
  validate,
  loginUser
);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post(
  '/google',
  [
    body('access_token').trim().notEmpty().withMessage('Access token is required')
  ],
  validate,
  googleLogin
);
router.post(
  '/complete-profile',
  [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
    body('googleId').trim().notEmpty().withMessage('Google ID is required'),
    body('role').optional().isIn(['developer', 'organizer']),
    body('skills').optional().isArray(),
    body('location').optional().trim().isLength({ max: 100 }),
    body('phone').optional().trim().isLength({ min: 7, max: 20 }),
    body('githubUrl').optional().isURL().withMessage('GitHub URL must be valid')
  ],
  validate,
  completeGoogleProfile
);

export default router;
