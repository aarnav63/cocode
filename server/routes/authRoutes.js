import express from 'express';
import { registerUser, loginUser, getMe, googleLogin, completeGoogleProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/google', googleLogin);
router.post('/complete-profile', completeGoogleProfile);

export default router;
