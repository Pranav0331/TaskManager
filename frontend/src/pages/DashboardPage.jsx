import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Clock,
  ListTodo,
  TrendingUp,
  ArrowRight,
  Plus,
  Calendar,
  AlertTriangle,
  Target,
  Sparkles,
  Zap,
  CheckCircle2,
  CalendarClock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { taskService } from '../services/taskService';
import StatCard from '../components/tasks/StatCard';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/ui/Modal';
import { StatCardSkeleton } from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import { STATUS_COLORS, PRIORITY_COLORS, formatDate, isOverdue } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [todayFocusTasks, setTodayFocusTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, allTasksRes] = await Promise.all([
        taskService.getStats(),
        taskService.getTasks({ sortBy: 'dueDate', order: 'asc' }),
      ]);

      const allTasks = allTasksRes.data || [];
      setStats(statsRes.data);

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      // 1. Upcoming deadlines (next 5 tasks with due dates that are pending/in progress)
      const upcoming = allTasks
        .filter((t) => t.status !== 'Completed' && t.dueDate)
        .slice(0, 5);
      setUpcomingTasks(upcoming);

      // 2. Today's focus (tasks due today or high priority pending)
      const todayFocus = allTasks.filter((t) => {
        if (t.status === 'Completed') return false;
        if (t.dueDate) {
          const due = new Date(t.dueDate);
          return due <= endOfToday;
        }
        return t.priority === 'High';
      }).slice(0, 4);
      setTodayFocusTasks(todayFocus);

      // 3. Recent tasks sorted by update/creation
      const recent = [...allTasks]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 5);
      setRecentTasks(recent);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateTask = async (data) => {
    setSubmitting(true);
    try {
      await taskService.createTask(data);
      toast.success('Task created successfully!');
      setCreateModalOpen(false);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickComplete = async (taskId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await taskService.updateTask(taskId, { status: 'Completed' });
      toast.success('Task marked as completed! 🎉');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const getUrgencyBadge = (dueDate, status) => {
    if (status === 'Completed') {
      return (
        <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          Done
        </span>
      );
    }
    if (!dueDate) {
      return (
        <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-nimbus-100 text-nimbus-600 dark:bg-nimbus-800 dark:text-nimbus-400">
          No Due Date
        </span>
      );
    }

    const now = new Date();
    const due = new Date(dueDate);
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (due < now) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400">
          <AlertTriangle className="w-3 h-3" /> Overdue
        </span>
      );
    }
    if (diffHours <= 24) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400">
          <Clock className="w-3 h-3" /> Due Today
        </span>
      );
    }
    if (diffHours <= 48) {
      return (
        <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
          Due Tomorrow
        </span>
      );
    }
    const daysLeft = Math.ceil(diffHours / 24);
    return (
      <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-nimbus-100 text-nimbus-700 dark:bg-nimbus-800 dark:text-nimbus-300">
        In {daysLeft} days
      </span>
    );
  };

  const statCards = stats
    ? [
        {
          title: 'Total Tasks',
          value: stats.total,
          icon: ListTodo,
          color: 'brand',
          subtitle: 'All tasks in workspace',
        },
        {
          title: 'Completed',
          value: stats.completed,
          icon: CheckSquare,
          color: 'emerald',
          subtitle: `${stats.completionPercentage}% completion rate`,
        },
        {
          title: 'Pending',
          value: stats.pending,
          icon: Clock,
          color: 'amber',
          subtitle: `${stats.inProgress || 0} in progress`,
        },
        {
          title: 'Overdue Tasks',
          value: stats.overdue || 0,
          icon: AlertTriangle,
          color: stats.overdue > 0 ? 'rose' : 'emerald',
          subtitle: stats.overdue > 0 ? 'Needs immediate attention' : 'All caught up on deadlines',
        },
      ]
    : [];

  const todayRemainingCount = todayFocusTasks.length;
  const todayProgress = stats?.today?.progress ?? stats?.completionPercentage ?? 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Quick Action Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-nimbus-900 dark:text-white">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60">
              <Sparkles className="w-3 h-3" /> Dashboard
            </span>
          </div>
          <p className="text-nimbus-500 mt-1 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} · Here&apos;s your daily productivity summary.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="nimbus-btn-primary self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </motion.div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card, index) => (
              <StatCard key={card.title} {...card} index={index} />
            ))}
      </div>

      {/* 2-Column Section: Today's Focus & Productivity Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Today's Focus Card (7 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-7 nimbus-card p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-nimbus-200 dark:border-nimbus-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-nimbus-900 dark:text-white">
                    Today&apos;s Focus
                  </h3>
                  <p className="text-xs text-nimbus-500">
                    {todayRemainingCount > 0
                      ? `${todayRemainingCount} task${todayRemainingCount > 1 ? 's' : ''} to complete today`
                      : 'You are all done for today! 🎉'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
                  {todayProgress}%
                </span>
                <p className="text-[10px] text-nimbus-400 uppercase tracking-wider font-semibold">
                  Focus Progress
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full h-2.5 bg-nimbus-100 dark:bg-nimbus-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${todayProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full"
                />
              </div>
            </div>

            {/* Today's Tasks List */}
            <div className="mt-5 space-y-2.5">
              {loading ? (
                <div className="space-y-3 py-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-nimbus-100 dark:bg-nimbus-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : todayFocusTasks.length === 0 ? (
                <div className="text-center py-6 bg-nimbus-50/50 dark:bg-nimbus-800/30 rounded-xl p-4 border border-dashed border-nimbus-200 dark:border-nimbus-800">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-sm font-semibold text-nimbus-800 dark:text-nimbus-200">
                    Zero Pending Tasks for Today!
                  </p>
                  <p className="text-xs text-nimbus-500 mt-0.5">
                    Create a new task or take a well-deserved breather.
                  </p>
                </div>
              ) : (
                todayFocusTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-nimbus-50 dark:bg-nimbus-800/40 border border-nimbus-200/70 dark:border-nimbus-800 hover:bg-nimbus-100/70 dark:hover:bg-nimbus-800/70 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => handleQuickComplete(task._id, e)}
                        title="Mark Completed"
                        className="w-5 h-5 rounded border border-nimbus-300 dark:border-nimbus-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-center text-transparent hover:text-emerald-600 transition-colors flex-shrink-0 cursor-pointer"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        to={`/tasks/${task._id}`}
                        className="text-sm font-medium text-nimbus-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
                      >
                        {task.title}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <Badge variant={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
                      {getUrgencyBadge(task.dueDate, task.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 flex items-center justify-between text-xs text-nimbus-500">
            <span>
              {stats?.completed || 0} completed · {stats?.pending || 0} pending
            </span>
            <Link
              to="/tasks"
              className="text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-1"
            >
              View all tasks <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* 2. Productivity Analytics Card (5 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-5 nimbus-card p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-nimbus-200 dark:border-nimbus-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-nimbus-900 dark:text-white">
                    Productivity Analytics
                  </h3>
                  <p className="text-xs text-nimbus-500">Weekly performance & velocity</p>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3.5 rounded-xl bg-nimbus-50 dark:bg-nimbus-800/40 border border-nimbus-200/60 dark:border-nimbus-800">
                <p className="text-xs text-nimbus-500 font-medium">Weekly Completed</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    +{stats?.weeklyCompleted ?? stats?.completed ?? 0}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    this week
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-nimbus-50 dark:bg-nimbus-800/40 border border-nimbus-200/60 dark:border-nimbus-800">
                <p className="text-xs text-nimbus-500 font-medium">Completion Rate</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                    {stats?.completionPercentage ?? 0}%
                  </span>
                  <span className="text-[10px] text-nimbus-400 font-semibold">overall</span>
                </div>
              </div>
            </div>

            {/* Overdue Health Status */}
            <div className="mt-4 p-3.5 rounded-xl bg-nimbus-50 dark:bg-nimbus-800/40 border border-nimbus-200/60 dark:border-nimbus-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {stats?.overdue > 0 ? (
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className="text-xs font-semibold text-nimbus-800 dark:text-nimbus-200">
                    Overdue Health
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    stats?.overdue > 0
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                  }`}
                >
                  {stats?.overdue > 0 ? `${stats.overdue} Overdue` : '0 Overdue (Great)'}
                </span>
              </div>
              <p className="text-[11px] text-nimbus-500 mt-1.5">
                {stats?.overdue > 0
                  ? 'Resolve overdue tasks to maintain high team momentum.'
                  : 'All scheduled tasks are on track with zero delays.'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-nimbus-200 dark:border-nimbus-800 mt-4 flex items-center justify-between text-xs text-nimbus-500">
            <span>Active status: 🟢 Healthy</span>
            <Link to="/tasks" className="text-brand-600 dark:text-brand-400 hover:underline">
              Analytics details &rarr;
            </Link>
          </div>
        </motion.div>
      </div>

      {/* 3. Upcoming Deadlines Section (Next 5 Tasks) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="nimbus-card"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-nimbus-200 dark:border-nimbus-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-nimbus-900 dark:text-white">
                Upcoming Deadlines
              </h3>
              <p className="text-xs text-nimbus-500">Next 5 scheduled tasks needing attention</p>
            </div>
          </div>
          <Link
            to="/tasks"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
          >
            View Calendar / All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-nimbus-100 dark:bg-nimbus-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : upcomingTasks.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-8 h-8 text-nimbus-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-nimbus-800 dark:text-nimbus-200">
              No Upcoming Deadlines
            </p>
            <p className="text-xs text-nimbus-500 mt-1">
              Add due dates when creating tasks to see your scheduled roadmap here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-nimbus-100 dark:divide-nimbus-800">
            {upcomingTasks.map((task) => {
              const overdue = isOverdue(task.dueDate, task.status);
              return (
                <Link
                  key={task._id}
                  to={`/tasks/${task._id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 hover:bg-nimbus-50/80 dark:hover:bg-nimbus-800/40 transition-colors gap-2 group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-nimbus-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-nimbus-500 truncate mt-0.5 max-w-lg">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap flex-shrink-0">
                    <Badge variant={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
                    <Badge variant={STATUS_COLORS[task.status]}>{task.status}</Badge>
                    {getUrgencyBadge(task.dueDate, task.status)}
                    <span className="text-xs font-medium text-nimbus-600 dark:text-nimbus-400 min-w-[85px] text-right">
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* 4. Recent Workspace Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="nimbus-card"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-nimbus-200 dark:border-nimbus-800">
          <div>
            <h3 className="text-base font-semibold text-nimbus-900 dark:text-white">Recent Activity</h3>
            <p className="text-xs text-nimbus-500">Recently created and updated tasks</p>
          </div>
          <Link
            to="/tasks"
            className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View all tasks <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-nimbus-100 dark:bg-nimbus-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-nimbus-500 text-sm">No tasks created yet.</p>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="nimbus-btn-primary mt-3 inline-flex"
            >
              <Plus className="w-4 h-4" /> Create Task
            </button>
          </div>
        ) : (
          <div className="divide-y divide-nimbus-100 dark:divide-nimbus-800">
            {recentTasks.map((task) => (
              <Link
                key={task._id}
                to={`/tasks/${task._id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-nimbus-50/80 dark:hover:bg-nimbus-800/40 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-nimbus-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {task.title}
                  </p>
                  <p className="text-xs text-nimbus-400 mt-0.5">
                    {task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'}
                  </p>
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

      {/* Create Task Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Task"
        size="lg"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setCreateModalOpen(false)}
          loading={submitting}
        />
      </Modal>
    </div>
  );
};

export default DashboardPage;
