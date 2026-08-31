import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController.js';
import { requireAuth, requireHR } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, requireHR, getEmployees);
router.post('/', requireAuth, requireHR, createEmployee);
router.get('/:id', requireAuth, requireHR, getEmployeeById);
router.put('/:id', requireAuth, requireHR, updateEmployee);
router.delete('/:id', requireAuth, requireHR, deleteEmployee);

export default router;
