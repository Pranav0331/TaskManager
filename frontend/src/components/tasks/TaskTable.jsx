import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Eye,
  Pencil,
  Trash2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  ListTodo,
  Check,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../ui/Badge';
import { STATUS_COLORS, PRIORITY_COLORS, formatDate, isOverdue } from '../../utils/constants';
import { taskService } from '../../services/taskService';

const TaskTable = ({ tasks, onEdit, onDelete, onTaskUpdated }) => {
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [togglingSubtask, setTogglingSubtask] = useState(null);

  const toggleExpand = (taskId) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleSubtaskToggle = async (taskId, subtaskId, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    setTogglingSubtask(subtaskId);
    try {
      await taskService.toggleSubtask(taskId, subtaskId, nextStatus);
      toast.success(
        nextStatus === 'Completed' ? 'Subtask completed!' : 'Subtask marked pending'
      );
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      toast.error('Failed to update subtask');
    } finally {
      setTogglingSubtask(null);
    }
  };

  return (
    <div className="nimbus-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-nimbus-200 dark:border-nimbus-800 bg-nimbus-50/50 dark:bg-nimbus-800/30">
              <th className="w-8 px-3 py-3.5"></th>
              <th className="text-left text-xs font-semibold text-nimbus-500 uppercase tracking-wider px-4 py-3.5">
                Task
              </th>
              <th className="text-left text-xs font-semibold text-nimbus-500 uppercase tracking-wider px-6 py-3.5">
                Status
              </th>
              <th className="text-left text-xs font-semibold text-nimbus-500 uppercase tracking-wider px-6 py-3.5">
                Priority
              </th>
              <th className="text-left text-xs font-semibold text-nimbus-500 uppercase tracking-wider px-6 py-3.5">
                Due Date
              </th>
              <th className="text-left text-xs font-semibold text-nimbus-500 uppercase tracking-wider px-6 py-3.5">
                Created
              </th>
              <th className="text-right text-xs font-semibold text-nimbus-500 uppercase tracking-wider px-6 py-3.5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nimbus-100 dark:divide-nimbus-800">
            {tasks.map((task, index) => {
              const overdue = isOverdue(task.dueDate, task.status);
              const subtasks = task.subtasks || [];
              const hasSubtasks = subtasks.length > 0;
              const completedSubtasks = subtasks.filter((s) => s.status === 'Completed').length;
              const allSubtasksDone = hasSubtasks && completedSubtasks === subtasks.length;
              const isExpanded = expandedTasks.has(task._id);

              return (
                <tr key={task._id} className="group">
                  <td colSpan={7} className="p-0">
                    <div className="flex flex-col">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="flex items-center hover:bg-nimbus-50/80 dark:hover:bg-nimbus-800/20 transition-colors w-full"
                      >
                        {/* Expand toggle */}
                        <div className="w-10 px-3 py-4 flex items-center justify-center flex-shrink-0">
                          {hasSubtasks ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(task._id)}
                              className="p-1 rounded-md text-nimbus-400 hover:text-nimbus-700 dark:hover:text-nimbus-200 hover:bg-nimbus-100 dark:hover:bg-nimbus-800 transition-colors"
                              title={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <span className="w-4 h-4" />
                          )}
                        </div>

                        {/* Task Title & Subtasks Badge */}
                        <div className="flex-1 px-4 py-4 min-w-[200px]">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              to={`/tasks/${task._id}`}
                              className="font-medium text-nimbus-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                            >
                              {task.title}
                            </Link>

                            {hasSubtasks && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(task._id)}
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                                  allSubtasksDone
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50'
                                    : 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50'
                                }`}
                                title="Click to view subtasks"
                              >
                                {allSubtasksDone ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    <span>All subtasks completed</span>
                                  </>
                                ) : (
                                  <>
                                    <ListTodo className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                                    <span>
                                      {completedSubtasks}/{subtasks.length} subtasks completed
                                    </span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {task.description && (
                            <p className="text-xs text-nimbus-400 mt-0.5 truncate max-w-sm">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Status */}
                        <div className="w-32 px-6 py-4 flex-shrink-0">
                          <Badge variant={STATUS_COLORS[task.status]}>{task.status}</Badge>
                        </div>

                        {/* Priority */}
                        <div className="w-28 px-6 py-4 flex-shrink-0">
                          <Badge variant={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
                        </div>

                        {/* Due Date */}
                        <div className="w-36 px-6 py-4 flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            {overdue && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                            <span
                              className={`text-sm ${
                                overdue
                                  ? 'text-rose-600 dark:text-rose-400 font-medium'
                                  : 'text-nimbus-600 dark:text-nimbus-400'
                              }`}
                            >
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>

                        {/* Created Date */}
                        <div className="w-32 px-6 py-4 text-sm text-nimbus-500 flex-shrink-0">
                          {formatDate(task.createdAt)}
                        </div>

                        {/* Actions */}
                        <div className="w-28 px-6 py-4 flex-shrink-0 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              to={`/tasks/${task._id}`}
                              className="p-1.5 rounded-lg hover:bg-nimbus-100 dark:hover:bg-nimbus-800 text-nimbus-500"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => onEdit(task)}
                              className="p-1.5 rounded-lg hover:bg-nimbus-100 dark:hover:bg-nimbus-800 text-nimbus-500"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDelete(task)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>

                      {/* Expanded Subtasks List */}
                      <AnimatePresence>
                        {isExpanded && hasSubtasks && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-nimbus-50/60 dark:bg-nimbus-900/40 border-t border-b border-nimbus-100 dark:border-nimbus-800/80 px-12 py-3.5"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-nimbus-500 uppercase tracking-wider flex items-center gap-1.5">
                                <ListTodo className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                                Subtasks ({completedSubtasks}/{subtasks.length} Completed)
                              </span>
                              <Link
                                to={`/tasks/${task._id}`}
                                className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                              >
                                Manage in detail &rarr;
                              </Link>
                            </div>

                            <div className="space-y-2">
                              {subtasks.map((subtask) => {
                                const isDone = subtask.status === 'Completed';
                                const subtaskOverdue =
                                  subtask.dueDate && isOverdue(subtask.dueDate, subtask.status);
                                const isBusy = togglingSubtask === subtask._id;

                                return (
                                  <div
                                    key={subtask._id}
                                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all text-xs ${
                                      isDone
                                        ? 'bg-nimbus-100/40 dark:bg-nimbus-800/20 border-nimbus-200/40 dark:border-nimbus-800/40 opacity-75'
                                        : 'bg-white dark:bg-nimbus-850 border-nimbus-200/70 dark:border-nimbus-700/60 shadow-xs'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <button
                                        type="button"
                                        disabled={isBusy}
                                        onClick={() =>
                                          handleSubtaskToggle(task._id, subtask._id, subtask.status)
                                        }
                                        className={`w-4 h-4 rounded flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer ${
                                          isDone
                                            ? 'bg-emerald-600 text-white border border-emerald-600'
                                            : 'border border-nimbus-300 dark:border-nimbus-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                        }`}
                                      >
                                        {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                                      </button>

                                      <span
                                        className={`font-medium ${
                                          isDone
                                            ? 'line-through text-nimbus-400 dark:text-nimbus-500'
                                            : 'text-nimbus-800 dark:text-nimbus-200'
                                        }`}
                                      >
                                        {subtask.title}
                                      </span>

                                      {subtask.description && (
                                        <span className="text-nimbus-400 truncate max-w-xs hidden md:inline">
                                          — {subtask.description}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                      <Badge variant={PRIORITY_COLORS[subtask.priority] || 'slate'}>
                                        {subtask.priority}
                                      </Badge>
                                      {subtask.dueDate && (
                                        <span
                                          className={`inline-flex items-center gap-1 ${
                                            subtaskOverdue
                                              ? 'text-rose-600 dark:text-rose-400 font-semibold'
                                              : 'text-nimbus-500'
                                          }`}
                                        >
                                          <Calendar className="w-3 h-3" />
                                          {formatDate(subtask.dueDate)}
                                        </span>
                                      )}
                                      <Badge variant={STATUS_COLORS[subtask.status] || 'slate'}>
                                        {subtask.status}
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;
