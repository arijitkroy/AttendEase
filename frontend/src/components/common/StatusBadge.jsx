import React from 'react';

export const StatusBadge = ({ status, size = 'sm' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'PRESENT':
        return { label: 'Present', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10' };
      case 'LATE':
        return { label: 'Late', bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10' };
      case 'HALF_DAY':
        return { label: 'Half Day', bg: 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/10' };
      case 'ABSENT':
        return { label: 'Absent', bg: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10' };
      case 'ON_LEAVE':
        return { label: 'On Leave', bg: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10' };
      case 'PENDING':
        return { label: 'Pending', bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10' };
      case 'APPROVED':
        return { label: 'Approved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10' };
      case 'REJECTED':
        return { label: 'Rejected', bg: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10' };
      case 'CHECKED_IN':
        return { label: 'Active Shift', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10 animate-pulse' };
      case 'CHECKED_OUT':
        return { label: 'Completed', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'WORK_FROM_HOME':
        return { label: 'WFH', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'OFFICE':
        return { label: 'Office', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'ON_FIELD':
        return { label: 'Field', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
      default:
        return { label: status || 'Unknown', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const { label, bg } = getBadgeConfig();
  const sizeClasses = size === 'xs' ? 'px-1.5 py-0.5 text-[11px]' : size === 'lg' ? 'px-3 py-1.5 text-sm font-semibold' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border shadow-sm ${bg} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {label}
    </span>
  );
};
