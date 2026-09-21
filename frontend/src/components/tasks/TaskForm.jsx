import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckSquare, ListTree } from 'lucide-react';
import Button from '../ui/Button';

const TaskForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    dueDate: '',
    subtasks: [],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'Pending',
        priority: initialData.priority || 'Medium',
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split('T')[0]
          : '',
        subtasks: Array.isArray(initialData.subtasks)
          ? initialData.subtasks.map((s) => ({
              id: s._id || s.id,
              _id: s._id || s.id,
              title: s.title || '',
              description: s.description || '',
              status: s.status || 'Pending',
              priority: s.priority || 'Medium',
              dueDate: s.dueDate
                ? new Date(s.dueDate).toISOString().split('T')[0]
                : '',
            }))
          : [],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubtask = () => {
    setForm((prev) => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        {
          id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: '',
          description: '',
          status: 'Pending',
          priority: 'Medium',
          dueDate: '',
        },
      ],
    }));
  };

  const handleSubtaskChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.subtasks];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, subtasks: updated };
    });
  };

  const handleRemoveSubtask = (index) => {
    setForm((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validSubtasks = form.subtasks
      .filter((s) => s.title && s.title.trim())
      .map((s) => {
        const subtaskPayload = {
          title: s.title.trim(),
          description: s.description ? s.description.trim() : '',
          status: s.status || 'Pending',
          priority: s.priority || 'Medium',
          dueDate: s.dueDate || null,
        };

        const existingId = s._id || s.id;
        if (
          existingId &&
          !String(existingId).startsWith('temp-') &&
          /^[0-9a-fA-F]{24}$/.test(String(existingId))
        ) {
          subtaskPayload._id = existingId;
        }

        return subtaskPayload;
      });

    onSubmit({
      ...form,
      dueDate: form.dueDate || null,
      subtasks: validSubtasks,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-nimbus-700 dark:text-nimbus-300 mb-1.5">
          Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          placeholder="Enter task title"
          className="nimbus-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-nimbus-700 dark:text-nimbus-300 mb-1.5">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Add a description..."
          className="nimbus-input resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-nimbus-700 dark:text-nimbus-300 mb-1.5">
            Status
          </label>
          <select name="status" value={form.status} onChange={handleChange} className="nimbus-input">
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-nimbus-700 dark:text-nimbus-300 mb-1.5">
            Priority
          </label>
          <select name="priority" value={form.priority} onChange={handleChange} className="nimbus-input">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-nimbus-700 dark:text-nimbus-300 mb-1.5">
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="nimbus-input"
          />
        </div>
      </div>

      {/* Subtasks Section */}
      <div className="pt-3 border-t border-nimbus-200 dark:border-nimbus-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTree className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span className="text-sm font-semibold text-nimbus-900 dark:text-white">
              Subtasks
            </span>
            {form.subtasks.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60">
                {form.subtasks.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddSubtask}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 hover:bg-brand-100 dark:hover:bg-brand-900/80 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Subtask
          </button>
        </div>

        {form.subtasks.length === 0 ? (
          <p className="text-xs text-nimbus-400 italic">
            No subtasks added yet. Click &quot;+ Add Subtask&quot; to break this task down into smaller steps.
          </p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {form.subtasks.map((subtask, index) => (
              <div
                key={subtask.id || index}
                className="p-3 rounded-xl border border-nimbus-200 dark:border-nimbus-800 bg-nimbus-50/60 dark:bg-nimbus-900/40 space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
                    placeholder="Subtask title *"
                    required
                    className="flex-1 text-sm bg-white dark:bg-nimbus-800 border border-nimbus-200 dark:border-nimbus-700 rounded-lg px-2.5 py-1.5 text-nimbus-900 dark:text-white placeholder:text-nimbus-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(index)}
                    title="Remove subtask"
                    className="p-1.5 text-nimbus-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={subtask.description}
                  onChange={(e) => handleSubtaskChange(index, 'description', e.target.value)}
                  placeholder="Optional details or note..."
                  className="w-full text-xs bg-white dark:bg-nimbus-800 border border-nimbus-200 dark:border-nimbus-700 rounded-lg px-2.5 py-1 text-nimbus-800 dark:text-nimbus-200 placeholder:text-nimbus-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />

                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={subtask.status}
                    onChange={(e) => handleSubtaskChange(index, 'status', e.target.value)}
                    className="text-xs bg-white dark:bg-nimbus-800 border border-nimbus-200 dark:border-nimbus-700 rounded-lg px-2 py-1 text-nimbus-800 dark:text-nimbus-200 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <select
                    value={subtask.priority}
                    onChange={(e) => handleSubtaskChange(index, 'priority', e.target.value)}
                    className="text-xs bg-white dark:bg-nimbus-800 border border-nimbus-200 dark:border-nimbus-700 rounded-lg px-2 py-1 text-nimbus-800 dark:text-nimbus-200 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>

                  <input
                    type="date"
                    value={subtask.dueDate}
                    onChange={(e) => handleSubtaskChange(index, 'dueDate', e.target.value)}
                    className="text-xs bg-white dark:bg-nimbus-800 border border-nimbus-200 dark:border-nimbus-700 rounded-lg px-2 py-1 text-nimbus-800 dark:text-nimbus-200 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
