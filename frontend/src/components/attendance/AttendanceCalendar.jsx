import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const AttendanceCalendar = ({ records = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayRecord, setSelectedDayRecord] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayRecord(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayRecord(null);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const recordMap = {};
    records.forEach(r => {
      if (r.date) {
        recordMap[r.date] = r;
      }
    });

    const dayList = [];
    for (let i = 0; i < firstDayIndex; i++) {
      dayList.push({ day: null, isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(year, month, d);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const record = recordMap[formattedDate];

      dayList.push({
        day: d,
        dateStr: formattedDate,
        isCurrentMonth: true,
        isWeekend,
        record
      });
    }
    return dayList;
  }, [records, month, year]);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Visual Schedule</span>
          <h3 className="text-lg font-bold text-slate-900">
            {monthNames[month]} {year}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-all shadow-sm hover:shadow"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-all shadow-sm hover:shadow"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((wd, i) => (
          <div key={wd} className={`text-[11px] font-bold uppercase tracking-wider py-1 ${i === 0 || i === 6 ? 'text-rose-400' : 'text-slate-400'}`}>
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((item, idx) => {
          if (!item.isCurrentMonth) {
            return <div key={`empty-${idx}`} className="h-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-100" />;
          }

          const { day, isWeekend, record, dateStr } = item;
          const isSelected = selectedDayRecord?.dateStr === dateStr;
          const todayISO = new Date().toISOString().split('T')[0];
          const isToday = dateStr === todayISO;

          let bgClass = 'bg-white hover:border-blue-400';
          let borderClass = isToday ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm' : 'border-slate-200/80';

          if (isWeekend) {
            bgClass = 'bg-slate-50/70 text-slate-400';
          } else if (record) {
            if (record.status === 'PRESENT') bgClass = 'bg-emerald-50/40 hover:bg-emerald-50/70';
            else if (record.status === 'LATE') bgClass = 'bg-amber-50/40 hover:bg-amber-50/70';
            else if (record.status === 'HALF_DAY') bgClass = 'bg-orange-50/40 hover:bg-orange-50/70';
            else if (record.status === 'ON_LEAVE') bgClass = 'bg-blue-50/40 hover:bg-blue-50/70';
          }

          if (isSelected) {
            borderClass = 'border-blue-600 ring-2 ring-blue-500/40 shadow-md';
          }

          return (
            <button
              key={`day-${day}`}
              type="button"
              onClick={() => setSelectedDayRecord(item)}
              className={`h-20 p-2 rounded-2xl border text-left flex flex-col justify-between transition-all ${bgClass} ${borderClass}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-bold ${isWeekend ? 'text-slate-400' : isToday ? 'text-blue-600' : 'text-slate-800'}`}>
                    {day}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" title="Today" />
                  )}
                </div>
                {record?.workingHours > 0 && (
                  <span className="text-[10px] mono font-medium text-slate-500">
                    {record.workingHours}h
                  </span>
                )}
              </div>

              <div>
                {isWeekend ? (
                  <span className="text-[10px] text-slate-400">Off</span>
                ) : record ? (
                  <StatusBadge status={record.status} size="xs" />
                ) : (
                  <span className="text-[10px] text-slate-300">--</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Details Modal/Drawer */}
      {selectedDayRecord && (
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              Day Details: {selectedDayRecord.dateStr}
            </h4>
            <button
              onClick={() => setSelectedDayRecord(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Dismiss
            </button>
          </div>

          {selectedDayRecord.isWeekend ? (
            <p className="text-xs text-slate-500">Weekend / Non-working day.</p>
          ) : selectedDayRecord.record ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Check-In</span>
                <p className="font-semibold text-slate-800">
                  {selectedDayRecord.record.checkInTime ? new Date(selectedDayRecord.record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Check-Out</span>
                <p className="font-semibold text-slate-800">
                  {selectedDayRecord.record.checkOutTime ? new Date(selectedDayRecord.record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Working Hours</span>
                <p className="font-semibold text-slate-800">{selectedDayRecord.record.formattedDuration || `${selectedDayRecord.record.workingHours}h`}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Status</span>
                <div className="mt-0.5">
                  <StatusBadge status={selectedDayRecord.record.status} size="xs" />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No attendance punch recorded for this date.</p>
          )}
        </div>
      )}
    </div>
  );
};
