import express from 'express';
import { getDevelopers, getUserStats } from '../controllers/userController.js';

const router = express.Router();

router.get('/developers', getDevelopers);
router.get('/:id/stats', getUserStats);

export default router;
