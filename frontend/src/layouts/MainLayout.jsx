import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SessionTimeout from '../components/SessionTimeout';
import { Outlet, useLocation } from 'react-router-dom';

const getPageTitle = (pathname) => {
  const titles = {
    '/dashboard': 'Dashboard',
    '/employees': 'Employees',
    '/departments': 'Departments',
    '/attendance': 'Attendance Management',
    '/leave-requests': 'Leave Requests',
    '/holidays': 'Holiday Calendar',
    '/reports': 'Reports & Analytics',
    '/cra': 'Activity Reports (CRA)',
    '/manager/cra-live-monitor': 'CRA Live Monitor',
    '/attendance-verification': 'QR Portal',
    '/qr-portal': 'QR Portal',
    '/users': 'User Management',
    '/admin/security': 'Security Center',
    '/profile': 'My Profile',
    '/profile/security': 'Security Settings',
    '/settings': 'Settings',
  };
  return titles[pathname] || 'Dashboard';
};

const MainLayout = () => {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  // Mobile drawer open state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Desktop sidebar collapsed state (saved in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Close mobile drawer upon route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  return (
    <SessionTimeout>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-x-clip">
        {/* Sidebar */}
        <Sidebar
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        {/* Mobile Backdrop Overlay */}
        {mobileDrawerOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out ${
            isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          }`}
        >
          <Navbar
            title={title}
            onMenuClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          />

          <main className="flex-1 p-6 lg:p-8 w-full animate-fade-in">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </SessionTimeout>
  );
};

export default MainLayout;
