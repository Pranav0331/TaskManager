import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';

const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleOpenSidebar = useCallback(() => {
    setMobileSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen w-full bg-nimbus-50 dark:bg-nimbus-950 overflow-x-hidden">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={handleCloseSidebar}
      />
      <div className="lg:pl-64 transition-all duration-200 min-h-screen flex flex-col">
        <TopBar onOpenSidebar={handleOpenSidebar} />
        <main className="flex-1 p-3 sm:p-4 lg:p-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

