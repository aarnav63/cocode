import express from 'express';
import { createProject, getProjects, getMyProjects, acceptRequest, completeProject, fulfillRequirement, requestToJoin, getJoinedProjects, rejectRequest, removeCollaborator, getHistoryProjects, finishProject } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyProjects);
router.get('/joined', protect, getJoinedProjects);
router.get('/history', protect, getHistoryProjects);
router.post('/', protect, createProject);
router.get('/', getProjects);
router.put('/:projId/accept/:userId', protect, acceptRequest);
router.put('/:projId/reject/:userId', protect, rejectRequest);
router.put('/:projId/remove/:userId', protect, removeCollaborator);
router.put('/:projId/complete', protect, completeProject);
router.put('/:projId/finish', protect, finishProject);
router.put('/:projId/fulfill/:reqId', protect, fulfillRequirement);
router.post('/:projId/request', protect, requestToJoin);

export default router;
