import { useState, useEffect } from 'react';
import { User, Hash, FileText, Play } from 'lucide-react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import { getEmployees } from '../../../services/employeeService';
import toast from 'react-hot-toast';

/**
 * Manager modal for assigning tasks to specific employees.
 */
const TaskAssignModal = ({ isOpen, onClose, onAssign }) => {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    employee_id: '',
    ticket_reference: '',
    description: '',
    priority: 1
  });

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await getEmployees({ limit: 100 });
      setEmployees(response.data || response || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
      toast.error('Failed to load employee list');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.employee_id) {
      toast.error('Please select an employee');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setSubmitting(true);
    try {
      const success = await onAssign({
        employee_id: parseInt(form.employee_id),
        ticket_reference: form.ticket_reference.trim() || null,
        description: form.description.trim(),
        priority: parseInt(form.priority)
      });
      if (success) {
        setForm({ employee_id: '', ticket_reference: '', description: '', priority: 1 });
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Task to Employee" subtitle="Task will appear in employee queue">
      <div className="space-y-4">
        {/* Employee selector */}
        <div>
          <label className="block text-xs font-bold text-[#5f7380] mb-1.5 uppercase tracking-wider">
            Select Employee <span className="text-rose-500">*</span>
          </label>
          <select
            value={form.employee_id}
            onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
            className="w-full px-3 py-2.5 text-sm bg-white border border-[#dde5ec] rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0]"
          >
            <option value="">Select Employee...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name} ({emp.matricule || `ID: ${emp.id}`})
              </option>
            ))}
          </select>
        </div>

        {/* Ticket Ref */}
        <div>
          <label className="block text-xs font-bold text-[#5f7380] mb-1.5 uppercase tracking-wider">
            Ticket Reference
          </label>
          <input
            type="text"
            value={form.ticket_reference}
            onChange={(e) => setForm({ ...form, ticket_reference: e.target.value })}
            placeholder="e.g. TASK-8821"
            className="w-full px-3 py-2.5 text-sm bg-white border border-[#dde5ec] rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-[#5f7380] mb-1.5 uppercase tracking-wider">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the assigned task..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm bg-white border border-[#dde5ec] rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0] resize-none"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-bold text-[#5f7380] mb-1.5 uppercase tracking-wider">
            Priority
          </label>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
            className="w-full px-3 py-2.5 text-sm bg-white border border-[#dde5ec] rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0]"
          >
            <option value={1}>Low</option>
            <option value={2}>Medium</option>
            <option value={3}>High</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-[#dde5ec]">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} loading={submitting}>
          Assign Task
        </Button>
      </div>
    </Modal>
  );
};

export default TaskAssignModal;
