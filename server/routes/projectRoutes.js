import express from 'express';
import { body, param } from 'express-validator';
import { createProject, getProjects, getMyProjects, acceptRequest, completeProject, fulfillRequirement, requestToJoin, getJoinedProjects, rejectRequest, removeCollaborator, getHistoryProjects, finishProject, leaveProject, deleteProject } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/me', protect, getMyProjects);
router.get('/joined', protect, getJoinedProjects);
router.get('/history', protect, getHistoryProjects);
router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 150 }),
    body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }),
    body('requiredDevs').optional().isArray(),
    body('requiredDevs.*.skill').optional().trim().notEmpty().withMessage('Skill is required'),
    body('requiredDevs.*.count').optional().isInt({ min: 1 }).withMessage('Count must be at least 1'),
    body('hackathonId').optional().isMongoId().withMessage('Invalid hackathon ID')
  ],
  validate,
  createProject
);
router.get('/', getProjects);
router.put('/:projId/accept/:userId', protect, [param('projId').isMongoId(), param('userId').isMongoId()], validate, acceptRequest);
router.put('/:projId/reject/:userId', protect, [param('projId').isMongoId(), param('userId').isMongoId()], validate, rejectRequest);
router.put('/:projId/remove/:userId', protect, [param('projId').isMongoId(), param('userId').isMongoId()], validate, removeCollaborator);
router.put('/:projId/leave', protect, [param('projId').isMongoId()], validate, leaveProject);
router.put('/:projId/complete', protect, [param('projId').isMongoId()], validate, completeProject);
router.put('/:projId/finish', protect, [param('projId').isMongoId()], validate, finishProject);
router.put('/:projId/fulfill/:reqId', protect, [param('projId').isMongoId(), param('reqId').isMongoId()], validate, fulfillRequirement);
router.post('/:projId/request', protect, [param('projId').isMongoId()], validate, requestToJoin);
router.delete('/:projId', protect, [param('projId').isMongoId()], validate, deleteProject);

export default router;
