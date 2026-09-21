import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  AlertCircle,
  ListTree,
  Plus,
  CheckCircle2,
  Circle,
  Edit2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { taskService } from '../services/taskService';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import TaskForm from '../components/tasks/TaskForm';
import Skeleton from '../components/ui/Skeleton';
import {
  STATUS_COLORS,
  PRIORITY_COLORS,
  formatDate,
  formatDateTime,
  isOverdue,
} from '../utils/constants';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Subtask quick modal state
  const [subtaskModalOpen, setSubtaskModalOpen] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [subtaskForm, setSubtaskForm] = useState({
    title: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    dueDate: '',
  });
  const [subtaskSaving, setSubtaskSaving] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await taskService.getTask(id);
        setTask(response.data);
      } catch (error) {
        toast.error('Task not found');
        navigate('/tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, navigate]);

  const handleUpdate = async (data) => {
    setSubmitting(true);
    try {
      const response = await taskService.updateTask(id, data);
      setTask(response.data);
      setEditModal(false);
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await taskService.deleteTask(id);
      toast.success('Task deleted successfully');
      navigate('/tasks');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleToggleSubtask = async (subtaskId) => {
    try {
      const response = await taskService.toggleSubtask(id, subtaskId);
      setTask(response.data);
      const updatedSubtask = response.data?.subtasks?.find((s) => (s._id || s.id) === subtaskId);
      if (updatedSubtask?.status === 'Completed') {
        toast.success('Subtask completed! ✅');
      }
    } catch (err) {
      toast.error('Failed to toggle subtask');
    }
  };

  const handleOpenAddSubtask = () => {
    setEditingSubtask(null);
    setSubtaskForm({
      title: '',
      description: '',
      status: 'Pending',
      priority: 'Medium',
      dueDate: '',
    });
    setSubtaskModalOpen(true);
  };

  const handleOpenEditSubtask = (subtask) => {
    setEditingSubtask(subtask);
    setSubtaskForm({
      title: subtask.title || '',
      description: subtask.description || '',
      status: subtask.status || 'Pending',
      priority: subtask.priority || 'Medium',
      dueDate: subtask.dueDate ? new Date(subtask.dueDate).toISOString().split('T')[0] : '',
    });
    setSubtaskModalOpen(true);
  };

  const handleSaveSubtask = async (e) => {
    e.preventDefault();
    if (!subtaskForm.title.trim()) {
      toast.error('Subtask title is required');
      return;
    }

    setSubtaskSaving(true);
    try {
      if (editingSubtask) {
        const subtaskId = editingSubtask._id || editingSubtask.id;
        const response = await taskService.updateSubtask(id, subtaskId, {
          ...subtaskForm,
          dueDate: subtaskForm.dueDate || null,
        });
        setTask(response.data);
        toast.success('Subtask updated');
      } else {
        const response = await taskService.addSubtask(id, {
          ...subtaskForm,
          dueDate: subtaskForm.dueDate || null,
        });
        setTask(response.data);
        toast.success('Subtask added');
      }
      setSubtaskModalOpen(false);
    } catch (err) {
      toast.error('Failed to save subtask');
    } finally {
      setSubtaskSaving(false);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const response = await taskService.deleteSubtask(id, subtaskId);
      setTask(response.data);
      toast.success('Subtask removed');
    } catch (err) {
      toast.error('Failed to delete subtask');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="nimbus-card p-8 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const overdue = isOverdue(task.dueDate, task.status);
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter((s) => s.status === 'Completed').length;
  const progressPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  const allSubtasksCompleted = totalSubtasks > 0 && completedSubtasks === totalSubtasks;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 text-sm text-nimbus-500 hover:text-nimbus-700 dark:hover:text-nimbus-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </Link>
      </motion.div>

      {/* Main Task Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="nimbus-card"
      >
        <div className="px-6 py-5 border-b border-nimbus-200 dark:border-nimbus-800 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-nimbus-900 dark:text-white">{task.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant={STATUS_COLORS[task.status]}>{task.status}</Badge>
              <Badge variant={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
              {allSubtasksCompleted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Sparkles className="w-3.5 h-3.5" /> All subtasks completed
                </span>
              )}
              {overdue && (
                <span className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Overdue
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="secondary" size="sm" onClick={() => setEditModal(true)}>
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteModal(true)}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {task.description ? (
            <div>
              <h3 className="text-sm font-semibold text-nimbus-500 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-nimbus-700 dark:text-nimbus-300 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          ) : (
            <p className="text-nimbus-400 italic">No description provided.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-nimbus-50 dark:bg-nimbus-800/50">
              <Calendar className="w-5 h-5 text-nimbus-400" />
              <div>
                <p className="text-xs text-nimbus-500">Due Date</p>
                <p className={`text-sm font-medium ${overdue ? 'text-rose-600' : 'text-nimbus-900 dark:text-white'}`}>
                  {formatDate(task.dueDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-nimbus-50 dark:bg-nimbus-800/50">
              <Clock className="w-5 h-5 text-nimbus-400" />
              <div>
                <p className="text-xs text-nimbus-500">Created</p>
                <p className="text-sm font-medium text-nimbus-900 dark:text-white">
                  {formatDateTime(task.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subtasks Section Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="nimbus-card"
      >
        <div className="px-6 py-4 border-b border-nimbus-200 dark:border-nimbus-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
              <ListTree className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-nimbus-900 dark:text-white">
                Subtasks & Checklist
              </h2>
              <p className="text-xs text-nimbus-500">
                {totalSubtasks === 0
                  ? 'No subtasks yet'
                  : `${completedSubtasks}/${totalSubtasks} subtasks completed (${progressPercentage}%)`}
              </p>
            </div>
          </div>

          <Button size="sm" onClick={handleOpenAddSubtask}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Subtask
          </Button>
        </div>

        {/* Subtask Progress Bar */}
        {totalSubtasks > 0 && (
          <div className="px-6 pt-4 pb-1">
            <div className="w-full h-2 rounded-full bg-nimbus-100 dark:bg-nimbus-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  allSubtasksCompleted ? 'bg-emerald-500' : 'bg-brand-600'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Subtask Items List */}
        <div className="px-6 py-4 space-y-2.5">
          {totalSubtasks === 0 ? (
            <div className="text-center py-8 text-nimbus-400">
              <ListTree className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-nimbus-600 dark:text-nimbus-400">
                No subtasks created for this task.
              </p>
              <p className="text-xs mt-1">
                Click &quot;Add Subtask&quot; to break this item down into actionable milestones.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-nimbus-100 dark:divide-nimbus-800/60">
              {subtasks.map((subtask) => {
                const subtaskId = subtask._id || subtask.id;
                const isCompleted = subtask.status === 'Completed';
                const subOverdue = isOverdue(subtask.dueDate, subtask.status);

                return (
                  <div
                    key={subtaskId}
                    className="flex items-start justify-between gap-3 py-3 group hover:bg-nimbus-50/50 dark:hover:bg-nimbus-800/20 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(subtaskId)}
                        className={`mt-0.5 flex-shrink-0 cursor-pointer transition-colors ${
                          isCompleted
                            ? 'text-emerald-500 hover:text-emerald-600'
                            : 'text-nimbus-300 hover:text-brand-600 dark:text-nimbus-600 dark:hover:text-brand-400'
                        }`}
                        title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950/40" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${
                            isCompleted
                              ? 'line-through text-nimbus-400 dark:text-nimbus-500'
                              : 'text-nimbus-900 dark:text-white'
                          }`}
                        >
                          {subtask.title}
                        </p>
                        {subtask.description && (
                          <p className="text-xs text-nimbus-500 mt-0.5 leading-relaxed">
                            {subtask.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${STATUS_COLORS[subtask.status] || STATUS_COLORS.Pending}`}>
                            {subtask.status}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${PRIORITY_COLORS[subtask.priority] || PRIORITY_COLORS.Medium}`}>
                            {subtask.priority}
                          </span>
                          {subtask.dueDate && (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] ${
                                subOverdue
                                  ? 'text-rose-600 font-semibold dark:text-rose-400'
                                  : 'text-nimbus-400 dark:text-nimbus-500'
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              {formatDate(subtask.dueDate)}
                              {subOverdue && '(Overdue)'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSubtask(subtask)}
                        className="p-1.5 rounded-lg text-nimbus-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-nimbus-100 dark:hover:bg-nimbus-800 transition-colors cursor-pointer"
                        title="Edit subtask"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(subtaskId)}
                        className="p-1.5 rounded-lg text-nimbus-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete subtask"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Main Task Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Task" size="lg">
        <TaskForm
          initialData={task}
          onSubmit={handleUpdate}
          onCancel={() => setEditModal(false)}
          loading={submitting}
        />
      </Modal>

      {/* Delete Main Task Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Task" size="sm">
        <p className="text-nimbus-600 dark:text-nimbus-400 mb-6">
          Are you sure you want to delete this task? All associated subtasks will also be deleted. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      {/* Quick Add/Edit Subtask Modal */}
      <Modal
        isOpen={subtaskModalOpen}
        onClose={() => setSubtaskModalOpen(false)}
        title={editingSubtask ? 'Edit Subtask' : 'Add Subtask'}
        size="md"
      >
        <form onSubmit={handleSaveSubtask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-nimbus-700 dark:text-nimbus-300 mb-1">
              Subtask Title *
            </label>
            <input
              type="text"
              value={subtaskForm.title}
              onChange={(e) => setSubtaskForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Design mockups, Write API unit tests..."
              className="nimbus-input text-sm"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-nimbus-700 dark:text-nimbus-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={subtaskForm.description}
              onChange={(e) => setSubtaskForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Add extra context or instructions..."
              className="nimbus-input text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-nimbus-700 dark:text-nimbus-300 mb-1">
                Status
              </label>
              <select
                value={subtaskForm.status}
                onChange={(e) => setSubtaskForm((prev) => ({ ...prev, status: e.target.value }))}
                className="nimbus-input text-xs"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-nimbus-700 dark:text-nimbus-300 mb-1">
                Priority
              </label>
              <select
                value={subtaskForm.priority}
                onChange={(e) => setSubtaskForm((prev) => ({ ...prev, priority: e.target.value }))}
                className="nimbus-input text-xs"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-nimbus-700 dark:text-nimbus-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={subtaskForm.dueDate}
                onChange={(e) => setSubtaskForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="nimbus-input text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-nimbus-100 dark:border-nimbus-800">
            <button
              type="button"
              onClick={() => setSubtaskModalOpen(false)}
              className="nimbus-btn-secondary text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={subtaskSaving}
              className="nimbus-btn-primary text-xs cursor-pointer"
            >
              {subtaskSaving ? 'Saving...' : editingSubtask ? 'Update Subtask' : 'Add Subtask'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TaskDetailPage;
