import { LEAVE_STATUS, LEAVE_TYPES, SHIFT_RULES } from '../config/constants.js';
import { dbService } from './databaseService.js';

export const calculateLeaveDays = (startDateStr, endDateStr, isHalfDay = false) => {
  if (isHalfDay) return 0.5;

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  if (end < start) {
    throw new Error('End date cannot be before start date');
  }

  let totalDays = 0;
  const cur = new Date(start);

  while (cur <= end) {
    const dayOfWeek = cur.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      totalDays++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return Math.max(1, totalDays);
};

export const deductLeaveBalance = async (userId, leaveType, daysToDeduct) => {
  const user = await dbService.findById('users', userId);
  if (!user) throw new Error('User not found');

  const leaveBalances = user.leaveBalances || {
    [LEAVE_TYPES.ANNUAL]: 15,
    [LEAVE_TYPES.CASUAL]: 10,
    [LEAVE_TYPES.SICK]: 10,
    [LEAVE_TYPES.UNPAID]: 0
  };

  if (leaveType === LEAVE_TYPES.UNPAID) {
    leaveBalances[LEAVE_TYPES.UNPAID] = (leaveBalances[LEAVE_TYPES.UNPAID] || 0) + daysToDeduct;
  } else {
    const currentBalance = leaveBalances[leaveType] || 0;
    if (currentBalance < daysToDeduct) {
      const remainingDeduction = daysToDeduct - currentBalance;
      leaveBalances[leaveType] = 0;
      leaveBalances[LEAVE_TYPES.UNPAID] = (leaveBalances[LEAVE_TYPES.UNPAID] || 0) + remainingDeduction;
    } else {
      leaveBalances[leaveType] = parseFloat((currentBalance - daysToDeduct).toFixed(1));
    }
  }

  await dbService.update('users', userId, { leaveBalances });
  return leaveBalances;
};

export const restoreLeaveBalance = async (userId, leaveType, daysToRestore) => {
  const user = await dbService.findById('users', userId);
  if (!user) throw new Error('User not found');

  const leaveBalances = user.leaveBalances || {
    [LEAVE_TYPES.ANNUAL]: 15,
    [LEAVE_TYPES.CASUAL]: 10,
    [LEAVE_TYPES.SICK]: 10,
    [LEAVE_TYPES.UNPAID]: 0
  };

  if (leaveType !== LEAVE_TYPES.UNPAID) {
    leaveBalances[leaveType] = parseFloat(((leaveBalances[leaveType] || 0) + daysToRestore).toFixed(1));
  }

  await dbService.update('users', userId, { leaveBalances });
  return leaveBalances;
};

export const checkAndApplyLatePenalty = async (userId, monthStr) => {
  const allRecords = await dbService.find('attendance', r => r.userId === userId && r.date && r.date.startsWith(monthStr));
  const lateCount = allRecords.filter(r => r.status === 'LATE').length;

  if (lateCount >= SHIFT_RULES.MAX_LATE_COUNT_BEFORE_DEDUCTION) {
    const deductionMultiples = Math.floor(lateCount / SHIFT_RULES.MAX_LATE_COUNT_BEFORE_DEDUCTION);
    const penaltyDays = deductionMultiples * 0.5;
    return {
      triggered: true,
      lateCount,
      penaltyDays,
      message: `${lateCount} late marks accumulated this month. Policy deduction of ${penaltyDays} day(s) applies.`
    };
  }

  return { triggered: false, lateCount, penaltyDays: 0 };
};
