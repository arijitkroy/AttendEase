import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { leaveApi } from '../api/leave';
import { LeaveBalanceCards } from '../components/leave/LeaveBalanceCards';
import { LeaveRequestModal } from '../components/leave/LeaveRequestModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  CalendarPlus,
  CheckCircle,
  XCircle,
  Filter,
  Calendar,
  AlertCircle,
  Clock,
  UserCheck
} from 'lucide-react';

export const LeaveManagement = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'HR_ADMIN';

  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState({});
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Apply Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Review (Approve/Reject) Modal for HR
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('APPROVE');
  const [reviewComment, setReviewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      if (isHR) {
        const params = {};
        if (statusFilter !== 'ALL') params.status = statusFilter;
        if (departmentFilter !== 'ALL') params.department = departmentFilter;
        const res = await leaveApi.getAllRequests(params);
        if (res.success) {
          setLeaves(res.leaves || []);
        }
      } else {
        const res = await leaveApi.getMyLeaves();
        if (res.success) {
          setLeaves(res.leaves || []);
          setBalances(res.balances || {});
        }
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter, departmentFilter, isHR]);

  const handleOpenReview = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewComment(action === 'APPROVE' ? 'Approved by HR' : 'Schedule conflict / Insufficient project coverage');
    setActionError(null);
    setReviewModalOpen(true);
  };

  const handleConfirmReview = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    try {
      setActionLoading(true);
      setActionError(null);
      if (reviewAction === 'APPROVE') {
        await leaveApi.approveLeave(selectedLeave.id, { comments: reviewComment });
      } else {
        await leaveApi.rejectLeave(selectedLeave.id, { rejectionReason: reviewComment });
      }
      setReviewModalOpen(false);
      await fetchLeaves();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isHR ? 'HR Governance Desk' : 'Personal Time Off'}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            {isHR ? 'Leave Approval & Quota Desk' : 'Leave Requests & Quotas'}
          </h1>
        </div>
        <div>
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Apply for Time Off</span>
          </button>
        </div>
      </div>

      {/* Leave Balances for Employees */}
      {!isHR && (
        <LeaveBalanceCards balances={balances} />
      )}

      {/* Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Filter Status:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {isHR && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
              <option value="QA & Testing">QA & Testing</option>
            </select>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{leaves.length}</span> request{leaves.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Leaves List Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                {isHR && <th className="pb-3 px-3">Employee</th>}
                <th className="pb-3 px-3">Leave Type</th>
                <th className="pb-3 px-3">Start Date</th>
                <th className="pb-3 px-3">End Date</th>
                <th className="pb-3 px-3">Duration</th>
                <th className="pb-3 px-3">Reason</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Reviewed By</th>
                {isHR && <th className="pb-3 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={isHR ? 9 : 7} className="py-8 text-center text-slate-400">
                    Loading leave requests...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={isHR ? 9 : 7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <CalendarDays className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">No leave requests found</p>
                        <p className="text-xs text-slate-500">
                          {isHR ? 'There are currently no leave requests matching your filters.' : 'You have not submitted any leave applications for this period.'}
                        </p>
                      </div>
                      {!isHR && (
                        <button
                          type="button"
                          onClick={() => setApplyModalOpen(true)}
                          className="mt-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                        >
                          Submit Leave Request
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                leaves.map((l) => {
                  const isPending = l.status === 'PENDING';
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                      {isHR && (
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-900">{l.employeeName}</div>
                          <div className="text-[11px] text-slate-400">{l.department} • {l.employeeId}</div>
                        </td>
                      )}
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        {l.leaveType}
                        {l.isHalfDay && <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Half-Day</span>}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">{l.startDate}</td>
                      <td className="py-3.5 px-3 text-slate-600">{l.endDate}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 mono">
                        {l.requestedDays} day{l.requestedDays !== 1 ? 's' : ''}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 max-w-[240px] truncate" title={l.reason}>
                        {l.reason}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={l.status} size="xs" />
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">
                        {l.approvedBy ? (
                          <div>
                            <span className="font-medium text-slate-700">{l.approvedBy}</span>
                            {l.reviewComments && <div className="text-[10px] text-slate-400">{l.reviewComments}</div>}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      {isHR && (
                        <td className="py-3.5 px-3 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenReview(l, 'APPROVE')}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleOpenReview(l, 'REJECT')}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">Processed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal for HR */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={reviewAction === 'APPROVE' ? 'Approve Leave Request' : 'Reject Leave Request'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmReview} className="space-y-4">
          {actionError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="font-semibold text-slate-800">{selectedLeave?.employeeName} ({selectedLeave?.employeeId})</div>
            <div className="text-slate-600">
              Type: <span className="font-bold">{selectedLeave?.leaveType}</span> • Duration: <span className="font-bold">{selectedLeave?.requestedDays} Days</span> ({selectedLeave?.startDate} to {selectedLeave?.endDate})
            </div>
            <div className="text-slate-500 italic mt-1">"{selectedLeave?.reason}"</div>
          </div>

          {reviewAction === 'APPROVE' && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Approving will automatically deduct {selectedLeave?.requestedDays} days from the employee's {selectedLeave?.leaveType} quota and flag attendance dates as On Leave.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {reviewAction === 'APPROVE' ? 'Approval Comments (Optional)' : 'Rejection Reason'}
            </label>
            <textarea
              rows="3"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required={reviewAction === 'REJECT'}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className={`px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-md transition-all ${
                reviewAction === 'APPROVE'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
              }`}
            >
              {actionLoading ? 'Processing...' : reviewAction === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Apply Leave Modal */}
      <LeaveRequestModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        balances={user?.leaveBalances || balances}
        onSuccess={fetchLeaves}
      />
    </div>
  );
};
