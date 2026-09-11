import Note from '../models/Note.js';

// @desc    Get all notes for authenticated user
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({
      isPinned: -1,
      pinned: -1,
      updatedAt: -1,
    });
    res.json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching notes', error: error.message });
  }
};

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Private
export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res) => {
  try {
    const { title, content, color, isPinned, pinned } = req.body;
    const pinStatus = Boolean(isPinned ?? pinned ?? false);

    const note = await Note.create({
      user: req.user._id,
      title: (title || '').trim() || 'Untitled Note',
      content: (content || '').trim(),
      color: color || 'indigo',
      isPinned: pinStatus,
      pinned: pinStatus,
    });

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create note', error: error.message });
  }
};

// @desc    Update an existing note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res) => {
  try {
    const { title, content, color, isPinned, pinned } = req.body;
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (title !== undefined) note.title = (title || '').trim() || 'Untitled Note';
    if (content !== undefined) note.content = (content || '').trim();
    if (color !== undefined) note.color = color;
    if (isPinned !== undefined || pinned !== undefined) {
      const pinStatus = Boolean(isPinned ?? pinned);
      note.isPinned = pinStatus;
      note.pinned = pinStatus;
    }

    const updatedNote = await note.save();
    res.json({ success: true, data: updatedNote });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update note', error: error.message });
  }
};

// @desc    Toggle note pin status
// @route   PATCH /api/notes/:id/pin
// @access  Private
export const togglePinNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note.isPinned = !note.isPinned;
    note.pinned = note.isPinned;

    const updatedNote = await note.save();
    res.json({ success: true, data: updatedNote });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to toggle pin', error: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete note', error: error.message });
  }
};
