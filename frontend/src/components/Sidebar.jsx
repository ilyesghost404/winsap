import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  BarChart3,
  Users,
  CalendarCheck,
  CalendarRange,
  LogOut,
  Settings,
  X,
  LayoutDashboard,
  CalendarDays,
  ShieldCheck,
  QrCode,
  Building2,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import WinsapLogo from './WinsapLogo';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);

  const getMenuItems = () => {
    const items = [];

    if (user?.role === 'admin') {
      items.push(
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Core' },
        { path: '/users', label: 'User Directory', icon: Users, category: 'Administration' },
        { path: '/admin/security', label: 'Security Center', icon: ShieldCheck, category: 'Administration' }
      );
    } else if (user?.role === 'manager') {
      items.push(
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Overview' },
        { path: '/departments', label: 'Departments', icon: Building2, category: 'Organization' },
        { path: '/employees', label: 'Employees', icon: Users, category: 'Organization' },
        { path: '/attendance', label: 'Live Attendance', icon: CalendarCheck, category: 'Tracking' },
        { path: '/leave-requests', label: 'Leave Requests', icon: CalendarDays, category: 'Tracking' },
        { path: '/holidays', label: 'Holiday Calendar', icon: CalendarRange, category: 'Tracking' },
        { path: '/reports', label: 'Analytics & Reports', icon: BarChart3, category: 'Intelligence' },
        { path: '/cra', label: 'Activity Reports (CRA)', icon: ClipboardList, category: 'Operations' },
        { path: '/attendance-verification', label: 'QR Scan Portal', icon: QrCode, category: 'Operations' }
      );
    } else if (user?.role === 'employee') {
      items.push(
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Overview' },
        { path: '/attendance', label: 'My Attendance', icon: CalendarCheck, category: 'Workspace' },
        { path: '/leave-requests', label: 'Leave Requests', icon: CalendarDays, category: 'Workspace' },
        { path: '/holidays', label: 'Company Holidays', icon: CalendarRange, category: 'Workspace' },
        { path: '/cra', label: 'My CRA Report', icon: ClipboardList, category: 'Workspace' }
      );
    }

    return items;
  };

  const menuItems = getMenuItems();

  const handleMenuClick = (e, item, isMobile = false) => {
    if (item.path === '/attendance-verification' || item.path === '/qr-portal') {
      e.preventDefault();
      const popupUrl = `${window.location.origin}${item.path}`;
      const qrWindow = window.open(popupUrl, '_blank');
      if (qrWindow) {
        qrWindow.focus();
      } else {
        alert('Popup blocked. Please allow popups for this site to open the QR Portal.');
      }
      if (isMobile && onClose) onClose();
    } else {
      if (isMobile && onClose) onClose();
    }
  };

  // Group items by category
  const categories = useMemoCategories(menuItems);

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col sidebar-container fixed inset-y-0 left-0 z-40 bg-[#1c2b33] text-white border-r border-[#2a3c47] transition-all duration-300 ease-in-out select-none shadow-2xl ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 flex items-center justify-between px-5 border-b border-[#2a3c47] bg-black/20 backdrop-blur-xs">
          <div className="flex items-center gap-3 overflow-hidden">
            {isCollapsed ? (
              <div className="mx-auto">
                <WinsapLogo variant="icon" size="md" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <WinsapLogo variant="full" colorMode="original" size="lg" />
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-white/20"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* User Role Badge Bar */}
        {!isCollapsed && (
          <div className="px-5 py-2.5 border-b border-[#2a3c47] bg-black/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0082fb] shadow-xs" />
              <span className="text-xs font-bold text-slate-200 capitalize">{user?.role} Workspace</span>
            </div>
            <span className="text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-md bg-[#0064e0]/30 text-sky-200 border border-[#0064e0]/50">
              v2.4 Pro
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3.5 space-y-5 overflow-y-auto light-scrollbar">
          {categories.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-heading mb-1.5">
                  {cat.category}
                </p>
              )}

              {cat.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <div key={item.path} className="relative">
                    <Link
                      to={item.path}
                      onClick={(e) => handleMenuClick(e, item, false)}
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`
                        flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 group cursor-pointer relative
                        ${isCollapsed ? 'justify-center px-0 h-11 w-11 mx-auto' : ''}
                        ${
                          isActive
                            ? 'bg-gradient-to-r from-[#0064e0] to-[#0082fb] text-white font-bold shadow-electric-glow border border-white/20'
                            : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                        }
                      `}
                    >
                      {/* Left Active Indicator Bar */}
                      {isActive && !isCollapsed && (
                        <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#0082fb] rounded-r-full shadow-xs" />
                      )}

                      <Icon
                        size={19}
                        className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate tracking-tight">{item.label}</span>}

                      {/* Active Indicator Dot */}
                      {isActive && !isCollapsed && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                      )}
                    </Link>

                    {/* Tooltip for collapsed view */}
                    {isCollapsed && hoveredItem === item.path && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#1c2b33] text-white text-xs font-bold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap z-50 animate-fade-in pointer-events-none">
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

      </aside>

      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-76 sidebar-container bg-[#1c2b33] text-white border-r border-[#2a3c47] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-18 flex items-center justify-between px-6 border-b border-[#2a3c47] bg-black/20">
            <WinsapLogo variant="full" colorMode="original" size="lg" />
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-4 space-y-4 overflow-y-auto light-scrollbar">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-heading mb-1.5">
                  {cat.category}
                </p>
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={(e) => handleMenuClick(e, item, true)}
                      className={`
                        flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all
                        ${
                          isActive
                            ? 'bg-gradient-to-r from-[#0064e0] to-[#0082fb] text-white shadow-lg border border-white/20'
                            : 'text-slate-300 hover:bg-white/10'
                        }
                      `}
                    >
                      <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>


        </div>
      </div>
    </>
  );
};

// Helper hook to group by category
function useMemoCategories(items) {
  const map = {};
  items.forEach((item) => {
    const cat = item.category || 'General';
    if (!map[cat]) map[cat] = [];
    map[cat].push(item);
  });
  return Object.keys(map).map((k) => ({ category: k, items: map[k] }));
}

export default Sidebar;
