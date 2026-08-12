import { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, User, Users } from 'lucide-react';
import Modal from '../../../../components/Modal';
import Button from '../../../../components/Button';
import { 
  exportEmployeeYearlyExcel, 
  exportEmployeeYearlyPdf,
  exportYearlyTeamExcel,
  exportYearlyTeamPdf
} from '../../../../services/reportService';
import { getEmployees } from '../../../../services/employeeService';
import toast from 'react-hot-toast';

/**
 * ReportsGeneratorModal — dialog allowing managers to export PDF or Excel CRA activity reports.
 * Supports Employee-Specific Export and Full-Year Team Export.
 */
const ReportsGeneratorModal = ({ isOpen, onClose }) => {
  const [scope, setScope] = useState('employee'); // 'employee' | 'team'
  const [reportType, setReportType] = useState('pdf'); // 'pdf' | 'excel'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const res = await getEmployees();
      const list = res.data || res || [];
      setEmployees(list);
      if (list.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(list[0].id);
      }
    } catch (err) {
      console.error("Failed to load employees for report:", err);
      toast.error("Failed to load employee list");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      if (scope === 'employee') {
        if (!selectedEmployeeId) {
          toast.error('Please select an employee');
          setLoading(false);
          return;
        }
        if (reportType === 'pdf') {
          toast.success('Generating Employee PDF Report...');
          await exportEmployeeYearlyPdf(selectedEmployeeId, selectedYear);
        } else {
          toast.success('Generating Employee Excel Report...');
          await exportEmployeeYearlyExcel(selectedEmployeeId, selectedYear);
        }
      } else {
        if (reportType === 'pdf') {
          toast.success('Generating Yearly Team PDF Report...');
          await exportYearlyTeamPdf(selectedYear);
        } else {
          toast.success('Generating Yearly Team Excel Report...');
          await exportYearlyTeamExcel(selectedYear);
        }
      }
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.message || 'Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  const availableYears = [2026, 2025, 2024];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CRA Activity Reports Generator" subtitle="Export detailed employee and team CRA activity summaries">
      <div className="space-y-6">
        {/* Report Scope Selector */}
        <div>
          <label className="block text-xs font-bold text-[#5f7380] mb-2 uppercase tracking-wider">Report Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setScope('employee')}
              className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                scope === 'employee' ? 'bg-[#e7f0fa] border-[#0064e0] text-[#0064e0]' : 'bg-white border-[#dde5ec] text-[#5f7380]'
              }`}
            >
              <div className={`p-2 rounded-xl ${scope === 'employee' ? 'bg-[#0064e0] text-white' : 'bg-slate-100 text-slate-500'}`}>
                <User size={18} />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block text-slate-900">Specific Employee</span>
                <span className="text-[11px] text-slate-500 font-medium">Individual activity log & tasks</span>
              </div>
            </button>

            <button
              onClick={() => setScope('team')}
              className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                scope === 'team' ? 'bg-[#e7f0fa] border-[#0064e0] text-[#0064e0]' : 'bg-white border-[#dde5ec] text-[#5f7380]'
              }`}
            >
              <div className={`p-2 rounded-xl ${scope === 'team' ? 'bg-[#0064e0] text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Users size={18} />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block text-slate-900">Yearly Team Report</span>
                <span className="text-[11px] text-slate-500 font-medium">All employees & tasks for year</span>
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Filters depending on scope */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-[#dde5ec] space-y-4">
          {scope === 'employee' && (
            <div>
              <label className="block text-xs font-bold text-[#5f7380] mb-1.5 uppercase tracking-wider">Select Employee</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                disabled={loadingEmployees}
                className="w-full px-3 py-2.5 text-xs font-semibold bg-white border border-[#dde5ec] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0]"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.matricule || `ID ${emp.id}`})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#5f7380] mb-1.5 uppercase tracking-wider">Target Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2.5 text-xs font-semibold bg-white border border-[#dde5ec] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0064e0]/20 focus:border-[#0064e0]"
            >
              {availableYears.map(yr => (
                <option key={yr} value={yr}>Year {yr}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-xs font-bold text-[#5f7380] mb-2 uppercase tracking-wider">Export Format</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setReportType('pdf')}
              className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                reportType === 'pdf' ? 'bg-[#e7f0fa] border-[#0064e0] text-[#0064e0]' : 'bg-white border-[#dde5ec] text-[#5f7380]'
              }`}
            >
              <FileText size={18} />
              <span className="text-xs font-bold">PDF Document (.pdf)</span>
            </button>
            <button
              onClick={() => setReportType('excel')}
              className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                reportType === 'excel' ? 'bg-[#e7f0fa] border-[#0064e0] text-[#0064e0]' : 'bg-white border-[#dde5ec] text-[#5f7380]'
              }`}
            >
              <FileSpreadsheet size={18} />
              <span className="text-xs font-bold">Excel Workbook (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-[#dde5ec]">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" icon={Download} onClick={handleExport} loading={loading}>
          {scope === 'employee' ? 'Export Employee Report' : 'Export Yearly Team Report'}
        </Button>
      </div>
    </Modal>
  );
};

export default ReportsGeneratorModal;
