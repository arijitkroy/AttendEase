import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../api/attendance';
import { StatusBadge } from '../components/common/StatusBadge';
import { AdjustAttendanceModal } from '../components/hr/AdjustAttendanceModal';
import {
  Download,
  Filter,
  Search,
  Edit,
  Calendar,
  Building,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

export const HRAttendanceLogs = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (department !== 'ALL') params.department = department;
      if (status !== 'ALL') params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await attendanceApi.getAllLogs(params);
      if (res.success) {
        setRecords(res.records || []);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [department, status, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const openAdjustment = (record) => {
    setSelectedRecord(record);
    setAdjustModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company-Wide Records</span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-0.5">Master Attendance Logs</h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={attendanceApi.exportCSVUrl}
            download
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3.5">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Employee name, ID, or title..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Product">Product</option>
            <option value="QA & Testing">QA & Testing</option>
            <option value="Human Resources">Human Resources</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="ABSENT">Absent</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-slate-400 font-semibold">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-slate-400 font-semibold">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Employee</th>
                <th className="pb-3 px-3">Check-In</th>
                <th className="pb-3 px-3">Check-Out</th>
                <th className="pb-3 px-3">Gross / Break</th>
                <th className="pb-3 px-3">Working Hours</th>
                <th className="pb-3 px-3">Overtime</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Work Mode</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-400">
                    Loading logs...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-400">
                    No attendance records found matching filters.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id || `${r.userId}-${r.date}`} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{r.date}</td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900">{r.employeeName}</div>
                      <div className="text-[11px] text-slate-400">{r.department} • {r.employeeId}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (
                        r.checkInTime ? <span className="text-indigo-600 font-semibold">Active</span> : '--:--'
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {r.breakMinutes ? `${r.breakMinutes}m` : '0m'}
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
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => openAdjustment(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                        title="Adjust Attendance Record"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdjustAttendanceModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        record={selectedRecord}
        onSuccess={fetchLogs}
      />
    </div>
  );
};
