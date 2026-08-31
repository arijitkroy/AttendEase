import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { employeeApi } from '../../api/employees';
import { AlertCircle } from 'lucide-react';

export const EmployeeModal = ({ isOpen, onClose, employee, onSuccess }) => {
  const isEditing = Boolean(employee);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [position, setPosition] = useState('Software Engineer');
  const [role, setRole] = useState('EMPLOYEE');
  const [shiftStartTime, setShiftStartTime] = useState('09:00');
  const [shiftEndTime, setShiftEndTime] = useState('17:00');
  const [annualLeave, setAnnualLeave] = useState(15);
  const [casualLeave, setCasualLeave] = useState(10);
  const [sickLeave, setSickLeave] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setEmail(employee.email || '');
      setEmployeeId(employee.employeeId || '');
      setDepartment(employee.department || 'Engineering');
      setPosition(employee.position || 'Software Engineer');
      setRole(employee.role || 'EMPLOYEE');
      setShiftStartTime(employee.shiftStartTime || '09:00');
      setShiftEndTime(employee.shiftEndTime || '17:00');
      setAnnualLeave(employee.leaveBalances?.ANNUAL ?? 15);
      setCasualLeave(employee.leaveBalances?.CASUAL ?? 10);
      setSickLeave(employee.leaveBalances?.SICK ?? 10);
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setEmployeeId('EMP-' + Math.floor(1000 + Math.random() * 9000));
      setDepartment('Engineering');
      setPosition('Software Engineer');
      setRole('EMPLOYEE');
      setShiftStartTime('09:00');
      setShiftEndTime('17:00');
      setAnnualLeave(15);
      setCasualLeave(10);
      setSickLeave(10);
    }
  }, [employee, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        name,
        email,
        employeeId,
        department,
        position,
        role,
        shiftStartTime,
        shiftEndTime,
        leaveBalances: {
          ANNUAL: Number(annualLeave),
          CASUAL: Number(casualLeave),
          SICK: Number(sickLeave),
          UNPAID: employee?.leaveBalances?.UNPAID || 0
        }
      };

      if (password) {
        payload.password = password;
      }

      if (isEditing) {
        await employeeApi.updateEmployee(employee.id, payload);
      } else {
        if (!password) {
          setError('Password is required for new employees');
          setLoading(false);
          return;
        }
        await employeeApi.createEmployee(payload);
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Employee Profile' : 'Add New Employee'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEditing}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Employee ID</label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">System Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="EMPLOYEE">Employee (Self-Service)</option>
              <option value="HR_ADMIN">HR Administrator</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
              <option value="QA & Testing">QA & Testing</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Position / Title</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Shift Start Time</label>
            <input
              type="time"
              value={shiftStartTime}
              onChange={(e) => setShiftStartTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Shift End Time</label>
            <input
              type="time"
              value={shiftEndTime}
              onChange={(e) => setShiftEndTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {isEditing ? 'New Password (Leave blank to keep current)' : 'Account Password'}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEditing ? '••••••••' : 'Enter strong password'}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Leave Quotas */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 mb-2">Assigned Leave Quotas (Days)</label>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <span className="text-[11px] text-slate-500">Annual</span>
              <input
                type="number"
                min="0"
                value={annualLeave}
                onChange={(e) => setAnnualLeave(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-500">Casual</span>
              <input
                type="number"
                min="0"
                value={casualLeave}
                onChange={(e) => setCasualLeave(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-500">Sick</span>
              <input
                type="number"
                min="0"
                value={sickLeave}
                onChange={(e) => setSickLeave(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
