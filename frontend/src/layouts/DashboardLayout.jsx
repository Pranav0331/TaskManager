import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-nimbus-50 dark:bg-nimbus-950">
      <Sidebar />
      <div className="lg:pl-64 transition-all duration-200">
        <TopBar />
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
