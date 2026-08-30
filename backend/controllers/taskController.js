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

    const [total, completed, pending, inProgress] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: 'Completed' }),
      Task.countDocuments({ ...filter, status: 'Pending' }),
      Task.countDocuments({ ...filter, status: 'In Progress' }),
    ]);

    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        total,
        completed,
        pending,
        inProgress,
        completionPercentage,
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
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      userId: req.user._id,
      assignedTo: assignedTo || req.user._id,
    });

    // Asynchronously trigger assignment notification
    const recipientId = task.assignedTo || task.userId;
    sendTaskNotification({
      type: 'assignment',
      task,
      userId: recipientId,
      initiatorName: req.user.name,
    }).catch((err) => console.error('[Task] Push notification error on create:', err.message));

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
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title: title ?? task.title,
        description: description ?? task.description,
        status: status ?? task.status,
        priority: priority ?? task.priority,
        dueDate: dueDate !== undefined ? dueDate : task.dueDate,
        assignedTo: assignedTo !== undefined ? assignedTo : task.assignedTo,
      },
      { new: true, runValidators: true }
    );

    // Asynchronously trigger notification for completion
    if (status === 'Completed' && prevStatus !== 'Completed') {
      const recipientId = task.assignedTo || task.userId;
      sendTaskNotification({
        type: 'completed',
        task,
        userId: recipientId,
        initiatorName: req.user.name,
      }).catch((err) => console.error('[Task] Push notification error on complete:', err.message));
    }

    // Asynchronously trigger notification if reassigned
    if (assignedTo && assignedTo.toString() !== prevAssignedTo) {
      sendTaskNotification({
        type: 'assignment',
        task,
        userId: assignedTo,
        initiatorName: req.user.name,
      }).catch((err) => console.error('[Task] Push notification error on reassign:', err.message));
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
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

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
