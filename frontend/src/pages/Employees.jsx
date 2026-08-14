import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Edit2, Trash2, Users, Search, Filter, X, Camera,
  Mail, Phone, Calendar, Briefcase, Zap, Building2, UserPlus,
  ShieldCheck, ArrowRight
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import RegisterFaceModal from '../components/RegisterFaceModal';
import LoadingSpinner, { SkeletonTable } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../services/employeeService';
import { useAuth } from '../context/AuthContext';

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const [year, month, day] = cleanStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const DEPT_COLORS = {
  Engineering: 'bg-[#e7f0fa] text-[#2563eb] border-[#dde5ec]',
  Marketing: 'bg-pink-50 text-pink-700 border-pink-200',
  Sales: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  HR: 'bg-violet-50 text-violet-700 border-violet-200',
  Finance: 'bg-amber-50 text-amber-700 border-amber-200',
  Design: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Operations: 'bg-orange-50 text-orange-700 border-orange-200',
  default: 'bg-[#f1f5f8] text-slate-700 border-[#dde5ec]',
};

const getDeptColor = (dept) => DEPT_COLORS[dept] || DEPT_COLORS.default;

const AVATAR_GRADIENTS = [
  'bg-gradient-to-tr from-[#2563eb] to-[#38bdf8]',
  'bg-gradient-to-tr from-[#2563eb] to-[#3b82f6]',
  'bg-gradient-to-tr from-indigo-600 to-[#2563eb]',
  'bg-gradient-to-tr from-teal-600 to-emerald-500',
  'bg-gradient-to-tr from-[#2563eb] to-[#60a5fa]',
];

const getAvatarGradient = (name) => {
  const hash = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
};

