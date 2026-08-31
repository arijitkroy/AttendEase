import bcrypt from 'bcryptjs';
import { dbService } from '../services/databaseService.js';
import { generateToken } from '../middleware/auth.js';
import { DEFAULT_LEAVE_QUOTAS, ROLES } from '../config/constants.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, department, position, employeeId, shiftStartTime, shiftEndTime } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await dbService.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An employee with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await dbService.create('users', {
      employeeId: employeeId || 'EMP-' + Math.floor(1000 + Math.random() * 9000),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role === ROLES.HR_ADMIN ? ROLES.HR_ADMIN : ROLES.EMPLOYEE,
      department: department || 'Engineering',
      position: position || 'Software Engineer',
      shiftStartTime: shiftStartTime || '09:00',
      shiftEndTime: shiftEndTime || '17:00',
      joinDate: new Date().toISOString().split('T')[0],
      isActive: true,
      leaveBalances: { ...DEFAULT_LEAVE_QUOTAS, UNPAID: 0 }
    });

    const token = generateToken(newUser);

    const safeUser = { ...newUser };
    delete safeUser.password;

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error registering user', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await dbService.findOne('users', u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact HR.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user);
    const safeUser = { ...user };
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await dbService.findById('users', req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const safeUser = { ...user };
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, department, position, phone } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (department) updates.department = department;
    if (position) updates.position = position;
    if (phone) updates.phone = phone;

    const updatedUser = await dbService.update('users', req.user.id, updates);
    const safeUser = { ...updatedUser };
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
};
