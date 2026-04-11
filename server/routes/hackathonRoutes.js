import express from 'express';
import { createHackathon, getHackathons, getHackathonById, joinHackathon } from '../controllers/hackathonController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getHackathons).post(protect, createHackathon);
router.route('/:id').get(getHackathonById);
router.route('/:id/join').post(protect, joinHackathon);

export default router;
