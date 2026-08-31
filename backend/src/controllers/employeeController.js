import bcrypt from 'bcryptjs';
import { DEFAULT_LEAVE_QUOTAS, ROLES } from '../config/constants.js';
import { dbService } from '../services/databaseService.js';
import { calculateMonthlyStats } from '../services/attendanceService.js';

export const getEmployees = async (req, res) => {
  try {
    const { department, role, search } = req.query;
    let employees = await dbService.getCollection('users');

    if (department && department !== 'ALL') {
      employees = employees.filter(e => e.department === department);
    }

    if (role && role !== 'ALL') {
      employees = employees.filter(e => e.role === role);
    }

    if (search) {
      const q = search.toLowerCase();
      employees = employees.filter(e =>
        (e.name && e.name.toLowerCase().includes(q)) ||
        (e.email && e.email.toLowerCase().includes(q)) ||
        (e.employeeId && e.employeeId.toLowerCase().includes(q)) ||
        (e.position && e.position.toLowerCase().includes(q))
      );
    }

    const safeEmployees = employees.map(emp => {
      const copy = { ...emp };
      delete copy.password;
      return copy;
    });

    return res.status(200).json({
      success: true,
      count: safeEmployees.length,
      employees: safeEmployees
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching employees', error: error.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await dbService.findById('users', id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const attendanceRecords = await dbService.find('attendance', r => r.userId === id);
    const stats = calculateMonthlyStats(attendanceRecords);

    const safeUser = { ...user };
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      employee: safeUser,
      attendanceStats: stats
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching employee profile', error: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { name, email, password, role, department, position, employeeId, shiftStartTime, shiftEndTime, leaveBalances } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await dbService.findOne('users', u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ success: false, message: 'Employee with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newEmployee = await dbService.create('users', {
      employeeId: employeeId || 'EMP-' + Math.floor(1000 + Math.random() * 9000),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role === ROLES.HR_ADMIN ? ROLES.HR_ADMIN : ROLES.EMPLOYEE,
      department: department || 'Engineering',
      position: position || 'Team Member',
      shiftStartTime: shiftStartTime || '09:00',
      shiftEndTime: shiftEndTime || '17:00',
      joinDate: new Date().toISOString().split('T')[0],
      isActive: true,
      leaveBalances: leaveBalances || { ...DEFAULT_LEAVE_QUOTAS, UNPAID: 0 }
    });

    const safeUser = { ...newEmployee };
    delete safeUser.password;

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee: safeUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error creating employee', error: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, position, role, shiftStartTime, shiftEndTime, isActive, leaveBalances, password } = req.body;

    const user = await dbService.findById('users', id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (department) updates.department = department;
    if (position) updates.position = position;
    if (role) updates.role = role;
    if (shiftStartTime) updates.shiftStartTime = shiftStartTime;
    if (shiftEndTime) updates.shiftEndTime = shiftEndTime;
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (leaveBalances) updates.leaveBalances = leaveBalances;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await dbService.update('users', id, updates);
    const safeUser = { ...updatedUser };
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      employee: safeUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating employee', error: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await dbService.update('users', id, { isActive: false });
    return res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deactivating employee', error: error.message });
  }
};
