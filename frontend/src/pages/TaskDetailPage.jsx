import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  AlertCircle,
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

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 text-sm text-nimbus-500 hover:text-nimbus-700 dark:hover:text-nimbus-300 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </Link>
      </motion.div>

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

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Task" size="lg">
        <TaskForm
          initialData={task}
          onSubmit={handleUpdate}
          onCancel={() => setEditModal(false)}
          loading={submitting}
        />
      </Modal>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Task" size="sm">
        <p className="text-nimbus-600 dark:text-nimbus-400 mb-6">
          Are you sure you want to delete this task? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

export default TaskDetailPage;
