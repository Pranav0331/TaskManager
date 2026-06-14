import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';

const routeMeta = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your tasks and progress' },
  '/tasks': { title: 'Tasks', subtitle: 'Manage and organize your work' },
  '/settings': { title: 'Settings', subtitle: 'Account and preferences' },
};

const DashboardLayout = () => {
  const location = useLocation();
  const isTaskDetail = location.pathname.startsWith('/tasks/') && location.pathname !== '/tasks';
  const meta = isTaskDetail
    ? { title: 'Task Details', subtitle: 'View and manage task information' }
    : routeMeta[location.pathname] || { title: 'TaskFlow', subtitle: '' };

  return (
    <div className="min-h-screen bg-nimbus-50 dark:bg-nimbus-950">
      <Sidebar />
      <div className="lg:pl-64 transition-all duration-200">
        <TopBar title={meta.title} subtitle={meta.subtitle} />
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
