import bcrypt from 'bcryptjs';
import { ROLES, ATTENDANCE_STATUS, WORK_MODE, LEAVE_TYPES, LEAVE_STATUS, DEFAULT_LEAVE_QUOTAS } from '../config/constants.js';
import { dbService } from '../services/databaseService.js';
import { calculateWorkingHours } from '../services/attendanceService.js';

export const runSeed = async () => {
  console.log('Seeding initial attendance management data...');

  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const empPasswordHash = await bcrypt.hash('Emp@123', 10);

  const users = [
    {
      id: 'usr_hr_01',
      employeeId: 'EMP-1001',
      name: 'Eleanor Vance',
      email: 'hr@company.com',
      password: passwordHash,
      role: ROLES.HR_ADMIN,
      department: 'Human Resources',
      position: 'HR Director',
      shiftStartTime: '09:00',
      shiftEndTime: '17:00',
      joinDate: '2024-01-15',
      isActive: true,
      leaveBalances: { ...DEFAULT_LEAVE_QUOTAS, UNPAID: 0 }
    },
    {
      id: 'usr_emp_01',
      employeeId: 'EMP-1002',
      name: 'John Doe',
      email: 'john.doe@company.com',
      password: empPasswordHash,
      role: ROLES.EMPLOYEE,
      department: 'Engineering',
      position: 'Senior Frontend Engineer',
      shiftStartTime: '09:00',
      shiftEndTime: '17:00',
      joinDate: '2024-03-01',
      isActive: true,
      leaveBalances: { ANNUAL: 13, CASUAL: 8.5, SICK: 9, UNPAID: 0 }
    },
    {
      id: 'usr_emp_02',
      employeeId: 'EMP-1003',
      name: 'Sarah Smith',
      email: 'sarah.smith@company.com',
      password: empPasswordHash,
      role: ROLES.EMPLOYEE,
      department: 'Design',
      position: 'Product Designer',
      shiftStartTime: '09:30',
      shiftEndTime: '17:30',
      joinDate: '2024-04-10',
      isActive: true,
      leaveBalances: { ANNUAL: 14, CASUAL: 9, SICK: 10, UNPAID: 0 }
    },
    {
      id: 'usr_emp_03',
      employeeId: 'EMP-1004',
      name: 'Alex Turner',
      email: 'alex.turner@company.com',
      password: empPasswordHash,
      role: ROLES.EMPLOYEE,
      department: 'Product',
      position: 'Technical Product Manager',
      shiftStartTime: '09:00',
      shiftEndTime: '17:00',
      joinDate: '2024-02-20',
      isActive: true,
      leaveBalances: { ANNUAL: 12, CASUAL: 7, SICK: 8, UNPAID: 0 }
    },
    {
      id: 'usr_emp_04',
      employeeId: 'EMP-1005',
      name: 'Emily Davis',
      email: 'emily.davis@company.com',
      password: empPasswordHash,
      role: ROLES.EMPLOYEE,
      department: 'QA & Testing',
      position: 'Lead QA Automation Engineer',
      shiftStartTime: '09:00',
      shiftEndTime: '17:00',
      joinDate: '2024-05-15',
      isActive: true,
      leaveBalances: { ANNUAL: 15, CASUAL: 10, SICK: 10, UNPAID: 0 }
    }
  ];

  for (const user of users) {
    const existing = await dbService.findById('users', user.id);
    if (!existing) {
      await dbService.create('users', user);
    }
  }

  const today = new Date();
  const sampleEmployees = users.filter(u => u.role === ROLES.EMPLOYEE);

  for (let i = 25; i >= 1; i--) {
    const dateObj = new Date(today);
    dateObj.setDate(today.getDate() - i);
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = dateObj.toISOString().split('T')[0];

    for (const emp of sampleEmployees) {
      const existing = await dbService.findOne('attendance', r => r.userId === emp.id && r.date === dateStr);
      if (existing) continue;

      let status = ATTENDANCE_STATUS.PRESENT;
      let checkInHour = 9;
      let checkInMin = Math.floor(Math.random() * 20);
      let durationDec = 8.2 + (Math.random() * 0.8 - 0.4);

      if ((i + emp.name.length) % 7 === 0) {
        status = ATTENDANCE_STATUS.LATE;
        checkInHour = 9;
        checkInMin = 40 + Math.floor(Math.random() * 15);
      } else if ((i + emp.name.length) % 11 === 0) {
        status = ATTENDANCE_STATUS.HALF_DAY;
        durationDec = 4.5;
      }

      const checkInDate = new Date(dateObj);
      checkInDate.setHours(checkInHour, checkInMin, 0, 0);

      const checkOutDate = new Date(checkInDate);
      checkOutDate.setMinutes(checkInDate.getMinutes() + Math.round(durationDec * 60));

      const calc = calculateWorkingHours(checkInDate.toISOString(), checkOutDate.toISOString(), 0);

      await dbService.create('attendance', {
        userId: emp.id,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.department,
        date: dateStr,
        checkInTime: checkInDate.toISOString(),
        checkOutTime: checkOutDate.toISOString(),
        workMode: (i % 3 === 0) ? WORK_MODE.WFH : WORK_MODE.OFFICE,
        location: (i % 3 === 0) ? 'Remote / Home' : 'HQ Floor 4',
        workingHours: calc.durationHours,
        overtimeHours: calc.overtimeHours,
        shortfallHours: calc.shortfallHours,
        formattedDuration: calc.formattedDuration,
        breakMinutes: 0,
        status,
        notes: status === ATTENDANCE_STATUS.LATE ? 'Traffic delay on highway' : 'Standard work shift'
      });
    }
  }

  const sampleLeaves = [
    {
      userId: 'usr_emp_01',
      employeeId: 'EMP-1002',
      employeeName: 'John Doe',
      department: 'Engineering',
      leaveType: LEAVE_TYPES.CASUAL,
      startDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      isHalfDay: false,
      requestedDays: 2,
      reason: 'Attending family wedding ceremony out of town.',
      status: LEAVE_STATUS.PENDING,
      appliedAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      userId: 'usr_emp_02',
      employeeId: 'EMP-1003',
      employeeName: 'Sarah Smith',
      department: 'Design',
      leaveType: LEAVE_TYPES.SICK,
      startDate: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
      endDate: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
      isHalfDay: false,
      requestedDays: 1,
      reason: 'Fever and medical check-up.',
      status: LEAVE_STATUS.APPROVED,
      appliedAt: new Date(Date.now() - 86400000 * 11).toISOString(),
      approvedBy: 'Eleanor Vance',
      approvedAt: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    {
      userId: 'usr_emp_03',
      employeeId: 'EMP-1004',
      name: 'Alex Turner',
      department: 'Product',
      leaveType: LEAVE_TYPES.ANNUAL,
      startDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      isHalfDay: false,
      requestedDays: 5,
      reason: 'Planned vacation.',
      status: LEAVE_STATUS.PENDING,
      appliedAt: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ];

  for (const lv of sampleLeaves) {
    const existing = await dbService.findOne('leaves', l => l.userId === lv.userId && l.startDate === lv.startDate);
    if (!existing) {
      await dbService.create('leaves', lv);
    }
  }

  console.log('Seed completed successfully!');
};

if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  runSeed().then(() => process.exit(0)).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
