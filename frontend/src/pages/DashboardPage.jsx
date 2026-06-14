import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Clock,
  ListTodo,
  TrendingUp,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { taskService } from '../services/taskService';
import StatCard from '../components/tasks/StatCard';
import { StatCardSkeleton } from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import { STATUS_COLORS, PRIORITY_COLORS, formatDate } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          taskService.getStats(),
          taskService.getTasks({ sortBy: 'createdAt', order: 'desc' }),
        ]);
        setStats(statsRes.data);
        setRecentTasks(tasksRes.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = stats
    ? [
        { title: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'brand', subtitle: 'All tasks in your workspace' },
        { title: 'Completed', value: stats.completed, icon: CheckSquare, color: 'emerald', subtitle: `${stats.completionPercentage}% completion rate` },
        { title: 'Pending', value: stats.pending, icon: Clock, color: 'amber', subtitle: 'Awaiting action' },
        { title: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: 'blue', subtitle: 'Currently active' },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-nimbus-900 dark:text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-nimbus-500 mt-1">Here&apos;s what&apos;s happening with your tasks today.</p>
        </div>
        <Link
          to="/tasks"
          className="nimbus-btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Task
        </Link>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card, index) => (
              <StatCard key={card.title} {...card} index={index} />
            ))}
      </div>

      {/* Completion progress */}
      {!loading && stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="nimbus-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-nimbus-900 dark:text-white">Completion Progress</h3>
            <span className="text-2xl font-bold text-brand-600">{stats.completionPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-nimbus-100 dark:bg-nimbus-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.completionPercentage}%` }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
            />
          </div>
          <p className="text-sm text-nimbus-500 mt-3">
            {stats.completed} of {stats.total} tasks completed
          </p>
        </motion.div>
      )}

      {/* Recent tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="nimbus-card"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-nimbus-200 dark:border-nimbus-800">
          <h3 className="text-lg font-semibold text-nimbus-900 dark:text-white">Recent Tasks</h3>
          <Link
            to="/tasks"
            className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton h-4 flex-1 rounded" />
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-nimbus-500">No tasks yet. Create your first task to get started.</p>
            <Link to="/tasks" className="nimbus-btn-primary mt-4 inline-flex">
              <Plus className="w-4 h-4" /> Create Task
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-nimbus-100 dark:divide-nimbus-800">
            {recentTasks.map((task) => (
              <Link
                key={task._id}
                to={`/tasks/${task._id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-nimbus-50 dark:hover:bg-nimbus-800/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-nimbus-900 dark:text-white truncate">{task.title}</p>
                  <p className="text-xs text-nimbus-400 mt-0.5">Due {formatDate(task.dueDate)}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
                  <Badge variant={STATUS_COLORS[task.status]}>{task.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardPage;