const Employees = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [registeringFaceEmployee, setRegisteringFaceEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departmentsList, setDepartmentsList] = useState([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    matricule: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department_id: '',
    position: '',
    hire_date: '',
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees({ page, limit, search: searchTerm });
      setEmployees(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      if (response.data.success) {
        setDepartmentsList(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchEmployees();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      matricule: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department_id: '',
      position: '',
      hire_date: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      ...employee,
      department_id: employee.department_id || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee record?')) {
      try {
        await deleteEmployee(id);
        fetchEmployees();
        toast.success('Employee deleted successfully');
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('Failed to delete employee');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, formData);
        toast.success('Employee updated successfully');
      } else {
        await createEmployee(formData);
        toast.success('Employee created successfully');
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error(error.response?.data?.message || 'Failed to save employee');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesDept = !departmentFilter || emp.department === departmentFilter;
      return matchesDept;
    });
  }, [employees, departmentFilter]);

  const departments = useMemo(() => {
    return [...new Set(employees.map((e) => e.department).filter(Boolean))];
  }, [employees]);

  const getInitials = (firstName, lastName) => {
    const f = firstName ? firstName.charAt(0) : '';
    const l = lastName ? lastName.charAt(0) : '';
    return `${f}${l}`.toUpperCase() || 'U';
  };

  return (
    <div className="space-y-6">
      {/* ── Premium Blue Hero Banner ─────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c2b33] to-[#0064e0] p-6 sm:p-8 text-white shadow-electric-glow border border-blue-400/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-100 font-heading mb-1">
              <Zap size={14} className="text-blue-100" />
              <span>Enterprise Workforce Directory</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
              EMPLOYEE MANAGEMENT
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              {total} registered staff member{total !== 1 ? 's' : ''} across all active operational departments.
            </p>
          </div>

          <Button variant="secondary" icon={UserPlus} onClick={handleAdd}>
            Add New Employee
          </Button>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── Filters & Search Toolbar ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#dde5ec] p-4 shadow-premium-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 max-w-lg">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, matricule, email, or role…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#f1f5f8] border border-[#dde5ec] rounded-xl text-xs font-semibold text-[#1c2b33] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#172033] cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3.5 py-2 bg-[#f1f5ff] border border-[#d6e2f0] rounded-xl text-xs font-bold text-[#172033] cursor-pointer focus:bg-white focus:outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Employees Table Card ─────────────────────────────────── */}
      <Card
        headerVariant="softBlue"
        title={`Staff Directory (${filteredEmployees.length})`}
        subtitle="Manage employee profile credentials, biometric registration, and organizational assignments."
      >
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="md" text="Loading employee records…" />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <EmptyState
            title="No employees found"
            description={
              searchTerm || departmentFilter
                ? 'No staff members match the selected filters.'
                : 'Get started by creating your first employee profile.'
            }
            icon={Users}
            action={handleAdd}
            actionLabel="Add Employee"
          />
        ) : (
          <div className="overflow-x-auto -mx-6 -my-6">
            <table className="w-full text-sm">
              <thead className="bg-[#f1f5f8] text-[#2563eb] border-b border-[#dde5ec]">
                <tr>
                  <th className="px-6 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Employee
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Matricule
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Department
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Position
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Account Status
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Hire Date
                  </th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Biometric Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-heading font-extrabold uppercase tracking-wider text-[#2563eb]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7f0fa] bg-white">
                {filteredEmployees.map((employee) => {
                  const avatarColor = getAvatarGradient(employee.first_name + employee.last_name);
                  const deptStyle = getDeptColor(employee.department);
                  const isFaceEnrolled = Boolean(
                    employee.is_face_enrolled ||
                    employee.biometric_status === 'Enrolled' ||
                    (employee.face_status === 'active' && employee.face_profile_id)
                  );
                  const bioStatus = employee.biometric_status || (isFaceEnrolled ? 'Enrolled' : 'Not Enrolled');

                  return (
                    <tr key={employee.id} className="hover:bg-[#e7f0fa]/60 transition-colors">
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-2xs ${avatarColor}`}
                          >
                            {getInitials(employee.first_name, employee.last_name)}
                          </div>
                          <div>
                            <p className="font-bold text-[#172033] text-xs sm:text-sm">
                              {employee.first_name} {employee.last_name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{employee.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-slate-700">
                        {employee.matricule}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${deptStyle}`}>
                          {employee.department || 'Unassigned'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-700 font-medium">
                        {employee.position || 'Staff Member'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={employee.account_status || 'No Account'} type="dot" />
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-slate-500">
                        {employee.hire_date
                          ? parseLocalDate(employee.hire_date)?.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={bioStatus} type="dot" />
                          {!isFaceEnrolled && (
                            <button
                              onClick={() => setRegisteringFaceEmployee(employee)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563eb] hover:bg-[#eff6ff] transition-colors cursor-pointer"
                              title="Register Biometric Face"
                            >
                              <Camera size={15} />
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563eb] hover:bg-[#eff6ff] transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(employee.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-[#d6e2f0]">
            <Pagination
              page={page}
              limit={limit}
              total={total}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </Card>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'Edit Staff Profile' : 'Register New Employee'}
        subtitle="Specify personal details, operational department, and employment date."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#d6e2f0] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Doe"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#d6e2f0] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Work Email {!isManager && <span className="text-rose-500">*</span>}</span>
                {isManager && <span className="text-[10px] text-amber-600 font-semibold normal-case">(Managed by Admin)</span>}
              </label>
              <input
                type="email"
                required={!isManager}
                readOnly={isManager}
                disabled={isManager}
                placeholder={isManager ? "Managed by Administrator" : "john.doe@company.com"}
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-semibold focus:outline-none ${
                  isManager 
                    ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' 
                    : 'bg-white border-[#d6e2f0] focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
                Matricule Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. EMP-0042"
                value={formData.matricule}
                onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#d6e2f0] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
                Department
              </label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#d6e2f0] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] cursor-pointer"
              >
                <option value="">Select Department</option>
                {departmentsList.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
                Job Position
              </label>
              <input
                type="text"
                placeholder="e.g. Software Architect, Sales Lead"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#d6e2f0] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
              Hire Date
            </label>
            <input
              type="date"
              value={formData.hire_date ? formData.hire_date.split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#d6e2f0] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#d6e2f0]">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingEmployee ? 'Save Updates' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Biometric Face Registration Modal */}
      {registeringFaceEmployee && (
        <RegisterFaceModal
          employee={registeringFaceEmployee}
          isOpen={!!registeringFaceEmployee}
          onClose={() => setRegisteringFaceEmployee(null)}
          onSuccess={() => {
            setRegisteringFaceEmployee(null);
            fetchEmployees();
          }}
        />
      )}
    </div>
  );
};

export default Employees;
