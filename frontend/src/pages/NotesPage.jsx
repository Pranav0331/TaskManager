import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Edit2,
  Pin,
  Sparkles,
  X,
  Clock,
  RotateCcw,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { noteService } from '../services/noteService';
import Modal from '../components/ui/Modal';

const COLOR_OPTIONS = [
  {
    id: 'indigo',
    name: 'Indigo',
    bg: 'bg-indigo-50/70 dark:bg-indigo-950/25',
    border: 'border-indigo-200/70 dark:border-indigo-800/50',
    text: 'text-indigo-950 dark:text-indigo-200',
    dot: 'bg-indigo-500',
  },
  {
    id: 'amber',
    name: 'Amber',
    bg: 'bg-amber-50/70 dark:bg-amber-950/25',
    border: 'border-amber-200/70 dark:border-amber-800/50',
    text: 'text-amber-950 dark:text-amber-200',
    dot: 'bg-amber-500',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    bg: 'bg-emerald-50/70 dark:bg-emerald-950/25',
    border: 'border-emerald-200/70 dark:border-emerald-800/50',
    text: 'text-emerald-950 dark:text-emerald-200',
    dot: 'bg-emerald-500',
  },
  {
    id: 'rose',
    name: 'Rose',
    bg: 'bg-rose-50/70 dark:bg-rose-950/25',
    border: 'border-rose-200/70 dark:border-rose-800/50',
    text: 'text-rose-950 dark:text-rose-200',
    dot: 'bg-rose-500',
  },
  {
    id: 'sky',
    name: 'Sky',
    bg: 'bg-sky-50/70 dark:bg-sky-950/25',
    border: 'border-sky-200/70 dark:border-sky-800/50',
    text: 'text-sky-950 dark:text-sky-200',
    dot: 'bg-sky-500',
  },
];

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedColor, setSelectedColor] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('indigo');
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const searchInputRef = useRef(null);

  const loadNotes = useCallback(async () => {
    try {
      const data = await noteService.getNotes();
      setNotes(data || []);
    } catch (err) {
      console.error('Failed to load notes', err);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenCreate = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setColor('indigo');
    setIsPinned(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title || '');
    setContent(note.content || '');
    setColor(note.color || 'indigo');
    setIsPinned(Boolean(note.isPinned ?? note.pinned ?? false));
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) {
      toast.error('Please enter a title or note content');
      return;
    }

    setSaving(true);
    try {
      if (editingNote) {
        const noteId = editingNote._id || editingNote.id;
        await noteService.updateNote(noteId, {
          title: title.trim() || 'Untitled Note',
          content: content.trim(),
          color,
          isPinned,
          pinned: isPinned,
        });
        toast.success(isPinned ? 'Note updated & pinned to top! 📌' : 'Note updated!');
      } else {
        await noteService.createNote({
          title: title.trim() || 'Untitled Note',
          content: content.trim(),
          color,
          isPinned,
          pinned: isPinned,
        });
        toast.success(isPinned ? 'Note created & pinned to top! 📌' : 'Note created!');
      }

      setModalOpen(false);
      await loadNotes();
    } catch (err) {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (note, e) => {
    if (e) {
      e.stopPropagation();
    }
    const noteId = note._id || note.id;
    try {
      await noteService.deleteNote(noteId);
      toast.success('Note deleted');
      await loadNotes();
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  const handleTogglePin = async (note, e) => {
    if (e) {
      e.stopPropagation();
    }
    const noteId = note._id || note.id;
    try {
      const updated = await noteService.togglePinNote(noteId);
      if (updated) {
        toast.success(updated.isPinned ? 'Note pinned to top 📌' : 'Note unpinned');
      }
      await loadNotes();
    } catch (err) {
      toast.error('Failed to toggle pin');
    }
  };

  const formatNoteDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter notes based on search & color
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase());
      const matchesColor = selectedColor === 'all' || n.color === selectedColor;
      return matchesSearch && matchesColor;
    });
  }, [notes, search, selectedColor]);

  // Separate pinned and unpinned notes
  const pinnedNotes = useMemo(
    () => filteredNotes.filter((n) => Boolean(n.isPinned ?? n.pinned)),
    [filteredNotes]
  );
  const otherNotes = useMemo(
    () => filteredNotes.filter((n) => !Boolean(n.isPinned ?? n.pinned)),
    [filteredNotes]
  );

  const isMac = typeof window !== 'undefined' && navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;

  const renderNoteCard = (note) => {
    const colorObj = COLOR_OPTIONS.find((c) => c.id === note.color) || COLOR_OPTIONS[0];
    const notePinned = Boolean(note.isPinned ?? note.pinned);
    const noteId = note._id || note.id;

    return (
      <motion.div
        layout
        key={noteId}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        onClick={() => handleOpenEdit(note)}
        className={`group p-4 rounded-xl border ${colorObj.bg} ${colorObj.border} flex flex-col justify-between shadow-sm hover:shadow-nimbus-md hover:-translate-y-1 transition-all duration-200 cursor-pointer relative`}
      >
        <div>
          {/* Card Header: Title & Action buttons */}
          <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-nimbus-200/40 dark:border-nimbus-700/30">
            <h3
              className={`text-sm font-semibold truncate ${colorObj.text} flex-1`}
              title={note.title}
            >
              {note.title}
            </h3>

            {/* Quick Action Icons */}
            <div
              className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => handleTogglePin(note, e)}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  notePinned
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-100/70 dark:bg-brand-900/50'
                    : 'text-nimbus-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white/60 dark:hover:bg-nimbus-800'
                }`}
                title={notePinned ? 'Unpin note' : 'Pin note to top'}
              >
                <Pin className={`w-3.5 h-3.5 ${notePinned ? 'fill-current' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => handleOpenEdit(note)}
                className="p-1.5 rounded-md text-nimbus-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white/60 dark:hover:bg-nimbus-800 transition-colors cursor-pointer"
                title="Edit Note"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => handleDelete(note, e)}
                className="p-1.5 rounded-md text-nimbus-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white/60 dark:hover:bg-nimbus-800 transition-colors cursor-pointer"
                title="Delete Note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2-3 Line Content Preview */}
          <p className="text-xs text-nimbus-600 dark:text-nimbus-300 whitespace-pre-line leading-relaxed line-clamp-3 font-normal min-h-[2.5rem]">
            {note.content || '(No content)'}
          </p>
        </div>

        {/* Card Footer: Category indicator & Last edited date */}
        <div className="flex items-center justify-between pt-2.5 mt-3 border-t border-nimbus-200/40 dark:border-nimbus-700/30 text-[11px] text-nimbus-400">
          <span className="flex items-center gap-1.5 font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${colorObj.dot}`} />
            <span className="capitalize">{note.color || 'indigo'}</span>
          </span>

          <span className="flex items-center gap-1 text-[10px] text-nimbus-400 dark:text-nimbus-500">
            <Clock className="w-3 h-3" />
            {formatNoteDate(note.updatedAt || note.createdAt)}
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-nimbus-900 dark:text-white flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              Notes & Scratchpad
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60">
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-nimbus-500 mt-1 text-sm">
            Quick notes, ideas, meeting snippets and personal checklists.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="nimbus-btn-primary self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </motion.div>

      {/* Filter and Search Bar (Compact & Clean) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 nimbus-card">
        {/* Search Input with Keyboard Shortcut Hint */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-nimbus-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes by title or content..."
            className="w-full pl-9 pr-16 py-1.5 text-sm bg-nimbus-50 dark:bg-nimbus-800/60 border border-nimbus-200 dark:border-nimbus-700 rounded-lg text-nimbus-900 dark:text-white placeholder:text-nimbus-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />

          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 rounded text-nimbus-400 hover:text-nimbus-600 dark:hover:text-nimbus-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-nimbus-400 bg-white dark:bg-nimbus-900 border border-nimbus-200 dark:border-nimbus-700 rounded shadow-2xs select-none">
                {isMac ? '⌘K' : 'Ctrl+K'}
              </kbd>
            )}
          </div>
        </div>

        {/* Compact Color Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedColor('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              selectedColor === 'all'
                ? 'bg-brand-600 text-white shadow-2xs font-semibold'
                : 'bg-nimbus-100/80 dark:bg-nimbus-800 text-nimbus-600 dark:text-nimbus-400 hover:bg-nimbus-200 dark:hover:bg-nimbus-700'
            }`}
          >
            All
          </button>
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedColor(c.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                selectedColor === c.id
                  ? 'bg-nimbus-900 text-white dark:bg-white dark:text-nimbus-900 shadow-2xs font-semibold'
                  : 'bg-nimbus-100/80 dark:bg-nimbus-800 text-nimbus-600 dark:text-nimbus-400 hover:bg-nimbus-200 dark:hover:bg-nimbus-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${c.dot}`} />
              <span className="capitalize">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredNotes.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-16 text-center nimbus-card px-4"
        >
          <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-nimbus-900 dark:text-white">
            {search || selectedColor !== 'all' ? 'No matching notes' : 'No notes created yet'}
          </h3>
          <p className="text-xs text-nimbus-500 mt-1 max-w-sm mx-auto">
            {search || selectedColor !== 'all'
              ? 'Try changing your search terms or selecting a different color filter.'
              : 'Create your first quick note or idea scratchpad to get started.'}
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            {search || selectedColor !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedColor('all');
                }}
                className="nimbus-btn-secondary text-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="nimbus-btn-primary text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Create Note
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-0.5">
                <Pin className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 fill-current" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-nimbus-500 dark:text-nimbus-400">
                  Pinned Notes ({pinnedNotes.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {pinnedNotes.map((note) => renderNoteCard(note))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* All / Other Notes Section */}
          <div className="space-y-3">
            {pinnedNotes.length > 0 && (
              <div className="flex items-center gap-2 px-0.5 pt-2">
                <FileText className="w-3.5 h-3.5 text-nimbus-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-nimbus-500 dark:text-nimbus-400">
                  Other Notes ({otherNotes.length})
                </h3>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {(pinnedNotes.length > 0 ? otherNotes : filteredNotes).map((note) =>
                  renderNoteCard(note)
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingNote ? 'Edit Note' : 'Create New Note'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Title and Pin control */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-nimbus-700 dark:text-nimbus-300">
                Title
              </label>

              {/* Enhanced Interactive Pinned to Top Toggle Control */}
              <button
                type="button"
                id="modal-pin-toggle-btn"
                onClick={() => setIsPinned((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer select-none border ${
                  isPinned
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border-brand-300 dark:border-brand-700/80 shadow-xs'
                    : 'bg-nimbus-50 dark:bg-nimbus-800/80 text-nimbus-500 dark:text-nimbus-400 border-nimbus-200 dark:border-nimbus-700 hover:text-nimbus-800 dark:hover:text-nimbus-200'
                }`}
                title={isPinned ? 'Click to unpin' : 'Click to pin to top'}
              >
                <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-brand-600 text-brand-600 dark:text-brand-400 dark:fill-brand-400' : 'text-nimbus-400'}`} />
                <span>{isPinned ? 'Pinned to top' : 'Pin to top'}</span>
                {isPinned && <Check className="w-3 h-3 text-brand-600 dark:text-brand-400 stroke-[2.5]" />}
              </button>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sprint Ideas, Bug List..."
              className="nimbus-input"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-nimbus-700 dark:text-nimbus-300 mb-1">
              Content
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="nimbus-input resize-none text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-nimbus-700 dark:text-nimbus-300 mb-1.5">
              Color Accent
            </label>
            <div className="flex items-center gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${c.dot} ${
                    color === c.id ? 'ring-2 ring-offset-2 ring-brand-500 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-nimbus-100 dark:border-nimbus-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="nimbus-btn-secondary text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="nimbus-btn-primary text-xs cursor-pointer"
            >
              {saving ? 'Saving...' : editingNote ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NotesPage;
