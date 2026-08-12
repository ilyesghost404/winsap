const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">WinSAP</span>
          <span>·</span>
          <span>Absence & Attendance Management</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            System Operational
          </span>
          <span>© {currentYear} All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
