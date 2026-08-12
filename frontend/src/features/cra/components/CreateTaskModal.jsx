import { useState } from 'react';
import { X, Loader2, Hash, FileText, Flag, Clock, Play, Calendar, Info } from 'lucide-react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';

/**
 * Multi-step task creation modal.
 * Step 1: Basic Info (ticket, description, priority)
 * Step 2: Duration config (hours/day/multi-day)
 * Step 3: Review & submit
 */
const CreateTaskModal = ({ isOpen, onClose, onCreate, isManager = false, employeeId }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ticket_reference: '',
    description: '',
    priority: 1,
    duration_type: 'timer', // 'timer' | 'hours' | 'day' | 'multi_day'
    hours: '',
    start_date: '',
    end_date: '',
    start_immediately: false
  });

  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!form.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (form.duration_type === 'hours') {
      if (!form.hours || parseFloat(form.hours) <= 0) {
        newErrors.hours = 'Enter valid hours';
      }
    }
    if (form.duration_type === 'multi_day') {
      if (!form.start_date) newErrors.start_date = 'Start date is required';
      if (!form.end_date) newErrors.end_date = 'End date is required';
      if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = {
        ticket_reference: form.ticket_reference.trim() || null,
        description: form.description.trim(),
        priority: parseInt(form.priority),
        start_immediately: form.start_immediately
      };

      // Add employee_id if manager is assigning to someone
      if (isManager && employeeId) {
        data.employee_id = employeeId;
      }

      // Handle pre-calculated durations
      if (form.duration_type === 'hours' && form.hours) {
        data.duration_minutes = Math.round(parseFloat(form.hours) * 60);
        data.source = 'manual';
      }
      if (form.duration_type === 'day') {
        data.duration_minutes = 480; // 8 hours
        data.source = 'manual';
      }
      if (form.duration_type === 'multi_day') {
        data.start_time = form.start_date;
        data.end_time = form.end_date;
        // Calculate working days (simplified)
        const start = new Date(form.start_date);
        const end = new Date(form.end_date);
        let days = 0;
        const d = new Date(start);
        while (d <= end) {
          const day = d.getDay();
          if (day !== 0 && day !== 6) days++;
          d.setDate(d.getDate() + 1);
        }
        data.duration_minutes = days * 480;
        data.source = 'manual';
      }

      const success = await onCreate(data);
      if (success) {
        resetAndClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setForm({
      ticket_reference: '',
      description: '',
      priority: 1,
      duration_type: 'timer',
      hours: '',
      start_date: '',
      end_date: '',
      start_immediately: false
    });
    setStep(1);
    setErrors({});
    onClose();
  };

  const durationTypes = [
    { value: 'timer', label: 'Use Timer', desc: 'Track time with start/stop', icon: Play },
    { value: 'hours', label: 'Set Hours', desc: 'Enter hours manually', icon: Clock },
    { value: 'day', label: '1 Full Day', desc: '8 working hours', icon: Calendar },
    { value: 'multi_day', label: 'Date Range', desc: 'Start & end dates', icon: Calendar }
  ];

  const priorityOptions = [
    { value: 1, label: 'Low', color: 'text-slate-600 bg-slate-50 border-slate-200' },
    { value: 2, label: 'Medium', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { value: 3, label: 'High', color: 'text-rose-700 bg-rose-50 border-rose-200' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Create Task" subtitle={`Step ${step} of 3`} size="lg">
      {/* Step indicators */}
      <div className="flex items-center gap-1 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex-1 flex items-center gap-1">
            <div className={`
              h-1.5 flex-1 rounded-full transition-all duration-300
              ${s <= step ? 'bg-[#0064e0]' : 'bg-[#dde5ec]'}
            `} />
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Info size={16} className="text-[#0064e0]" />
            <h3 className="text-sm font-heading font-bold text-[#1c2b33]">Basic Information</h3>
          </div>

          {/* Ticket Reference */}
          <div>
            <label className="block text-xs font-bold text-[#5f7380] mb-1.5 uppercase tracking-wider">
              Ticket Reference
            </label>
            <div className="relative">
              <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f7380]" />
              <input
                type="text"
                value={form.ticket_reference}
                onChange={(e) => handleChange('ticket_reference', e.target.value)}
                placeholder="e.g. PROJ-1234"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#dde5ec] rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0]
                  placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#5f7380] mb-1.5 uppercase tracking-wider">
              Description <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FileText size={14} className="absolute left-3 top-3 text-[#5f7380]" />
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="What is this task about?"
                rows={3}
                className={`w-full pl-9 pr-4 py-2.5 text-sm bg-white border rounded-xl resize-none
                  focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0]
                  placeholder:text-slate-400 font-medium
                  ${errors.description ? 'border-rose-300 ring-2 ring-rose-100' : 'border-[#dde5ec]'}
                `}
              />
            </div>
            {errors.description && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.description}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-[#5f7380] mb-2 uppercase tracking-wider">
              Priority
            </label>
            <div className="flex gap-2">
              {priorityOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleChange('priority', opt.value)}
                  className={`
                    flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer
                    ${form.priority === opt.value
                      ? `${opt.color} ring-2 ring-offset-1 ring-[#0064e0]/30`
                      : 'bg-white text-[#5f7380] border-[#dde5ec] hover:bg-[#f1f5f8]'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Duration */}
      {step === 2 && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-[#0064e0]" />
            <h3 className="text-sm font-heading font-bold text-[#1c2b33]">Duration & Tracking</h3>
          </div>

          {/* Duration type selection */}
          <div className="grid grid-cols-2 gap-2">
            {durationTypes.map(dt => {
              const DtIcon = dt.icon;
              return (
                <button
                  key={dt.value}
                  onClick={() => handleChange('duration_type', dt.value)}
                  className={`
                    p-3 rounded-xl border-2 text-left transition-all cursor-pointer
                    ${form.duration_type === dt.value
                      ? 'bg-[#e7f0fa] border-[#0064e0] text-[#0064e0]'
                      : 'bg-white border-[#dde5ec] text-[#5f7380] hover:bg-[#f1f5f8]'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <DtIcon size={14} />
                    <span className="text-xs font-bold">{dt.label}</span>
                  </div>
                  <p className="text-[10px] opacity-75">{dt.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Hours input */}
          {form.duration_type === 'hours' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-bold text-[#5f7380] mb-1.5 uppercase tracking-wider">
                Number of Hours
              </label>
              <input
                type="number"
                min="0.25"
                step="0.25"
                value={form.hours}
                onChange={(e) => handleChange('hours', e.target.value)}
                placeholder="e.g. 2.5"
                className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl font-mono font-bold
                  focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0]
                  ${errors.hours ? 'border-rose-300 ring-2 ring-rose-100' : 'border-[#dde5ec]'}
                `}
              />
              {errors.hours && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.hours}</p>
              )}
            </div>
          )}

          {/* Full day info */}
          {form.duration_type === 'day' && (
            <div className="bg-[#e7f0fa] rounded-xl p-4 border border-[#dde5ec] animate-fade-in">
              <p className="text-xs font-semibold text-[#0064e0]">
                This task will be logged as <span className="font-bold">1 full working day (8 hours)</span>.
              </p>
            </div>
          )}

          {/* Date range inputs */}
          {form.duration_type === 'multi_day' && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-[#5f7380] mb-1.5 uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  className={`w-full px-3 py-2.5 text-sm bg-white border rounded-xl font-medium
                    focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0]
                    ${errors.start_date ? 'border-rose-300' : 'border-[#dde5ec]'}
                  `}
                />
                {errors.start_date && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.start_date}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5f7380] mb-1.5 uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  className={`w-full px-3 py-2.5 text-sm bg-white border rounded-xl font-medium
                    focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0]
                    ${errors.end_date ? 'border-rose-300' : 'border-[#dde5ec]'}
                  `}
                />
                {errors.end_date && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.end_date}</p>
                )}
              </div>
            </div>
          )}

          {/* Start immediately toggle (timer mode only) */}
          {form.duration_type === 'timer' && (
            <label className="flex items-center gap-3 p-3 bg-[#f1f5f8] rounded-xl border border-[#dde5ec] cursor-pointer hover:bg-[#e7f0fa] transition-colors">
              <input
                type="checkbox"
                checked={form.start_immediately}
                onChange={(e) => handleChange('start_immediately', e.target.checked)}
                className="w-4 h-4 rounded border-[#dde5ec] text-[#0064e0] focus:ring-[#0064e0]/30"
              />
              <div>
                <p className="text-xs font-bold text-[#1c2b33]">Start immediately</p>
                <p className="text-[10px] text-[#5f7380]">Begin the timer right after creation</p>
              </div>
            </label>
          )}
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Info size={16} className="text-[#0064e0]" />
            <h3 className="text-sm font-heading font-bold text-[#1c2b33]">Review & Confirm</h3>
          </div>

          <div className="bg-[#f1f5f8] rounded-xl p-5 border border-[#dde5ec] space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-[#5f7380] font-semibold">Ticket</span>
              <span className="font-bold text-[#1c2b33]">{form.ticket_reference || 'None'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#5f7380] font-semibold">Description</span>
              <span className="font-bold text-[#1c2b33] text-right max-w-[60%] truncate">{form.description}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#5f7380] font-semibold">Priority</span>
              <span className="font-bold text-[#1c2b33]">
                {form.priority === 3 ? 'High' : form.priority === 2 ? 'Medium' : 'Low'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#5f7380] font-semibold">Duration</span>
              <span className="font-bold text-[#1c2b33]">
                {form.duration_type === 'timer' ? 'Live Timer' :
                 form.duration_type === 'hours' ? `${form.hours} hours` :
                 form.duration_type === 'day' ? '1 Full Day (8h)' :
                 `${form.start_date} → ${form.end_date}`}
              </span>
            </div>
            {form.duration_type === 'timer' && (
              <div className="flex justify-between text-xs">
                <span className="text-[#5f7380] font-semibold">Auto-start</span>
                <span className="font-bold text-[#1c2b33]">{form.start_immediately ? 'Yes' : 'No'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#dde5ec]">
        <div>
          {step > 1 && (
            <Button variant="ghost" size="sm" onClick={prevStep}>
              Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetAndClose}>
            Cancel
          </Button>
          {step < 3 ? (
            <Button variant="primary" size="sm" onClick={nextStep}>
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              loading={loading}
              icon={form.start_immediately ? Play : null}
            >
              {form.start_immediately ? 'Create & Start' : 'Create Task'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CreateTaskModal;
