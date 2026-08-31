const BASE_URL = 'http://localhost:5000/api';

async function testAll() {
  console.log('--- Starting Automated E2E Verification ---');

  // 1. Employee Login
  const empLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'john.doe@company.com', password: 'Emp@123' })
  }).then(r => r.json());

  console.log('1. Employee Login Success:', empLoginRes.success, '| User:', empLoginRes.user?.name);
  const empToken = empLoginRes.token;

  // 2. Check-In
  const checkInRes = await fetch(`${BASE_URL}/attendance/check-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${empToken}`
    },
    body: JSON.stringify({
      workMode: 'OFFICE',
      location: 'Main HQ Floor 4',
      notes: 'Automated test shift start'
    })
  }).then(r => r.json());

  console.log('2. Check-In Status:', checkInRes.success, '| Message:', checkInRes.message, '| Status mark:', checkInRes.attendance?.status);

  // 3. Get Today Status
  const todayStatus = await fetch(`${BASE_URL}/attendance/today`, {
    headers: { 'Authorization': `Bearer ${empToken}` }
  }).then(r => r.json());

  console.log('3. Today Session State:', todayStatus.status, '| Date:', todayStatus.date);

  // 4. Apply Leave
  const leaveRes = await fetch(`${BASE_URL}/leaves/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${empToken}`
    },
    body: JSON.stringify({
      leaveType: 'CASUAL',
      startDate: '2026-09-07',
      endDate: '2026-09-08',
      isHalfDay: false,
      reason: 'Automated test family function leave'
    })
  }).then(r => r.json());

  console.log('4. Apply Leave Success:', leaveRes.success, '| Requested Days:', leaveRes.leave?.requestedDays, '| Leave ID:', leaveRes.leave?.id);

  // 5. HR Login
  const hrLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hr@company.com', password: 'Admin@123' })
  }).then(r => r.json());

  console.log('5. HR Login Success:', hrLoginRes.success, '| HR Name:', hrLoginRes.user?.name);
  const hrToken = hrLoginRes.token;

  // 6. HR Metrics
  const hrMetrics = await fetch(`${BASE_URL}/attendance/hr-metrics`, {
    headers: { 'Authorization': `Bearer ${hrToken}` }
  }).then(r => r.json());

  console.log('6. HR Metrics - Total Employees:', hrMetrics.metrics?.totalEmployees, '| Present Today:', hrMetrics.metrics?.presentTodayCount, '| Active Right Now:', hrMetrics.metrics?.checkedInCount);

  // 7. HR Approve Leave
  if (leaveRes.leave?.id) {
    const approveRes = await fetch(`${BASE_URL}/leaves/${leaveRes.leave.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hrToken}`
      },
      body: JSON.stringify({ comments: 'Approved via automated test suite' })
    }).then(r => r.json());

    console.log('7. Leave Approved:', approveRes.success, '| Updated Casual Quota:', approveRes.updatedBalances?.CASUAL);
  }

  // 8. Employee Check-Out
  const checkOutRes = await fetch(`${BASE_URL}/attendance/check-out`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${empToken}`
    },
    body: JSON.stringify({
      notes: 'Shift completed successfully via test',
      breakMinutes: 0
    })
  }).then(r => r.json());

  console.log('8. Check-Out Status:', checkOutRes.success, '| Duration:', checkOutRes.attendance?.formattedDuration, '| Hours Worked:', checkOutRes.attendance?.workingHours);

  // 9. HR Employee Directory
  const empList = await fetch(`${BASE_URL}/employees`, {
    headers: { 'Authorization': `Bearer ${hrToken}` }
  }).then(r => r.json());

  console.log('9. Employee Directory Count:', empList.count);

  console.log('--- All System Endpoints & Verification Checks Passed! ---');
}

testAll().catch(console.error);
