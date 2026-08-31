import { ATTENDANCE_STATUS, SHIFT_RULES } from '../config/constants.js';

export const calculateWorkingHours = (checkInTime, checkOutTime, breakMinutes = 0) => {
  if (!checkInTime || !checkOutTime) {
    return {
      durationMinutes: 0,
      durationHours: 0,
      formattedDuration: '0h 0m',
      overtimeHours: 0,
      shortfallHours: 0
    };
  }

  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);

  const diffMs = checkOut.getTime() - checkIn.getTime();
  if (diffMs <= 0) {
    return {
      durationMinutes: 0,
      durationHours: 0,
      formattedDuration: '0h 0m',
      overtimeHours: 0,
      shortfallHours: 0
    };
  }

  const grossMinutes = Math.floor(diffMs / (1000 * 60));
  const netMinutes = Math.max(0, grossMinutes - (breakMinutes || 0));
  const decimalHours = parseFloat((netMinutes / 60).toFixed(2));

  const hours = Math.floor(netMinutes / 60);
  const minutes = netMinutes % 60;
  const formattedDuration = `${hours}h ${minutes}m`;

  const standardHours = SHIFT_RULES.STANDARD_HOURS;
  const overtimeHours = decimalHours > standardHours ? parseFloat((decimalHours - standardHours).toFixed(2)) : 0;
  const shortfallHours = decimalHours < standardHours ? parseFloat((standardHours - decimalHours).toFixed(2)) : 0;

  return {
    grossMinutes,
    netMinutes,
    durationHours: decimalHours,
    formattedDuration,
    overtimeHours,
    shortfallHours
  };
};

export const determineAttendanceStatus = (checkInTime, workingHours = null, shiftStartTime = SHIFT_RULES.DEFAULT_START_TIME, graceMinutes = SHIFT_RULES.LATE_GRACE_MINUTES) => {
  if (!checkInTime) {
    return ATTENDANCE_STATUS.ABSENT;
  }

  const checkIn = new Date(checkInTime);
  const checkInHours = checkIn.getHours();
  const checkInMinutes = checkIn.getMinutes();

  const [shiftHour, shiftMin] = shiftStartTime.split(':').map(Number);
  const shiftStartTotalMinutes = shiftHour * 60 + shiftMin;
  const checkInTotalMinutes = checkInHours * 60 + checkInMinutes;

  const isLate = checkInTotalMinutes > (shiftStartTotalMinutes + graceMinutes);

  if (workingHours !== null) {
    if (workingHours < SHIFT_RULES.MIN_HALF_DAY_HOURS) {
      return ATTENDANCE_STATUS.ABSENT;
    }
    if (workingHours < SHIFT_RULES.FULL_DAY_MIN_HOURS) {
      return ATTENDANCE_STATUS.HALF_DAY;
    }
  }

  return isLate ? ATTENDANCE_STATUS.LATE : ATTENDANCE_STATUS.PRESENT;
};

export const calculateMonthlyStats = (attendanceRecords, daysInMonthCount = 22) => {
  let totalWorkingHours = 0;
  let totalOvertimeHours = 0;
  let totalShortfallHours = 0;
  let presentDays = 0;
  let lateDays = 0;
  let halfDays = 0;
  let absentDays = 0;
  let onLeaveDays = 0;

  attendanceRecords.forEach(record => {
    totalWorkingHours += record.workingHours || 0;
    totalOvertimeHours += record.overtimeHours || 0;
    totalShortfallHours += record.shortfallHours || 0;

    switch (record.status) {
      case ATTENDANCE_STATUS.PRESENT:
        presentDays++;
        break;
      case ATTENDANCE_STATUS.LATE:
        lateDays++;
        presentDays++;
        break;
      case ATTENDANCE_STATUS.HALF_DAY:
        halfDays++;
        break;
      case ATTENDANCE_STATUS.ABSENT:
        absentDays++;
        break;
      case ATTENDANCE_STATUS.ON_LEAVE:
        onLeaveDays++;
        break;
      default:
        break;
    }
  });

  const totalTrackedDays = attendanceRecords.length || 1;
  const effectivePresent = presentDays + (halfDays * 0.5);
  const attendancePercentage = Math.min(100, Math.round((effectivePresent / Math.max(1, daysInMonthCount)) * 100));
  const punctualityScore = presentDays > 0 ? Math.round(((presentDays - lateDays) / presentDays) * 100) : 100;
  const averageDailyHours = presentDays > 0 ? parseFloat((totalWorkingHours / (presentDays + halfDays || 1)).toFixed(1)) : 0;

  return {
    totalWorkingHours: parseFloat(totalWorkingHours.toFixed(2)),
    totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(2)),
    totalShortfallHours: parseFloat(totalShortfallHours.toFixed(2)),
    presentDays,
    lateDays,
    halfDays,
    absentDays,
    onLeaveDays,
    attendancePercentage,
    punctualityScore: Math.max(0, punctualityScore),
    averageDailyHours
  };
};
