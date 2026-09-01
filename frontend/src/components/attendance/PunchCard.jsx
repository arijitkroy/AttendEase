import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../../api/attendance';
import { StatusBadge } from '../common/StatusBadge';
import {
  LogIn,
  LogOut,
  Building,
  Home,
  MapPin,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Coffee
} from 'lucide-react';

export const PunchCard = ({ onAttendanceChange }) => {
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Form states
  const [workMode, setWorkMode] = useState('OFFICE');
  const [location, setLocation] = useState('Main HQ');
  const [notes, setNotes] = useState('');
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchTodayStatus = async () => {
    try {
      setLoading(true);
      const res = await attendanceApi.getTodayStatus();
      setTodayData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  // Timer logic for active shift
  useEffect(() => {
    let interval = null;
    if (todayData?.status === 'CHECKED_IN' && todayData?.attendance?.checkInTime) {
      const startTime = new Date(todayData.attendance.checkInTime).getTime();
      
      const updateTimer = () => {
        const now = Date.now();
        const diffInSecs = Math.max(0, Math.floor((now - startTime) / 1000));
        setElapsedSeconds(diffInSecs);
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [todayData]);

  const formatTimer = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setMessage(null);
      const res = await attendanceApi.checkIn({ workMode, location, notes });
      setMessage(res.message);
      await fetchTodayStatus();
      if (onAttendanceChange) onAttendanceChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setMessage(null);
      const res = await attendanceApi.checkOut({ notes, breakMinutes: Number(breakMinutes) || 0 });
      setMessage(res.message);
      await fetchTodayStatus();
      if (onAttendanceChange) onAttendanceChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const attendance = todayData?.attendance;
  const isCheckedIn = todayData?.status === 'CHECKED_IN';
  const isCheckedOut = todayData?.status === 'CHECKED_OUT';
  const isOnLeave = todayData?.status === 'ON_LEAVE';

  const progressPercent = Math.min(100, Math.round((elapsedSeconds / (8 * 3600)) * 100));

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Console</span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">Today's Punch Station</h2>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={todayData?.status || 'NOT_CHECKED_IN'} size="lg" />
        </div>
      </div>

      {message && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isOnLeave ? (
        <div className="my-8 text-center py-6 px-4 rounded-2xl bg-blue-50/60 border border-blue-100">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">You are on Approved Leave Today</h3>
          <p className="text-xs text-slate-600 mt-1">
            Leave Type: <span className="font-semibold">{todayData?.leave?.leaveType}</span> • {todayData?.leave?.reason}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Timer / Summary Box */}
          <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg">
            <div>
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Active Session Timer</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="mt-3 text-4xl font-extrabold tracking-tight mono text-white">
                {isCheckedIn ? formatTimer(elapsedSeconds) : isCheckedOut ? attendance?.formattedDuration || '0h 0m' : '00:00:00'}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {isCheckedIn
                  ? 'Shift in progress (8h target)'
                  : isCheckedOut
                  ? 'Daily shift completed'
                  : 'Ready to check in'}
              </p>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                <span>Progress to 8 Hours</span>
                <span>{isCheckedOut ? '100%' : `${progressPercent}%`}</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${isCheckedOut ? 100 : progressPercent}%` }}
                />
              </div>

              {attendance && (
                <div className="mt-4 pt-4 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Check-In:</span>
                    <p className="font-semibold text-slate-200">
                      {attendance.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Check-Out:</span>
                    <p className="font-semibold text-slate-200">
                      {attendance.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Form */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {!isCheckedIn && !isCheckedOut && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Select Work Mode</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'OFFICE', label: 'Office', icon: Building },
                      { id: 'WORK_FROM_HOME', label: 'Remote / WFH', icon: Home },
                      { id: 'ON_FIELD', label: 'On Field', icon: MapPin },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = workMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setWorkMode(mode.id)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-500/20 font-semibold'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Work Notes / Location Tag (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. In Floor 3 Meeting Room / Working on Q3 Roadmap"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleCheckIn}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{actionLoading ? 'Recording Check-In...' : 'Punch In / Start Shift'}</span>
                </button>
              </div>
            )}

            {isCheckedIn && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs">
                  <div className="font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Currently Checked In ({attendance?.workMode || 'Office'})
                  </div>
                  <p className="mt-1 text-slate-600">Started at {new Date(attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Break Minutes</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={breakMinutes}
                        onChange={(e) => setBreakMinutes(e.target.value)}
                        placeholder="0"
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <Coffee className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Checkout Notes</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Daily tasks completed"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleCheckOut}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-sm shadow-md shadow-rose-500/20 transition-all disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{actionLoading ? 'Recording Check-Out...' : 'Punch Out / End Shift'}</span>
                </button>
              </div>
            )}

            {isCheckedOut && (
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200/90 text-center space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 tracking-tight">Shift Completed for Today</h4>
                <p className="text-xs text-slate-600">
                  Total Time: <span className="font-bold text-slate-900 mono">{attendance?.formattedDuration}</span> ({attendance?.workingHours} hrs)
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  {attendance?.overtimeHours > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      +{attendance.overtimeHours}h Overtime Earned
                    </span>
                  )}
                  {attendance?.shortfallHours > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      {attendance.shortfallHours}h Under Standard Shift
                    </span>
                  )}
                  {attendance?.breakMinutes > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200/70 text-slate-700">
                      {attendance.breakMinutes}m break
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
