import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend = null, loading = false }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-slate-200 rounded-md" />
          <div className="w-10 h-10 rounded-xl bg-slate-100" />
        </div>
        <div className="mt-3">
          <div className="h-7 w-16 bg-slate-200 rounded-md" />
        </div>
        <div className="mt-2">
          <div className="h-2.5 w-28 bg-slate-100 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm card-hover-lift">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.positive ? '↑' : '↓'} {trend.text}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
