import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, AlertCircle } from 'lucide-react';
import Badge from '../ui/Badge';
import { STATUS_COLORS, PRIORITY_COLORS, formatDate, isOverdue } from '../../utils/constants';

const TaskTable = ({ tasks, onEdit, onDelete }) => {
  return (
    <div className="nimbus-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-nimbus-200 dark:border-nimbus-800 bg-nimbus-50/50 dark:bg-nimbus-800/30">
              <th className="text-left text-xs font-semibold text-nimbus-500 uppercase tracking-wider px-6 py-3.5">
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

              return (
                <motion.tr
                  key={task._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-nimbus-50/80 dark:hover:bg-nimbus-800/20 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <Link
                      to={`/tasks/${task._id}`}
                      className="font-medium text-nimbus-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      {task.title}
                    </Link>
                    {task.description && (
                      <p className="text-xs text-nimbus-400 mt-0.5 truncate max-w-xs">
                        {task.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={STATUS_COLORS[task.status]}>{task.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {overdue && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                      <span className={`text-sm ${overdue ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-nimbus-600 dark:text-nimbus-400'}`}>
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-nimbus-500">
                    {formatDate(task.createdAt)}
                  </td>
                  <td className="px-6 py-4">
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
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;
