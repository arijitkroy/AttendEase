import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../api/attendance';
import { StatusBadge } from '../components/common/StatusBadge';
import { StatCard } from '../components/common/StatCard';
import {
  Download,
  Filter,
  Search,
  Calendar,
  Clock,
  Flame,
  Award,
  CalendarCheck2
} from 'lucide-react';

export const AttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedMonth && selectedYear) {
        params.month = selectedMonth;
        params.year = selectedYear;
      }
      if (selectedStatus && selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }

      const res = await attendanceApi.getMyHistory(params);
      if (res.success) {
        setRecords(res.records || []);
        setStats(res.stats || null);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedMonth, selectedYear, selectedStatus]);

  const months = [
    { num: 1, name: 'January' },
    { num: 2, name: 'February' },
    { num: 3, name: 'March' },
    { num: 4, name: 'April' },
    { num: 5, name: 'May' },
    { num: 6, name: 'June' },
    { num: 7, name: 'July' },
    { num: 8, name: 'August' },
    { num: 9, name: 'September' },
    { num: 10, name: 'October' },
    { num: 11, name: 'November' },
    { num: 12, name: 'December' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Historical Logs</span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-0.5">My Attendance Records</h1>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Working Hours"
          value={`${stats?.totalWorkingHours ?? 0}h`}
          subtitle={`Avg ${stats?.averageDailyHours ?? 0}h per day`}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Overtime Logged"
          value={`+${stats?.totalOvertimeHours ?? 0}h`}
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
          title="Days Present"
          value={`${stats?.presentDays ?? 0}`}
          subtitle={`${stats?.halfDays ?? 0} half-days`}
          icon={CalendarCheck2}
          color="slate"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Filter:</span>
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {months.map(m => (
              <option key={m.num} value={m.num}>{m.name}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="ABSENT">Absent</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{records.length}</span> entries
        </div>
      </div>

      {/* Detailed Records Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="table-scroll-container">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Check-In</th>
                <th className="pb-3 px-3">Check-Out</th>
                <th className="pb-3 px-3">Gross / Break</th>
                <th className="pb-3 px-3">Net Working Hours</th>
                <th className="pb-3 px-3">Overtime</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Mode</th>
                <th className="pb-3 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    Loading attendance history...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    No attendance records found matching filters.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id || r.date} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{r.date}</td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {r.breakMinutes ? `${r.breakMinutes}m break` : 'No break'}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 mono">
                      {r.formattedDuration || `${r.workingHours || 0}h`}
                    </td>
                    <td className="py-3.5 px-3">
                      {r.overtimeHours > 0 ? (
                        <span className="text-emerald-600 font-semibold mono">+{r.overtimeHours}h</span>
                      ) : (
                        <span className="text-slate-400 mono">0h</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={r.status} size="xs" />
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={r.workMode} size="xs" />
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 max-w-[200px] truncate" title={r.notes}>
                      {r.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
