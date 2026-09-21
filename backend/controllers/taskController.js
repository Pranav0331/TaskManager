import Task from '../models/Task.js';
import { sendTaskNotification } from '../services/notificationService.js';

/**
 * @desc    Get all tasks for logged in user with search, filter, sort
 * @route   GET /api/tasks
 * @access  Private
 */
export const getTasks = async (req, res) => {
  try {
    const { search, status, priority, sortBy = 'dueDate', order = 'asc' } = req.query;

    const filter = {
      $or: [{ userId: req.user._id }, { assignedTo: req.user._id }],
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (search) {
      filter.$and = [
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    const sortOptions = {};
    const validSortFields = ['dueDate', 'createdAt', 'title', 'priority', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'dueDate';
    sortOptions[sortField] = order === 'desc' ? -1 : 1;

    const tasks = await Task.find(filter).sort(sortOptions);

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get dashboard analytics
 * @route   GET /api/tasks/stats
 * @access  Private
 */
export const getTaskStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const filter = {
      $or: [{ userId }, { assignedTo: userId }],
    };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      total,
      completed,
      pending,
      inProgress,
      overdue,
      weeklyCompleted,
      todayDue,
      todayCompleted,
    ] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: 'Completed' }),
      Task.countDocuments({ ...filter, status: 'Pending' }),
      Task.countDocuments({ ...filter, status: 'In Progress' }),
      Task.countDocuments({ ...filter, dueDate: { $lt: now }, status: { $ne: 'Completed' } }),
      Task.countDocuments({ ...filter, status: 'Completed', updatedAt: { $gte: sevenDaysAgo } }),
      Task.countDocuments({ ...filter, dueDate: { $gte: startOfToday, $lte: endOfToday } }),
      Task.countDocuments({ ...filter, status: 'Completed', updatedAt: { $gte: startOfToday } }),
    ]);

    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const todayTotal = todayDue + todayCompleted;
    const todayProgress = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : (completed > 0 ? completionPercentage : 0);

    res.json({
      success: true,
      data: {
        total,
        completed,
        pending,
        inProgress,
        overdue,
        weeklyCompleted,
        completionPercentage,
        today: {
          due: todayDue,
          completed: todayCompleted,
          total: todayTotal,
          progress: todayProgress,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
export const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { assignedTo: req.user._id }],
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Create new task
 * @route   POST /api/tasks
 * @access  Private
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, subtasks } = req.body;

    const parsedSubtasks = Array.isArray(subtasks)
      ? subtasks.map((s) => ({
          title: (s.title || '').trim(),
          description: (s.description || '').trim(),
          status: s.status || 'Pending',
          priority: s.priority || 'Medium',
          dueDate: s.dueDate || null,
        })).filter((s) => s.title)
      : [];

    let initialStatus = status || 'Pending';
    if (parsedSubtasks.length > 0 && parsedSubtasks.every((s) => s.status === 'Completed')) {
      initialStatus = 'Completed';
    }

    const task = await Task.create({
      title,
      description,
      status: initialStatus,
      priority,
      dueDate: dueDate || null,
      subtasks: parsedSubtasks,
      userId: req.user._id,
      assignedTo: assignedTo || req.user._id,
    });

    // Send push notification to all devices of user and assignee
    const recipients = Array.from(
      new Set([task.userId?.toString(), task.assignedTo?.toString()].filter(Boolean))
    );

    sendTaskNotification({
      type: 'created',
      task,
      userId: recipients,
      initiatorName: req.user.name,
    }).catch((err) => console.error('[Task] Push notification error on create:', err.message));

    // If assigned to a different user, also send assignment notification to them
    if (task.assignedTo && task.assignedTo.toString() !== task.userId.toString()) {
      sendTaskNotification({
        type: 'assignment',
        task,
        userId: task.assignedTo,
        initiatorName: req.user.name,
      }).catch((err) => console.error('[Task] Push notification error on assign:', err.message));
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
export const updateTask = async (req, res) => {
  try {
    let task = await Task.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { assignedTo: req.user._id }],
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const prevStatus = task.status;
    const prevAssignedTo = task.assignedTo?.toString();
    const { title, description, status, priority, dueDate, assignedTo, subtasks } = req.body;

    const updateData = {
      title: title ?? task.title,
      description: description ?? task.description,
      status: status ?? task.status,
      priority: priority ?? task.priority,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate,
      assignedTo: assignedTo !== undefined ? assignedTo : task.assignedTo,
    };

    if (Array.isArray(subtasks)) {
      updateData.subtasks = subtasks.map((s) => ({
        _id: s._id || s.id,
        title: (s.title || '').trim(),
        description: (s.description || '').trim(),
        status: s.status || 'Pending',
        priority: s.priority || 'Medium',
        dueDate: s.dueDate || null,
      })).filter((s) => s.title);

      if (updateData.subtasks.length > 0) {
        const allCompleted = updateData.subtasks.every((s) => s.status === 'Completed');
        if (allCompleted) {
          updateData.status = 'Completed';
        } else if (task.status === 'Completed' && status === undefined) {
          updateData.status = 'In Progress';
        }
      }
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    const recipients = Array.from(
      new Set([task.userId?.toString(), task.assignedTo?.toString()].filter(Boolean))
    );

    // Asynchronously trigger notification for completion across all user devices
    if (task.status === 'Completed' && prevStatus !== 'Completed') {
      sendTaskNotification({
        type: 'completed',
        task,
        userId: recipients,
        initiatorName: req.user.name,
      }).catch((err) => console.error('[Task] Push notification error on complete:', err.message));
    } else if (assignedTo && assignedTo.toString() !== prevAssignedTo) {
      // Reassigned
      sendTaskNotification({
        type: 'assignment',
        task,
        userId: assignedTo,
        initiatorName: req.user.name,
      }).catch((err) => console.error('[Task] Push notification error on reassign:', err.message));

      sendTaskNotification({
        type: 'updated',
        task,
        userId: task.userId,
        initiatorName: req.user.name,
        customMessage: `Task "${task.title}" was reassigned.`,
      }).catch((err) => console.error('[Task] Push notification error on update:', err.message));
    } else {
      // General task update
      sendTaskNotification({
        type: 'updated',
        task,
        userId: recipients,
        initiatorName: req.user.name,
      }).catch((err) => console.error('[Task] Push notification error on update:', err.message));
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { assignedTo: req.user._id }],
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const recipients = Array.from(
      new Set([task.userId?.toString(), task.assignedTo?.toString()].filter(Boolean))
    );

    await Task.findByIdAndDelete(req.params.id);

    sendTaskNotification({
      type: 'deleted',
      task,
      userId: recipients,
      initiatorName: req.user.name,
    }).catch((err) => console.error('[Task] Push notification error on delete:', err.message));

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Add a subtask to parent task
 * @route   POST /api/tasks/:id/subtasks
 * @access  Private
 */
export const addSubtask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { assignedTo: req.user._id }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const { title, description, status = 'Pending', priority = 'Medium', dueDate } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Subtask title is required' });
    }

    task.subtasks.push({
      title: title.trim(),
      description: description ? description.trim() : '',
      status,
      priority,
      dueDate: dueDate || null,
    });

    if (task.subtasks.length > 0 && task.subtasks.every((s) => s.status === 'Completed')) {
      task.status = 'Completed';
    }

    await task.save();

    const createdSubtask = task.subtasks[task.subtasks.length - 1];
    const recipients = Array.from(
      new Set([task.userId?.toString(), task.assignedTo?.toString()].filter(Boolean))
    );

    sendTaskNotification({
      type: 'subtask_created',
      task: {
        ...task.toObject(),
        subtask: createdSubtask.toObject(),
      },
      userId: recipients,
      initiatorName: req.user.name,
    }).catch((err) => console.error('[Subtask] Notification error on create:', err.message));

    res.status(201).json({
      success: true,
      message: 'Subtask added successfully',
      data: task,
      subtask: createdSubtask,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update a subtask inside parent task
 * @route   PUT /api/tasks/:id/subtasks/:subtaskId
 * @access  Private
 */
export const updateSubtask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { assignedTo: req.user._id }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ success: false, message: 'Subtask not found' });
    }

    const prevSubtaskStatus = subtask.status;
    const { title, description, status, priority, dueDate } = req.body;

    if (title !== undefined) subtask.title = title.trim();
    if (description !== undefined) subtask.description = description.trim();
    if (status !== undefined) subtask.status = status;
    if (priority !== undefined) subtask.priority = priority;
    if (dueDate !== undefined) subtask.dueDate = dueDate || null;

    if (task.subtasks.length > 0) {
      const allCompleted = task.subtasks.every((s) => s.status === 'Completed');
      if (allCompleted) {
        task.status = 'Completed';
      } else if (task.status === 'Completed' && status !== 'Completed') {
        task.status = 'In Progress';
      }
    }

    await task.save();

    const recipients = Array.from(
      new Set([task.userId?.toString(), task.assignedTo?.toString()].filter(Boolean))
    );

    const notificationType =
      status === 'Completed' && prevSubtaskStatus !== 'Completed'
        ? 'subtask_completed'
        : 'subtask_updated';

    sendTaskNotification({
      type: notificationType,
      task: {
        ...task.toObject(),
        subtask: subtask.toObject(),
      },
      userId: recipients,
      initiatorName: req.user.name,
    }).catch((err) => console.error('[Subtask] Notification error on update:', err.message));

    res.json({
      success: true,
      message: 'Subtask updated successfully',
      data: task,
      subtask,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Toggle subtask completion status
 * @route   PATCH /api/tasks/:id/subtasks/:subtaskId/toggle
 * @access  Private
 */
export const toggleSubtask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { assignedTo: req.user._id }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ success: false, message: 'Subtask not found' });
    }

    const newStatus = subtask.status === 'Completed' ? 'Pending' : 'Completed';
    subtask.status = newStatus;

    if (task.subtasks.length > 0) {
      const allCompleted = task.subtasks.every((s) => s.status === 'Completed');
      if (allCompleted) {
        task.status = 'Completed';
      } else if (task.status === 'Completed' && newStatus !== 'Completed') {
        task.status = 'In Progress';
      }
    }

    await task.save();

    const recipients = Array.from(
      new Set([task.userId?.toString(), task.assignedTo?.toString()].filter(Boolean))
    );

    if (newStatus === 'Completed') {
      sendTaskNotification({
        type: 'subtask_completed',
        task: {
          ...task.toObject(),
          subtask: subtask.toObject(),
        },
        userId: recipients,
        initiatorName: req.user.name,
      }).catch((err) => console.error('[Subtask] Notification error on toggle complete:', err.message));
    }

    res.json({
      success: true,
      message: `Subtask marked ${newStatus.toLowerCase()}`,
      data: task,
      subtask,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a subtask from parent task
 * @route   DELETE /api/tasks/:id/subtasks/:subtaskId
 * @access  Private
 */
export const deleteSubtask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { assignedTo: req.user._id }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ success: false, message: 'Subtask not found' });
    }

    task.subtasks.pull({ _id: req.params.subtaskId });

    if (task.subtasks.length > 0 && task.subtasks.every((s) => s.status === 'Completed')) {
      task.status = 'Completed';
    }

    await task.save();

    res.json({
      success: true,
      message: 'Subtask deleted successfully',
      data: task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
