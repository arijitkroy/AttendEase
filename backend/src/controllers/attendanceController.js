import { ATTENDANCE_STATUS, WORK_MODE } from '../config/constants.js';
import { dbService } from '../services/databaseService.js';
import { calculateWorkingHours, determineAttendanceStatus, calculateMonthlyStats } from '../services/attendanceService.js';
import { checkAndApplyLatePenalty } from '../services/leaveService.js';

export const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const { workMode = WORK_MODE.OFFICE, location = 'Main Office', notes = '' } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    const existingRecord = await dbService.findOne('attendance', r => r.userId === userId && r.date === todayStr);

    if (existingRecord && existingRecord.checkInTime && !existingRecord.checkOutTime) {
      return res.status(400).json({ success: false, message: 'You are already checked in for today.' });
    }

    if (existingRecord && existingRecord.checkInTime && existingRecord.checkOutTime) {
      return res.status(400).json({ success: false, message: 'You have already checked out for today. Contact HR to regularize attendance if needed.' });
    }

    const user = await dbService.findById('users', userId);
    const shiftStartTime = user.shiftStartTime || '09:00';
    const checkInTime = new Date().toISOString();

    const initialStatus = determineAttendanceStatus(checkInTime, null, shiftStartTime);

    const recordData = {
      userId,
      employeeId: user.employeeId,
      employeeName: user.name,
      department: user.department,
      date: todayStr,
      checkInTime,
      checkOutTime: null,
      workMode,
      location,
      notes,
      status: initialStatus,
      workingHours: 0,
      overtimeHours: 0,
      shortfallHours: 0,
      breakMinutes: 0
    };

    let record;
    if (existingRecord) {
      record = await dbService.update('attendance', existingRecord.id, recordData);
    } else {
      record = await dbService.create('attendance', recordData);
    }

    return res.status(200).json({
      success: true,
      message: initialStatus === ATTENDANCE_STATUS.LATE ? 'Checked in successfully (Marked as Late)' : 'Checked in successfully',
      attendance: record
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error processing check-in', error: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notes = '', breakMinutes = 0 } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    const existingRecord = await dbService.findOne('attendance', r => r.userId === userId && r.date === todayStr);

    if (!existingRecord || !existingRecord.checkInTime) {
      return res.status(400).json({ success: false, message: 'No check-in record found for today. Please check in first.' });
    }

    if (existingRecord.checkOutTime) {
      return res.status(400).json({ success: false, message: 'You have already checked out for today.' });
    }

    const checkOutTime = new Date().toISOString();
    const user = await dbService.findById('users', userId);
    const shiftStartTime = user.shiftStartTime || '09:00';

    const { durationHours, overtimeHours, shortfallHours, formattedDuration } = calculateWorkingHours(
      existingRecord.checkInTime,
      checkOutTime,
      breakMinutes || existingRecord.breakMinutes || 0
    );

    const finalStatus = determineAttendanceStatus(existingRecord.checkInTime, durationHours, shiftStartTime);

    const updated = await dbService.update('attendance', existingRecord.id, {
      checkOutTime,
      workingHours: durationHours,
      overtimeHours,
      shortfallHours,
      formattedDuration,
      breakMinutes: breakMinutes || existingRecord.breakMinutes || 0,
      status: finalStatus,
      notes: notes ? (existingRecord.notes ? `${existingRecord.notes} | ${notes}` : notes) : existingRecord.notes
    });

    const currentMonth = todayStr.substring(0, 7);
    const penaltyNotice = await checkAndApplyLatePenalty(userId, currentMonth);

    return res.status(200).json({
      success: true,
      message: `Checked out successfully. Total hours worked: ${formattedDuration}`,
      attendance: updated,
      penaltyNotice: penaltyNotice.triggered ? penaltyNotice.message : null
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error processing check-out', error: error.message });
  }
};

export const getTodayStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    const record = await dbService.findOne('attendance', r => r.userId === userId && r.date === todayStr);
    const todayLeave = await dbService.findOne('leaves', l => l.userId === userId && l.status === 'APPROVED' && todayStr >= l.startDate && todayStr <= l.endDate);

    let status = 'NOT_CHECKED_IN';
    if (todayLeave) {
      status = 'ON_LEAVE';
    } else if (record) {
      if (record.checkInTime && !record.checkOutTime) {
        status = 'CHECKED_IN';
      } else if (record.checkInTime && record.checkOutTime) {
        status = 'CHECKED_OUT';
      }
    }

    return res.status(200).json({
      success: true,
      date: todayStr,
      status,
      attendance: record || null,
      leave: todayLeave || null
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching today status', error: error.message });
  }
};

export const getMyAttendanceHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year, status } = req.query;

    let records = await dbService.find('attendance', r => r.userId === userId);

    if (month && year) {
      const formattedMonth = String(month).padStart(2, '0');
      const prefix = `${year}-${formattedMonth}`;
      records = records.filter(r => r.date && r.date.startsWith(prefix));
    }

    if (status) {
      records = records.filter(r => r.status === status);
    }

    records.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const stats = calculateMonthlyStats(records);

    return res.status(200).json({
      success: true,
      count: records.length,
      records,
      stats
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching attendance history', error: error.message });
  }
};

export const getHRDashboardMetrics = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const employees = await dbService.find('users', u => u.role !== 'HR_ADMIN' && u.isActive !== false);
    const totalEmployees = employees.length;

    const todayRecords = await dbService.find('attendance', r => r.date === todayStr);
    const approvedLeaves = await dbService.find('leaves', l => l.status === 'APPROVED' && todayStr >= l.startDate && todayStr <= l.endDate);

    const checkedInCount = todayRecords.filter(r => r.checkInTime && !r.checkOutTime).length;
    const checkedOutCount = todayRecords.filter(r => r.checkInTime && r.checkOutTime).length;
    const presentTodayCount = todayRecords.length;
    const lateTodayCount = todayRecords.filter(r => r.status === ATTENDANCE_STATUS.LATE).length;
    const onLeaveTodayCount = approvedLeaves.length;
    const wfhTodayCount = todayRecords.filter(r => r.workMode === WORK_MODE.WFH).length;
    const officeTodayCount = todayRecords.filter(r => r.workMode === WORK_MODE.OFFICE).length;
    const absentTodayCount = Math.max(0, totalEmployees - (presentTodayCount + onLeaveTodayCount));

    const pendingLeaves = await dbService.find('leaves', l => l.status === 'PENDING');

    const departmentMap = {};
    employees.forEach(emp => {
      const dept = emp.department || 'General';
      if (!departmentMap[dept]) {
        departmentMap[dept] = { total: 0, present: 0 };
      }
      departmentMap[dept].total++;
    });

    todayRecords.forEach(rec => {
      const dept = rec.department || 'General';
      if (departmentMap[dept]) {
        departmentMap[dept].present++;
      }
    });

    const departmentStats = Object.entries(departmentMap).map(([name, data]) => ({
      department: name,
      total: data.total,
      present: data.present,
      rate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
    }));

    return res.status(200).json({
      success: true,
      metrics: {
        totalEmployees,
        checkedInCount,
        checkedOutCount,
        presentTodayCount,
        lateTodayCount,
        onLeaveTodayCount,
        absentTodayCount,
        wfhTodayCount,
        officeTodayCount,
        pendingLeavesCount: pendingLeaves.length,
        departmentStats
      },
      todayLiveRecords: todayRecords
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching HR dashboard metrics', error: error.message });
  }
};

export const getAllAttendanceLogs = async (req, res) => {
  try {
    const { startDate, endDate, department, status, employeeId, search } = req.query;

    let records = await dbService.getCollection('attendance');

    if (startDate && endDate) {
      records = records.filter(r => r.date >= startDate && r.date <= endDate);
    } else if (startDate) {
      records = records.filter(r => r.date >= startDate);
    } else if (endDate) {
      records = records.filter(r => r.date <= endDate);
    }

    if (department && department !== 'ALL') {
      records = records.filter(r => r.department === department);
    }

    if (status && status !== 'ALL') {
      records = records.filter(r => r.status === status);
    }

    if (employeeId) {
      records = records.filter(r => r.employeeId === employeeId || r.userId === employeeId);
    }

    if (search) {
      const q = search.toLowerCase();
      records = records.filter(r =>
        (r.employeeName && r.employeeName.toLowerCase().includes(q)) ||
        (r.employeeId && r.employeeId.toLowerCase().includes(q)) ||
        (r.department && r.department.toLowerCase().includes(q))
      );
    }

    records.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    return res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching attendance logs', error: error.message });
  }
};

export const adjustAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkInTime, checkOutTime, status, notes, breakMinutes = 0 } = req.body;

    const existingRecord = await dbService.findById('attendance', id);
    if (!existingRecord) {
      return res.status(404).json({ success: false, message: 'Attendance record not found.' });
    }

    const effectiveCheckIn = checkInTime || existingRecord.checkInTime;
    const effectiveCheckOut = checkOutTime || existingRecord.checkOutTime;

    let workingHours = existingRecord.workingHours;
    let overtimeHours = existingRecord.overtimeHours;
    let shortfallHours = existingRecord.shortfallHours;
    let formattedDuration = existingRecord.formattedDuration;

    if (effectiveCheckIn && effectiveCheckOut) {
      const calc = calculateWorkingHours(effectiveCheckIn, effectiveCheckOut, breakMinutes);
      workingHours = calc.durationHours;
      overtimeHours = calc.overtimeHours;
      shortfallHours = calc.shortfallHours;
      formattedDuration = calc.formattedDuration;
    }

    const updated = await dbService.update('attendance', id, {
      checkInTime: effectiveCheckIn,
      checkOutTime: effectiveCheckOut,
      workingHours,
      overtimeHours,
      shortfallHours,
      formattedDuration,
      breakMinutes,
      status: status || existingRecord.status,
      notes: notes || existingRecord.notes,
      adjustedBy: req.user.name,
      adjustedAt: new Date().toISOString()
    });

    await dbService.create('audit_logs', {
      action: 'ADJUST_ATTENDANCE',
      recordId: id,
      performedBy: req.user.email,
      changes: { checkInTime, checkOutTime, status, notes },
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      attendance: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error adjusting attendance', error: error.message });
  }
};

export const exportAttendanceCSV = async (req, res) => {
  try {
    const records = await dbService.getCollection('attendance');
    records.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const headers = ['Date', 'Employee ID', 'Employee Name', 'Department', 'Check-In', 'Check-Out', 'Work Mode', 'Hours Worked', 'Overtime', 'Shortfall', 'Status', 'Notes'];
    const rows = records.map(r => [
      r.date || '',
      r.employeeId || '',
      `"${(r.employeeName || '').replace(/"/g, '""')}"`,
      `"${(r.department || '').replace(/"/g, '""')}"`,
      r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '',
      r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '',
      r.workMode || '',
      r.workingHours || 0,
      r.overtimeHours || 0,
      r.shortfallHours || 0,
      r.status || '',
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_export_${new Date().toISOString().split('T')[0]}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error exporting CSV', error: error.message });
  }
};
