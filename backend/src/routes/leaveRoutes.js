import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaveRequests,
  approveLeave,
  rejectLeave
} from '../controllers/leaveController.js';
import { requireAuth, requireHR } from '../middleware/auth.js';

const router = express.Router();

router.post('/apply', requireAuth, applyLeave);
router.get('/my-leaves', requireAuth, getMyLeaves);

router.get('/all-requests', requireAuth, requireHR, getAllLeaveRequests);
router.post('/:id/approve', requireAuth, requireHR, approveLeave);
router.post('/:id/reject', requireAuth, requireHR, rejectLeave);

export default router;
