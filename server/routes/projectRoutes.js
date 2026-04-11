import express from 'express';
import { createProject, getProjects, getMyProjects, fulfillRequirement, requestToJoin } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyProjects);
router.post('/', protect, createProject);
router.get('/', getProjects);
router.put('/:projId/fulfill/:reqId', protect, fulfillRequirement);
router.post('/:projId/request', protect, requestToJoin);

export default router;
