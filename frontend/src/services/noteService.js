const STORAGE_KEY = 'taskflow_notes';

const getInitialNotes = () => [
  {
    id: 'note-1',
    title: 'Sprint Planning Ideas',
    content: 'Review quarterly deliverables, assign team owners for notification module, and prepare demo for Friday.',
    color: 'indigo',
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'note-2',
    title: 'UI Design Guidelines',
    content: 'Ensure all primary buttons use brand-600, maintain 16px minimum touch targets, and use soft shadows for elevated cards.',
    color: 'amber',
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'note-3',
    title: 'Release Checklist',
    content: 'Run automated smoke tests, verify push notification service worker, and check database indexes.',
    color: 'emerald',
    updatedAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 40).toISOString(),
  },
];

export const noteService = {
  getNotes: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const initial = getInitialNotes();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load notes from localStorage', e);
      return getInitialNotes();
    }
  },

  getRecentNotes: (limit = 3) => {
    const notes = noteService.getNotes();
    return notes
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, limit);
  },

  createNote: (noteData) => {
    const notes = noteService.getNotes();
    const newNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: (noteData.title || '').trim() || 'Untitled Note',
      content: (noteData.content || '').trim(),
      color: noteData.color || 'indigo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newNote, ...notes];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newNote;
  },

  updateNote: (id, noteData) => {
    const notes = noteService.getNotes();
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) return null;

    notes[index] = {
      ...notes[index],
      ...noteData,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return notes[index];
  },

  deleteNote: (id) => {
    const notes = noteService.getNotes();
    const updated = notes.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  },
};
