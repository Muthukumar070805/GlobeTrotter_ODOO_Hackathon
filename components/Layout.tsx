
import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ICONS, COLORS } from '../constants';
import { MockDB } from '../services/db';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = MockDB.getCurrentUser();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: ICONS.Map },
    { label: 'Explore Cities', path: '/explore', icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
    )},
    { label: 'My Trips', path: '/trips', icon: ICONS.Plane },
    { label: 'Timeline', path: '/timeline', icon: ICONS.Calendar },
    { label: 'Profile', path: '/profile', icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    )},
  ];

  // Add admin panel if user is admin
  if (user?.role === 'admin') {
    navItems.splice(1, 0, { 
      label: 'Admin Panel', 
      path: '/admin', 
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
      ) 
    });
  }

  const handleLogout = () => {
    MockDB.setCurrentUser(null);
    navigate('/login');
  };

  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname.startsWith('/share/')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-saffron rounded-xl flex items-center justify-center text-white font-bold text-xl">G</div>
          <h1 className="text-2xl font-bold tracking-tight text-emperor">GlobeTrotter</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                  ? 'bg-saffron/10 text-saffron' 
                  : 'text-edward hover:bg-gray-50'
              }`}
            >
              <item.icon />
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 p-3 text-edward hover:text-red-500 transition-colors w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex justify-around items-center z-50">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 ${
              location.pathname === item.path ? 'text-saffron' : 'text-edward'
            }`}
          >
            <item.icon />
            <span className="text-xs font-semibold">{item.label}</span>
          </Link>
        ))}
      </nav>

      <main className="flex-1 p-6 md:p-10 mb-20 md:mb-0 max-w-7xl mx-auto w-full overflow-y-auto custom-scrollbar">
        {children}
      </main>
    </div>
  );
};

export default Layout;
