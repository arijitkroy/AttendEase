import jwt from 'jsonwebtoken';
import { dbService } from '../services/databaseService.js';
import { ROLES } from '../config/constants.js';

const JWT_SECRET = process.env.JWT_SECRET || 'emp_attendance_jwt_super_secret_key_2026';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await dbService.findById('users', decoded.id);
    if (!user || user.isActive === false) {
      return res.status(401).json({ success: false, message: 'User session invalid or inactive.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      position: user.position,
      leaveBalances: user.leaveBalances
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.', error: error.message });
  }
};

export const requireHR = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.HR_ADMIN) {
    return res.status(403).json({ success: false, message: 'Access denied. HR Administrator privileges required.' });
  }
  next();
};
