import { useState, useRef, useEffect } from 'react';
import {
  Bell, Menu, Search, User, LogOut, Settings, ChevronDown,
  CheckCircle2, CalendarDays, Check, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import WinsapLogo from './WinsapLogo';

const Navbar = ({ title = 'Dashboard', onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Leave request approved',
      desc: 'Your recent vacation request was validated.',
      time: '10m ago',
      read: false,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      id: 2,
      title: 'Holiday reminder',
      desc: 'Official holiday upcoming this week.',
      time: '2h ago',
      read: false,
      icon: CalendarDays,
      color: 'text-[#0064e0] bg-[#e7f0fa] border-[#dde5ec]'
    }
  ]);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getRoleBadgeClass = (role) => {
    if (role === 'admin') return 'bg-violet-100 text-violet-700 border-violet-200';
    if (role === 'manager') return 'bg-[#e7f0fa] text-[#0064e0] border-[#dde5ec]';
    return 'bg-[#f1f5f8] text-[#0064e0] border-[#dde5ec]';
  };

  const getRoleLabel = (role) => {
    if (role === 'admin') return 'Admin System';
    if (role === 'manager') return 'Manager';
    return 'Employee';
  };

  // Close dropdowns on outside click or Escape key, & Ctrl+K / '/' for search focus
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
      // Ctrl+K or Cmd+K or '/' to focus search input (when not typing in another input)
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const initials = (user?.employee_name || user?.username || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#dde5ec] sticky top-0 z-30 transition-all select-none shadow-premium-sm">
      <div className="px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Toggle + Clean Breadcrumb & Page Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-600 hover:text-[#0064e0] hover:bg-[#e7f0fa] rounded-xl transition-colors cursor-pointer border border-[#dde5ec] flex-shrink-0"
            title="Open Menu"
          >
            <Menu size={20} />
          </button>

          {/* Mobile brand badge fallback */}
          <div className="lg:hidden flex-shrink-0">
            <WinsapLogo variant="icon" size="sm" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-500 truncate font-heading">
              <span>Workspace</span>
              <span className="text-slate-300">/</span>
              <span className="text-[#0064e0] font-bold truncate">{title}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-heading font-black text-[#1c2b33] tracking-tight truncate leading-tight mt-0.5">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Side: Quick Search, Live Status, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Quick Search Bar */}
          <div className="hidden md:flex items-center relative w-56 lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search or jump to…"
              className="w-full pl-10 pr-14 py-2 bg-[#f1f5f8] border border-[#dde5ec] rounded-xl text-xs font-semibold text-[#1c2b33] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0064e0] focus:bg-white transition-all shadow-inner"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  if (user?.role === 'admin') navigate('/users');
                  else if (user?.role === 'manager') navigate('/employees');
                  else navigate('/leave-requests');
                }
              }}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white border border-[#dde5ec] rounded shadow-2xs">
                Ctrl K
              </kbd>
            </div>
          </div>

          {/* System Live Monitor Status */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] tracking-wide">LIVE SYNC</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-slate-600 hover:text-[#0064e0] hover:bg-[#e7f0fa] rounded-xl transition-colors cursor-pointer border border-[#dde5ec]"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#0082fb] rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-84 bg-white rounded-2xl shadow-2xl border border-[#dde5ec] p-2 z-50 animate-scale-in text-[#1c2b33]">
                <div className="px-3 py-2.5 border-b border-[#dde5ec] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1c2b33] uppercase tracking-wider font-heading flex items-center gap-1.5">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-[#0064e0]">
                        {unreadCount}
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-[#0064e0] font-bold cursor-pointer hover:underline flex items-center gap-1"
                      >
                        <Check size={12} />
                        Mark read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearNotifications}
                        className="text-[10px] text-slate-400 font-semibold cursor-pointer hover:text-rose-600 flex items-center gap-0.5"
                        title="Clear all notifications"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-[#e7f0fa] max-h-72 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <Bell size={24} className="mx-auto text-slate-300 mb-2 opacity-60" />
                      <p className="text-xs font-semibold">All caught up!</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">No active notifications</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const Icon = n.icon;
                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            setNotifications((prev) =>
                              prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                            );
                          }}
                          className={`p-3 rounded-xl transition-colors flex items-start gap-3 cursor-pointer ${
                            n.read ? 'opacity-70 hover:bg-[#f8fafc]' : 'bg-blue-50/30 hover:bg-[#e7f0fa]'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${n.color} flex-shrink-0 mt-0.5 border shadow-2xs`}>
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-xs ${n.read ? 'font-medium text-slate-700' : 'font-bold text-[#1c2b33]'}`}>
                                {n.title}
                              </p>
                              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#0064e0]" />}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{n.desc}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block font-mono">{n.time}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-[#dde5ec] hidden sm:block" />

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-[#e7f0fa] border border-transparent hover:border-[#dde5ec] transition-all cursor-pointer select-none"
            >
              <div className="w-8.5 h-8.5 rounded-xl bg-[#1c2b33] text-white font-black text-xs flex items-center justify-center shadow-electric-glow border border-white/30 flex-shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#1c2b33] leading-tight max-w-[120px] truncate">
                  {user?.employee_name || user?.username || 'Authorized User'}
                </p>
                <span className={`inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border mt-0.5 ${getRoleBadgeClass(user?.role)}`}>
                  {getRoleLabel(user?.role)}
                </span>
              </div>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block flex-shrink-0" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl shadow-2xl border border-[#dde5ec] p-2 z-50 animate-scale-in text-[#1c2b33]">
                <div className="px-3 py-2.5 border-b border-[#dde5ec]">
                  <p className="text-xs font-bold text-[#1c2b33] truncate font-heading">
                    {user?.employee_name || user?.username}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate font-mono">{user?.email || `@${user?.username}`}</p>
                </div>

                <div className="py-1 space-y-0.5">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#475569] hover:text-[#1c2b33] hover:bg-[#e7f0fa] rounded-xl transition-colors"
                  >
                    <User size={14} className="text-[#0064e0]" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#475569] hover:text-[#1c2b33] hover:bg-[#e7f0fa] rounded-xl transition-colors"
                  >
                    <Settings size={14} className="text-[#0064e0]" />
                    <span>Settings & Security</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-[#dde5ec]">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
