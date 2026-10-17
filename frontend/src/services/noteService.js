import api from './api';

const STORAGE_KEY = 'taskflow_notes';
let notesCache = null;
let notesCacheTime = 0;
let notesInFlight = null;
const NOTES_CACHE_TTL_MS = 60000; // 60 seconds

const SESSION_CACHE_PREFIX = 'taskflow_session_';

const getCurrentUserId = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return 'anon';
    const parsed = JSON.parse(userStr);
    return parsed?._id || parsed?.id || 'anon';
  } catch {
    return 'anon';
  }
};

const readSessionCache = (subKey) => {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    const userId = getCurrentUserId();
    if (userId === 'anon') return null;
    const raw = sessionStorage.getItem(`${SESSION_CACHE_PREFIX}${userId}_${subKey}`);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry || typeof entry !== 'object' || !entry.timestamp) return null;
    if (Date.now() - entry.timestamp > 5 * 60 * 1000) return null;
    return entry.data;
  } catch {
    return null;
  }
};

const writeSessionCache = (subKey, data) => {
  try {
    if (typeof sessionStorage === 'undefined') return;
    const userId = getCurrentUserId();
    if (userId === 'anon') return;
    sessionStorage.setItem(
      `${SESSION_CACHE_PREFIX}${userId}_${subKey}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {}
};

export const invalidateNotesCache = () => {
  notesCache = null;
  notesCacheTime = 0;
  notesInFlight = null;
  try {
    if (typeof sessionStorage !== 'undefined') {
      const userId = getCurrentUserId();
      if (userId !== 'anon') {
        sessionStorage.removeItem(`${SESSION_CACHE_PREFIX}${userId}_notes`);
      }
    }
  } catch {}
};

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
  getNotes: async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && notesCache && now - notesCacheTime < NOTES_CACHE_TTL_MS) {
      return notesCache;
    }

    if (!forceRefresh && notesInFlight) {
      return notesInFlight;
    }

    const fetchPromise = (async () => {
      try {
        const response = await api.get('/notes');
        if (response.data?.success && Array.isArray(response.data?.data)) {
          const normalized = response.data.data.map(normalizeNote);
          notesCache = normalized;
          notesCacheTime = Date.now();
          writeSessionCache('notes', normalized);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          return normalized;
        }
      } catch (e) {
        // Graceful fallback to localStorage
      } finally {
        notesInFlight = null;
      }

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          const initial = getInitialNotes();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
          notesCache = initial;
          notesCacheTime = Date.now();
          return initial;
        }
        const parsed = JSON.parse(stored).map(normalizeNote);
        notesCache = parsed;
        notesCacheTime = Date.now();
        return parsed;
      } catch (e) {
        console.error('Failed to load notes from localStorage', e);
        return getInitialNotes();
      }
    })();

    notesInFlight = fetchPromise;
    return fetchPromise;
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
        invalidateNotesCache();
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
    invalidateNotesCache();
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
        invalidateNotesCache();
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
    invalidateNotesCache();
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
        invalidateNotesCache();
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
    invalidateNotesCache();
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
    invalidateNotesCache();
    return true;
  },

  getCachedNotes: () => {
    if (Array.isArray(notesCache) && notesCache.length > 0) return notesCache;
    const sessionNotes = readSessionCache('notes');
    if (Array.isArray(sessionNotes) && sessionNotes.length > 0) {
      notesCache = sessionNotes;
      return sessionNotes;
    }
    return noteService.getLocalNotes();
  },

  clearUserCache: () => {
    notesCache = null;
    notesCacheTime = 0;
    notesInFlight = null;
    try {
      if (typeof sessionStorage !== 'undefined') {
        const userId = getCurrentUserId();
        if (userId !== 'anon') {
          sessionStorage.removeItem(`${SESSION_CACHE_PREFIX}${userId}_notes`);
        }
      }
    } catch {}
  },
};
