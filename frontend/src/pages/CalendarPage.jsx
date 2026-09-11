import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckSquare,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { taskService } from '../services/taskService';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import TaskForm from '../components/tasks/TaskForm';
import { STATUS_COLORS, PRIORITY_COLORS, formatDate } from '../utils/constants';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CalendarPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await taskService.getTasks({ sortBy: 'dueDate', order: 'asc' });
      setTasks(response.data || []);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const handleGoToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const tasksByDate = useMemo(() => {
    const map = new Map();
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const d = new Date(task.dueDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const existing = map.get(key) || [];
      existing.push(task);
      map.set(key, existing);
    });
    return map;
  }, [tasks]);

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
      });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
      });
    }
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
      });
    }
    return days;
  }, [year, month]);

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    return tasksByDate.get(key) || [];
  }, [selectedDate, tasksByDate]);

  const handleCreateTask = async (data) => {
    setSubmitting(true);
    try {
      await taskService.createTask(data);
      toast.success('Task scheduled successfully!');
      setModalOpen(false);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickComplete = async (taskId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await taskService.updateTask(taskId, { status: 'Completed' });
      toast.success('Task marked completed!');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-nimbus-900 dark:text-white flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            Calendar & Schedule
          </h2>
          <p className="text-nimbus-500 mt-1 text-sm">
            View deadline distribution, track due dates and schedule upcoming tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGoToToday}
            className="nimbus-btn-secondary text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Today
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="nimbus-btn-primary text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule Task
          </button>
        </div>
      </motion.div>

      {/* Main Grid: Full Calendar on left, Selected Day tasks on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar View (8 cols) */}
        <div className="lg:col-span-8 nimbus-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-nimbus-100 dark:border-nimbus-800">
            <h3 className="text-lg font-bold text-nimbus-900 dark:text-white">
              {monthName}
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-lg hover:bg-nimbus-100 dark:hover:bg-nimbus-800 text-nimbus-600 dark:text-nimbus-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-lg hover:bg-nimbus-100 dark:hover:bg-nimbus-800 text-nimbus-600 dark:text-nimbus-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mt-4 text-center">
            {WEEKDAYS.map((wd) => (
              <span
                key={wd}
                className="text-xs font-semibold text-nimbus-400 dark:text-nimbus-500 uppercase tracking-wider py-1 truncate"
              >
                <span className="hidden sm:inline">{wd}</span>
                <span className="sm:hidden">{wd.slice(0, 2)}</span>
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mt-2">
            {calendarDays.map((item, idx) => {
              const dateObj = new Date(item.year, item.month, item.day);
              const isToday = isSameDay(dateObj, new Date());
              const isSelected = selectedDate && isSameDay(dateObj, selectedDate);
              const dateKey = `${item.year}-${item.month}-${item.day}`;
              const dayTasks = tasksByDate.get(dateKey) || [];

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDate(dateObj)}
                  className={`min-h-[70px] sm:min-h-[86px] p-2 rounded-xl text-left flex flex-col justify-between transition-all duration-150 border ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-1 ring-brand-500'
                      : isToday
                      ? 'border-brand-300/80 bg-brand-50/20 dark:bg-brand-900/20'
                      : item.isCurrentMonth
                      ? 'border-nimbus-100 dark:border-nimbus-800/80 hover:bg-nimbus-50 dark:hover:bg-nimbus-850'
                      : 'border-transparent text-nimbus-300 dark:text-nimbus-600 hover:bg-nimbus-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                        isSelected
                          ? 'bg-brand-600 text-white'
                          : isToday
                          ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 font-bold'
                          : item.isCurrentMonth
                          ? 'text-nimbus-800 dark:text-nimbus-200'
                          : 'text-nimbus-400'
                      }`}
                    >
                      {item.day}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task._id}
                        className="text-[10px] font-medium truncate px-1.5 py-0.5 rounded bg-white/80 dark:bg-nimbus-800 text-nimbus-700 dark:text-nimbus-300 border border-nimbus-200/50 dark:border-nimbus-700/50"
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] text-nimbus-400 block px-1">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Tasks List (4 cols) */}
        <div className="lg:col-span-4 nimbus-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-nimbus-100 dark:border-nimbus-800">
              <div>
                <h3 className="text-base font-semibold text-nimbus-900 dark:text-white">
                  {selectedDate?.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
                <p className="text-xs text-nimbus-500">
                  {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''} due
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="p-1.5 text-xs font-semibold rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-14 bg-nimbus-100 dark:bg-nimbus-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : selectedDateTasks.length === 0 ? (
                <div className="py-12 text-center bg-nimbus-50/40 dark:bg-nimbus-800/20 rounded-xl border border-dashed border-nimbus-200 dark:border-nimbus-800 p-4">
                  <Clock className="w-8 h-8 text-nimbus-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-nimbus-800 dark:text-nimbus-200">
                    No tasks scheduled
                  </p>
                  <p className="text-xs text-nimbus-500 mt-0.5">
                    Click below to add a task for this date.
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="nimbus-btn-secondary text-xs mt-3"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Task
                  </button>
                </div>
              ) : (
                selectedDateTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-3 rounded-xl bg-nimbus-50 dark:bg-nimbus-800/40 border border-nimbus-100 dark:border-nimbus-800 hover:bg-nimbus-100/70 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => handleQuickComplete(task._id, e)}
                          title="Mark Complete"
                          className="w-4 h-4 rounded border border-nimbus-300 dark:border-nimbus-600 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center text-transparent hover:text-emerald-600 transition-colors flex-shrink-0"
                        >
                          <CheckSquare className="w-3 h-3" />
                        </button>
                        <Link
                          to={`/tasks/${task._id}`}
                          className="text-sm font-medium text-nimbus-900 dark:text-white truncate hover:text-brand-600 transition-colors"
                        >
                          {task.title}
                        </Link>
                      </div>
                      <Badge variant={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-nimbus-200/40 dark:border-nimbus-700/30 text-[11px] text-nimbus-500">
                      <Badge variant={STATUS_COLORS[task.status]}>{task.status}</Badge>
                      <span>{task.dueDate ? formatDate(task.dueDate) : 'No time'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-nimbus-100 dark:border-nimbus-800 mt-4 text-center">
            <Link
              to="/tasks"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View Full Task Table &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Modal for creating task */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule Task"
        size="lg"
      >
        <TaskForm
          initialData={{
            dueDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
          }}
          onSubmit={handleCreateTask}
          onCancel={() => setModalOpen(false)}
          loading={submitting}
        />
      </Modal>
    </div>
  );
};

export default CalendarPage;
