import { ATTENDANCE_STATUS, LEAVE_STATUS, LEAVE_TYPES } from '../config/constants.js';
import { dbService } from '../services/databaseService.js';
import { calculateLeaveDays, deductLeaveBalance } from '../services/leaveService.js';

export const applyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leaveType, startDate, endDate, isHalfDay = false, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Leave type, start date, end date, and reason are required.' });
    }

    const requestedDays = calculateLeaveDays(startDate, endDate, isHalfDay);
    const user = await dbService.findById('users', userId);

    const existingLeaves = await dbService.find('leaves', l => 
      l.userId === userId && 
      (l.status === LEAVE_STATUS.PENDING || l.status === LEAVE_STATUS.APPROVED) &&
      ((startDate >= l.startDate && startDate <= l.endDate) || 
       (endDate >= l.startDate && endDate <= l.endDate) ||
       (startDate <= l.startDate && endDate >= l.endDate))
    );

    if (existingLeaves.length > 0) {
      return res.status(400).json({
        success: false,
        message: `You already have an active or pending leave request overlapping with this date range (${existingLeaves[0].startDate} to ${existingLeaves[0].endDate}).`
      });
    }

    const balances = user.leaveBalances || {
      [LEAVE_TYPES.ANNUAL]: 15,
      [LEAVE_TYPES.CASUAL]: 10,
      [LEAVE_TYPES.SICK]: 10,
      [LEAVE_TYPES.UNPAID]: 0
    };

    const currentTypeBalance = balances[leaveType] || 0;
    if (leaveType !== LEAVE_TYPES.UNPAID && currentTypeBalance < requestedDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType} leave balance. Available: ${currentTypeBalance} days, Requested: ${requestedDays} days.`
      });
    }

    const leaveRequest = await dbService.create('leaves', {
      userId,
      employeeId: user.employeeId,
      employeeName: user.name,
      department: user.department,
      leaveType,
      startDate,
      endDate,
      isHalfDay,
      requestedDays,
      reason,
      status: LEAVE_STATUS.PENDING,
      appliedAt: new Date().toISOString(),
      approvedBy: null,
      approvedAt: null,
      rejectionReason: null
    });

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave: leaveRequest
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error submitting leave application', error: error.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await dbService.findById('users', userId);
    const leaves = await dbService.find('leaves', l => l.userId === userId);
    leaves.sort((a, b) => (b.appliedAt || '').localeCompare(a.appliedAt || ''));

    return res.status(200).json({
      success: true,
      balances: user.leaveBalances || {},
      leaves
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching leave records', error: error.message });
  }
};

export const getAllLeaveRequests = async (req, res) => {
  try {
    const { status, department } = req.query;
    let leaves = await dbService.getCollection('leaves');

    if (status && status !== 'ALL') {
      leaves = leaves.filter(l => l.status === status);
    }

    if (department && department !== 'ALL') {
      leaves = leaves.filter(l => l.department === department);
    }

    leaves.sort((a, b) => (b.appliedAt || '').localeCompare(a.appliedAt || ''));

    return res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching all leave requests', error: error.message });
  }
};

export const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const leave = await dbService.findById('leaves', id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    if (leave.status !== LEAVE_STATUS.PENDING) {
      return res.status(400).json({ success: false, message: `Leave request has already been ${leave.status.toLowerCase()}.` });
    }

    const updatedBalances = await deductLeaveBalance(leave.userId, leave.leaveType, leave.requestedDays);

    const updatedLeave = await dbService.update('leaves', id, {
      status: LEAVE_STATUS.APPROVED,
      approvedBy: req.user.name,
      approvedAt: new Date().toISOString(),
      reviewComments: comments || 'Approved by HR'
    });

    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const cur = new Date(start);

    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dateStr = cur.toISOString().split('T')[0];
        const existingAtt = await dbService.findOne('attendance', r => r.userId === leave.userId && r.date === dateStr);
        if (existingAtt) {
          await dbService.update('attendance', existingAtt.id, {
            status: ATTENDANCE_STATUS.ON_LEAVE,
            notes: `Leave Approved: ${leave.leaveType}`
          });
        } else {
          await dbService.create('attendance', {
            userId: leave.userId,
            employeeId: leave.employeeId,
            employeeName: leave.employeeName,
            department: leave.department,
            date: dateStr,
            checkInTime: null,
            checkOutTime: null,
            workingHours: 0,
            overtimeHours: 0,
            shortfallHours: 0,
            status: ATTENDANCE_STATUS.ON_LEAVE,
            notes: `Leave: ${leave.leaveType}`
          });
        }
      }
      cur.setDate(cur.getDate() + 1);
    }

    return res.status(200).json({
      success: true,
      message: 'Leave request approved and balance deducted.',
      leave: updatedLeave,
      updatedBalances
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error approving leave request', error: error.message });
  }
};

export const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason = 'Rejected by HR' } = req.body;

    const leave = await dbService.findById('leaves', id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    if (leave.status !== LEAVE_STATUS.PENDING) {
      return res.status(400).json({ success: false, message: `Leave request has already been ${leave.status.toLowerCase()}.` });
    }

    const updatedLeave = await dbService.update('leaves', id, {
      status: LEAVE_STATUS.REJECTED,
      rejectionReason,
      approvedBy: req.user.name,
      approvedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Leave request rejected',
      leave: updatedLeave
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error rejecting leave request', error: error.message });
  }
};
