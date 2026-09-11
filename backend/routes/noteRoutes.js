import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  togglePinNote,
  deleteNote,
} from '../controllers/noteController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotes)
  .post(createNote);

router.route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

router.patch('/:id/pin', togglePinNote);

export default router;
