import api from './api';

const STORAGE_KEY = 'taskflow_notes';

const getInitialNotes = () => [
  {
    _id: 'note-1',
    id: 'note-1',
    title: 'Sprint Planning Ideas',
    content: 'Review quarterly deliverables, assign team owners for notification module, and prepare demo for Friday.',
    color: 'indigo',
    isPinned: true,
    pinned: true,
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'note-2',
    id: 'note-2',
    title: 'UI Design Guidelines',
    content: 'Ensure all primary buttons use brand-600, maintain 16px minimum touch targets, and use soft shadows for elevated cards.',
    color: 'amber',
    isPinned: false,
    pinned: false,
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    _id: 'note-3',
    id: 'note-3',
    title: 'Release Checklist',
    content: 'Run automated smoke tests, verify push notification service worker, and check database indexes.',
    color: 'emerald',
    isPinned: false,
    pinned: false,
    updatedAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 40).toISOString(),
  },
];

const normalizeNote = (n) => {
  if (!n) return n;
  const pinStatus = Boolean(n.isPinned ?? n.pinned ?? false);
  return {
    ...n,
    id: n._id || n.id,
    _id: n._id || n.id,
    isPinned: pinStatus,
    pinned: pinStatus,
  };
};

export const noteService = {
  getNotes: async () => {
    try {
      const response = await api.get('/notes');
      if (response.data?.success && Array.isArray(response.data?.data)) {
        const normalized = response.data.data.map(normalizeNote);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
      }
    } catch (e) {
      // Graceful fallback to localStorage
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const initial = getInitialNotes();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(stored).map(normalizeNote);
    } catch (e) {
      console.error('Failed to load notes from localStorage', e);
      return getInitialNotes();
    }
  },

  getLocalNotes: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const initial = getInitialNotes();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(stored).map(normalizeNote);
    } catch {
      return getInitialNotes();
    }
  },

  getRecentNotes: (limit = 3) => {
    const notes = noteService.getLocalNotes();
    return notes
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, limit);
  },

  createNote: async (noteData) => {
    const pinStatus = Boolean(noteData.isPinned ?? noteData.pinned ?? false);
    const payload = {
      title: (noteData.title || '').trim() || 'Untitled Note',
      content: (noteData.content || '').trim(),
      color: noteData.color || 'indigo',
      isPinned: pinStatus,
      pinned: pinStatus,
    };

    // 1. Try Backend API
    try {
      const response = await api.post('/notes', payload);
      if (response.data?.success && response.data?.data) {
        const newNote = normalizeNote(response.data.data);
        const current = noteService.getLocalNotes();
        localStorage.setItem(STORAGE_KEY, JSON.stringify([newNote, ...current]));
        return newNote;
      }
    } catch (e) {
      // Fallback to local
    }

    // 2. Local fallback
    const current = noteService.getLocalNotes();
    const newNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      _id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newNote, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newNote;
  },

  updateNote: async (id, noteData) => {
    const pinStatus =
      noteData.isPinned !== undefined || noteData.pinned !== undefined
        ? Boolean(noteData.isPinned ?? noteData.pinned)
        : undefined;

    const payload = {
      ...noteData,
    };
    if (pinStatus !== undefined) {
      payload.isPinned = pinStatus;
      payload.pinned = pinStatus;
    }

    // 1. Try Backend API
    try {
      const response = await api.put(`/notes/${id}`, payload);
      if (response.data?.success && response.data?.data) {
        const updatedNote = normalizeNote(response.data.data);
        const current = noteService.getLocalNotes();
        const index = current.findIndex((n) => (n.id || n._id) === id);
        if (index !== -1) {
          current[index] = updatedNote;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        }
        return updatedNote;
      }
    } catch (e) {
      // Fallback to local
    }

    // 2. Local fallback
    const current = noteService.getLocalNotes();
    const index = current.findIndex((n) => (n.id || n._id) === id);
    if (index === -1) return null;

    current[index] = normalizeNote({
      ...current[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return current[index];
  },

  togglePinNote: async (id) => {
    const current = noteService.getLocalNotes();
    const index = current.findIndex((n) => (n.id || n._id) === id);
    const newPinStatus = index !== -1 ? !current[index].isPinned : true;

    // 1. Try Backend API
    try {
      const response = await api.patch(`/notes/${id}/pin`);
      if (response.data?.success && response.data?.data) {
        const updatedNote = normalizeNote(response.data.data);
        if (index !== -1) {
          current[index] = updatedNote;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        }
        return updatedNote;
      }
    } catch (e) {
      // Fallback to local
    }

    // 2. Local fallback
    if (index === -1) return null;
    current[index] = normalizeNote({
      ...current[index],
      isPinned: newPinStatus,
      pinned: newPinStatus,
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return current[index];
  },

  deleteNote: async (id) => {
    // 1. Try Backend API
    try {
      await api.delete(`/notes/${id}`);
    } catch (e) {
      // Ignore fallback
    }

    // 2. Local update
    const current = noteService.getLocalNotes();
    const updated = current.filter((n) => (n.id || n._id) !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  },
};
