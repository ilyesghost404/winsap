import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Building2, Plus, Search, Edit2, Trash2, Users, X,
  Zap, ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const DEPT_ICONS = [
  'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]',
  'bg-emerald-50 text-emerald-600 border border-emerald-200',
  'bg-violet-50 text-violet-600 border border-violet-200',
  'bg-amber-50 text-amber-600 border border-amber-200',
  'bg-cyan-50 text-cyan-600 border border-cyan-200',
  'bg-rose-50 text-rose-600 border border-rose-200',
];

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentDept, setCurrentDept] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/departments');
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load departments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, dept = null) => {
    setModalMode(mode);
    if (dept) {
      setCurrentDept({ ...dept });
    } else {
      setCurrentDept({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (modalMode === 'add') {
        const response = await api.post('/departments', currentDept);
        if (response.data.success) {
          toast.success('Department created successfully');
          setIsModalOpen(false);
          fetchDepartments();
        }
      } else {
        const response = await api.put(`/departments/${currentDept.id}`, currentDept);
        if (response.data.success) {
          toast.success('Department updated successfully');
          setIsModalOpen(false);
          fetchDepartments();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deptToDelete) return;
    try {
      setIsSubmitting(true);
      const response = await api.delete(`/departments/${deptToDelete.id}`);
      if (response.data.success) {
        toast.success('Department deleted successfully');
        setIsDeleteModalOpen(false);
        setDeptToDelete(null);
        fetchDepartments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDepts = useMemo(() => {
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [departments, searchQuery]);

  return (
    <div className="space-y-6">
      {/* ── Premium Blue Hero Banner ─────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1c2b33] to-[#0064e0] p-6 sm:p-8 text-white shadow-electric-glow border border-blue-400/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-100 font-heading mb-1">
              <Zap size={14} className="text-blue-100" />
              <span>Organizational Structure</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
              DEPARTMENTS & TEAMS
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              {departments.length} operational division{departments.length !== 1 ? 's' : ''} organizing staff workflows and reporting hierarchies.
            </p>
          </div>

          <Button variant="secondary" icon={Plus} onClick={() => handleOpenModal('add')}>
            Add Department
          </Button>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── Search & Filter Toolbar ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#d6e2f0] p-4 shadow-premium-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search departments by name or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f1f5ff] border border-[#d6e2f0] rounded-xl text-xs font-semibold text-[#172033] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#172033] cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Department Grid / List ───────────────────────────────── */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="md" text="Loading departmental hierarchy…" />
        </div>
      ) : filteredDepts.length === 0 ? (
        <Card headerVariant="softBlue">
          <EmptyState
            title="No departments found"
            description="Create your first organization division to allocate team members."
            icon={Building2}
            action={() => handleOpenModal('add')}
            actionLabel="Add Department"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepts.map((dept, idx) => {
            const iconStyle = DEPT_ICONS[idx % DEPT_ICONS.length];

            return (
              <div
                key={dept.id}
                className="bg-white rounded-2xl border border-[#d6e2f0] p-6 shadow-premium-sm hover:shadow-blue-glow hover:border-[#bfdbfe] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconStyle} shadow-2xs`}>
                      <Building2 size={20} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal('edit', dept)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563eb] hover:bg-[#eff6ff] transition-colors cursor-pointer"
                        title="Edit Department"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => {
                          setDeptToDelete(dept);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-heading font-black text-[#172033] mt-4 tracking-tight">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-medium">
                    {dept.description || 'No specific description provided for this division.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#f1f5ff] flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Users size={14} className="text-[#2563eb]" />
                    <span className="font-bold text-[#172033]">{dept.employee_count ?? 0} Staff Members</span>
                  </div>
                  <span className="text-[#2563eb] font-bold text-[11px] uppercase tracking-wider bg-[#e7f0fa] px-2 py-0.5 rounded border border-[#dde5ec]">
                    Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Create Department' : 'Edit Department'}
        subtitle="Manage department name and operational scope."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Engineering, Product Design, Operations"
              value={currentDept.name}
              onChange={(e) => setCurrentDept({ ...currentDept, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#d6e2f0] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]"
            />
          </div>

          <div>
            <label className="block text-xs font-heading font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of department duties and team focus…"
              value={currentDept.description}
              onChange={(e) => setCurrentDept({ ...currentDept, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-[#d6e2f0] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#d6e2f0]">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {modalMode === 'add' ? 'Create Department' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ────────────────────────────── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Department"
        subtitle="Are you sure you want to delete this department record?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Deleting <span className="font-bold text-[#172033]">{deptToDelete?.name}</span> may leave assigned employees without a department allocation.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#d6e2f0]">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="dangerSolid" onClick={handleDelete} loading={isSubmitting}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Departments;
