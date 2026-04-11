import express from 'express';
import { createTeam, joinTeam } from '../controllers/teamController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createTeam);
router.post('/:id/join', protect, joinTeam);

export default router;
