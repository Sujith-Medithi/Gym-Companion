import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopNav from './TopNav.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const backgroundStyle = user?.dashboardBackground
    ? {
        backgroundImage: `linear-gradient(rgba(15, 15, 26, 0.85), rgba(15, 15, 26, 0.90)), url(${user.dashboardBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }
    : {};

  const wallpaperClass = user?.dashboardBackground ? 'has-wallpaper' : '';

  return (
    <div 
      className={`min-h-screen bg-app flex transition-all duration-500 ${wallpaperClass}`} 
      style={backgroundStyle}
    >
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNav onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 px-6 sm:px-8 py-6 w-full space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
