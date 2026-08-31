import React, { useState, useEffect } from 'react';
import { employeeApi } from '../api/employees';
import { EmployeeModal } from '../components/hr/EmployeeModal';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  UserPlus,
  Search,
  Filter,
  Edit,
  Mail,
  Briefcase,
  Calendar,
  Clock,
  Trash2,
  ShieldCheck,
  Palmtree
} from 'lucide-react';

export const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (department !== 'ALL') params.department = department;

      const res = await employeeApi.getEmployees(params);
      if (res.success) {
        setEmployees(res.employees || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [department]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setModalOpen(true);
  };

  const handleEdit = (emp) => {
    setSelectedEmployee(emp);
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to deactivate employee ${name}?`)) {
      try {
        await employeeApi.deleteEmployee(id);
        await fetchEmployees();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workforce Management</span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-0.5">Employee Directory</h1>
        </div>
        <div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, employee ID..."
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

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            Search
          </button>
        </form>

        <div className="text-xs text-slate-500 font-medium">
          Total Employees: <span className="font-bold text-slate-800">{employees.length}</span>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            Loading employee directory...
          </div>
        ) : employees.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            No employees found.
          </div>
        ) : (
          employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
                      {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        {emp.name}
                        {emp.role === 'HR_ADMIN' && <ShieldCheck className="w-3.5 h-3.5 text-blue-600" title="HR Admin" />}
                      </h3>
                      <p className="text-xs text-slate-500">{emp.position}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    emp.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {emp.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{emp.department} • <span className="mono font-semibold">{emp.employeeId}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Shift: {emp.shiftStartTime || '09:00'} - {emp.shiftEndTime || '17:00'}</span>
                  </div>
                </div>

                {/* Leave Balances Quota Pills */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Remaining Leaves</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-1.5">
                      <span className="text-[10px] text-blue-600 font-semibold">Annual</span>
                      <p className="font-bold text-slate-900 mono">{emp.leaveBalances?.ANNUAL ?? 0}</p>
                    </div>
                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-1.5">
                      <span className="text-[10px] text-emerald-600 font-semibold">Casual</span>
                      <p className="font-bold text-slate-900 mono">{emp.leaveBalances?.CASUAL ?? 0}</p>
                    </div>
                    <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-1.5">
                      <span className="text-[10px] text-amber-600 font-semibold">Sick</span>
                      <p className="font-bold text-slate-900 mono">{emp.leaveBalances?.SICK ?? 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleEdit(emp)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                {emp.role !== 'HR_ADMIN' && emp.isActive !== false && (
                  <button
                    onClick={() => handleDelete(emp.id, emp.name)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Deactivate Employee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={selectedEmployee}
        onSuccess={fetchEmployees}
      />
    </div>
  );
};
