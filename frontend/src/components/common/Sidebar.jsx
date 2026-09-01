import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { leaveApi } from '../../api/leave';
import {
  LayoutDashboard,
  CalendarCheck2,
  CalendarRange,
  Users,
  Clock,
  FileSpreadsheet,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';

export const Sidebar = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const isHR = user?.role === 'HR_ADMIN';
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  useEffect(() => {
    if (isHR) {
      leaveApi.getAllRequests({ status: 'PENDING' })
        .then(res => {
          if (res.success && res.leaves) {
            setPendingLeaveCount(res.leaves.length);
          }
        })
        .catch(() => {});
    }
  }, [isHR, activeTab]);

  const employeeNav = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Attendance History', icon: CalendarCheck2 },
    { id: 'leaves', label: 'Leave Requests', icon: CalendarRange },
  ];

  const hrNav = [
    { id: 'hr_dashboard', label: 'HR Overview', icon: LayoutDashboard },
    { id: 'hr_attendance', label: 'Attendance Logs', icon: FileSpreadsheet },
    { id: 'hr_leaves', label: 'Leave Management', icon: CheckCircle2, badge: pendingLeaveCount },
    { id: 'hr_employees', label: 'Employee Directory', icon: Users },
    { id: 'dashboard', label: 'My Punch Card', icon: Clock },
  ];

  const navItems = isHR ? hrNav : employeeNav;

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between">
      <div>
        <div className="px-3 mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isHR ? 'HR Administration' : 'Self Service'}
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const hasBadge = Boolean(item.badge && item.badge > 0);

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {hasBadge && (
                  <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                    isActive ? 'bg-white text-blue-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Shift Info Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/60">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <CalendarDays className="w-4 h-4 text-blue-600" />
          <span>Assigned Shift</span>
        </div>
        <div className="mt-2 text-xs text-slate-600">
          <div className="flex justify-between py-0.5">
            <span className="text-slate-500">Working Hours:</span>
            <span className="font-semibold text-slate-800">{user?.shiftStartTime || '09:00'} - {user?.shiftEndTime || '17:00'}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-slate-500">Grace Period:</span>
            <span className="font-semibold text-slate-800">30 mins</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
