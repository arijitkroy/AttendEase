import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceApi } from '../api/attendance';
import { leaveApi } from '../api/leave';
import { PunchCard } from '../components/attendance/PunchCard';
import { AttendanceCalendar } from '../components/attendance/AttendanceCalendar';
import { LeaveBalanceCards } from '../components/leave/LeaveBalanceCards';
import { LeaveRequestModal } from '../components/leave/LeaveRequestModal';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Clock,
  Flame,
  CheckCircle,
  Award,
  CalendarPlus,
  ArrowRight
} from 'lucide-react';

export const EmployeeDashboard = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [leaveData, setLeaveData] = useState({ balances: {}, leaves: [] });
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [attRes, lveRes] = await Promise.all([
        attendanceApi.getMyHistory({}),
        leaveApi.getMyLeaves()
      ]);

      if (attRes.success) {
        setRecords(attRes.records || []);
        setStats(attRes.stats || null);
      }
      if (lveRes.success) {
        setLeaveData({
          balances: lveRes.balances || {},
          leaves: lveRes.leaves || []
        });
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const recentRecords = records.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-md shadow-blue-500/15">
        <div>
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Employee Workspace</span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">Welcome back, {user?.name}</h1>
          <p className="text-xs text-blue-100 mt-1">
            {user?.department} • Shift: {user?.shiftStartTime || '09:00'} to {user?.shiftEndTime || '17:00'} (8h standard)
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-semibold text-xs shadow-sm transition-all"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Apply for Time Off</span>
          </button>
        </div>
      </div>

      {/* Main Punch Station Card */}
      <PunchCard onAttendanceChange={loadData} />

      {/* Monthly Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Hours (Month)"
          value={`${stats?.totalWorkingHours ?? 0} hrs`}
          subtitle={`Avg ${stats?.averageDailyHours ?? 0} hrs / workday`}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Overtime Logged"
          value={`+${stats?.totalOvertimeHours ?? 0} hrs`}
          subtitle="Hours exceeding standard shift"
          icon={Flame}
          color="emerald"
        />
        <StatCard
          title="Punctuality Score"
          value={`${stats?.punctualityScore ?? 100}%`}
          subtitle={`${stats?.lateDays ?? 0} late marks recorded`}
          icon={Award}
          color={stats?.punctualityScore < 80 ? 'amber' : 'purple'}
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats?.attendancePercentage ?? 0}%`}
          subtitle={`${stats?.presentDays ?? 0} active days present`}
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* Leave Balances */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leave Allowances</span>
            <h3 className="text-base font-bold text-slate-900">Your Time-Off Balances</h3>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('leaves')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <LeaveBalanceCards balances={leaveData.balances} />
      </div>

      {/* Monthly Interactive Calendar */}
      <AttendanceCalendar records={records} />

      {/* Recent Activity Mini Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Logs</span>
            <h3 className="text-base font-bold text-slate-900">Latest Attendance Punches</h3>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('history')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Check-In</th>
                <th className="pb-3 px-3">Check-Out</th>
                <th className="pb-3 px-3">Net Duration</th>
                <th className="pb-3 px-3">Overtime</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Work Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-400">
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                recentRecords.map((r) => (
                  <tr key={r.id || r.date} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">{r.date}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800 mono">
                      {r.formattedDuration || `${r.workingHours || 0}h`}
                    </td>
                    <td className="py-3 px-3">
                      {r.overtimeHours > 0 ? (
                        <span className="text-emerald-600 font-semibold mono">+{r.overtimeHours}h</span>
                      ) : (
                        <span className="text-slate-400 mono">0h</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={r.status} size="xs" />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={r.workMode} size="xs" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Application Modal */}
      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        balances={leaveData.balances}
        onSuccess={loadData}
      />
    </div>
  );
};
