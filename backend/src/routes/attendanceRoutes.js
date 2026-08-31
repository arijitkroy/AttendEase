import express from 'express';
import {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendanceHistory,
  getHRDashboardMetrics,
  getAllAttendanceLogs,
  adjustAttendance,
  exportAttendanceCSV
} from '../controllers/attendanceController.js';
import { requireAuth, requireHR } from '../middleware/auth.js';

const router = express.Router();

router.post('/check-in', requireAuth, checkIn);
router.post('/check-out', requireAuth, checkOut);
router.get('/today', requireAuth, getTodayStatus);
router.get('/my-history', requireAuth, getMyAttendanceHistory);

router.get('/hr-metrics', requireAuth, requireHR, getHRDashboardMetrics);
router.get('/all-logs', requireAuth, requireHR, getAllAttendanceLogs);
router.put('/adjust/:id', requireAuth, requireHR, adjustAttendance);
router.get('/export-csv', requireAuth, requireHR, exportAttendanceCSV);

export default router;
