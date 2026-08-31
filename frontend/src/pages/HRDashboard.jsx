import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../api/attendance';
import { leaveApi } from '../api/leave';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Users,
  Clock,
  UserX,
  Palmtree,
  AlertTriangle,
  FileCheck2,
  Building,
  Home,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';

export const HRDashboard = ({ onNavigateTab }) => {
  const [metrics, setMetrics] = useState(null);
  const [todayRecords, setTodayRecords] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metRes, lveRes] = await Promise.all([
        attendanceApi.getHRMetrics(),
        leaveApi.getAllRequests({ status: 'PENDING' })
      ]);

      if (metRes.success) {
        setMetrics(metRes.metrics);
        setTodayRecords(metRes.todayLiveRecords || []);
      }
      if (lveRes.success) {
        setPendingLeaves(lveRes.leaves || []);
      }
    } catch (err) {
      console.error('Error loading HR data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFastApprove = async (id) => {
    try {
      await leaveApi.approveLeave(id, { comments: 'Approved via Quick Actions' });
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFastReject = async (id) => {
    try {
      await leaveApi.rejectLeave(id, { rejectionReason: 'Rejected via Quick Actions' });
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Executive Overview</span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-0.5">HR Operations Command Desk</h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={attendanceApi.exportCSVUrl}
            download
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 text-xs shadow-sm transition-all"
          >
            <span>Export Master CSV Report</span>
          </a>
        </div>
      </div>

      {/* Headcount & Live Status Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Headcount"
          value={metrics?.totalEmployees ?? 0}
          subtitle="Active workforce"
          icon={Users}
          color="slate"
        />
        <StatCard
          title="Present Today"
          value={metrics?.presentTodayCount ?? 0}
          subtitle={`${metrics?.officeTodayCount ?? 0} Office • ${metrics?.wfhTodayCount ?? 0} Remote`}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Currently Active"
          value={metrics?.checkedInCount ?? 0}
          subtitle="Clocked in right now"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Late Arrival"
          value={metrics?.lateTodayCount ?? 0}
          subtitle="Past shift grace time"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="On Leave"
          value={metrics?.onLeaveTodayCount ?? 0}
          subtitle="Approved absences"
          icon={Palmtree}
          color="purple"
        />
        <StatCard
          title="Absent (No Punch)"
          value={metrics?.absentTodayCount ?? 0}
          subtitle="Unaccounted today"
          icon={UserX}
          color="rose"
        />
      </div>

      {/* Two Column Section: Live Check-Ins & Department Attendance Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Attendance Activity */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Floor Feed</span>
                <h3 className="text-base font-bold text-slate-900">Today's Live Punch Logs</h3>
              </div>
              <button
                onClick={() => onNavigateTab('hr_attendance')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View Full Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 px-3">Employee</th>
                    <th className="pb-3 px-3">Check-In</th>
                    <th className="pb-3 px-3">Check-Out</th>
                    <th className="pb-3 px-3">Duration</th>
                    <th className="pb-3 px-3">Mode</th>
                    <th className="pb-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayRecords.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        No employees checked in yet today.
                      </td>
                    </tr>
                  ) : (
                    todayRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{r.employeeName}</div>
                          <div className="text-[11px] text-slate-400">{r.department} • {r.employeeId}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (
                            <span className="text-indigo-600 font-semibold animate-pulse">Active Now</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800 mono">
                          {r.formattedDuration || `${r.workingHours || 0}h`}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={r.workMode} size="xs" />
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={r.status} size="xs" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Department Health & Pending Leave Desk */}
        <div className="lg:col-span-5 space-y-6">
          {/* Department Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance by Team</span>
            <h3 className="text-base font-bold text-slate-900 mb-4">Department Attendance Rate</h3>

            <div className="space-y-4">
              {metrics?.departmentStats && metrics.departmentStats.length > 0 ? (
                metrics.departmentStats.map((dept) => (
                  <div key={dept.department}>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>{dept.department}</span>
                      <span className="mono font-bold text-slate-900">{dept.present} / {dept.total} ({dept.rate}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${dept.rate >= 80 ? 'bg-emerald-500' : dept.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${dept.rate}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No department statistics available.</p>
              )}
            </div>
          </div>

          {/* Pending Leave Requests Quick Action */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Requires Attention</span>
                <h3 className="text-base font-bold text-slate-900">Pending Leave Requests ({pendingLeaves.length})</h3>
              </div>
              <button
                onClick={() => onNavigateTab('hr_leaves')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Desk
              </button>
            </div>

            <div className="space-y-3">
              {pendingLeaves.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1 opacity-70" />
                  All leave requests are up to date!
                </div>
              ) : (
                pendingLeaves.slice(0, 3).map((lv) => (
                  <div key={lv.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{lv.employeeName}</div>
                      <div className="text-[11px] text-slate-500">
                        {lv.leaveType} • {lv.requestedDays} day(s) ({lv.startDate})
                      </div>
                      <div className="text-[11px] text-slate-400 italic truncate max-w-[180px]">"{lv.reason}"</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleFastApprove(lv.id)}
                        className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFastReject(lv.id)}
                        className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
