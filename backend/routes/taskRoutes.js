import { Router } from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  getTaskStats,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addSubtask,
  updateSubtask,
  toggleSubtask,
  deleteSubtask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get('/stats', getTaskStats);

router.get('/', getTasks);

router.get('/:id', getTask);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('status')
      .optional()
      .isIn(['Pending', 'In Progress', 'Completed'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High'])
      .withMessage('Invalid priority'),
    body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  ],
  validate,
  createTask
);

router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim(),
    body('status')
      .optional()
      .isIn(['Pending', 'In Progress', 'Completed'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High'])
      .withMessage('Invalid priority'),
    body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  ],
  validate,
  updateTask
);

router.delete('/:id', deleteTask);

// Subtask Routes
router.post(
  '/:id/subtasks',
  [
    body('title').trim().notEmpty().withMessage('Subtask title is required'),
    body('description').optional().trim(),
    body('status')
      .optional()
      .isIn(['Pending', 'In Progress', 'Completed'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High'])
      .withMessage('Invalid priority'),
    body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  ],
  validate,
  addSubtask
);

router.put(
  '/:id/subtasks/:subtaskId',
  [
    body('title').optional().trim().notEmpty().withMessage('Subtask title cannot be empty'),
    body('description').optional().trim(),
    body('status')
      .optional()
      .isIn(['Pending', 'In Progress', 'Completed'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High'])
      .withMessage('Invalid priority'),
    body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  ],
  validate,
  updateSubtask
);

router.patch('/:id/subtasks/:subtaskId/toggle', toggleSubtask);

router.delete('/:id/subtasks/:subtaskId', deleteSubtask);

export default router;
