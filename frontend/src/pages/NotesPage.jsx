import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { noteService } from '../services/noteService';
import Modal from '../components/ui/Modal';

const COLOR_OPTIONS = [
  { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-50/80 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-900 dark:text-indigo-200', dot: 'bg-indigo-500' },
  { id: 'amber', name: 'Amber', bg: 'bg-amber-50/80 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-900 dark:text-amber-200', dot: 'bg-amber-500' },
  { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-50/80 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-900 dark:text-emerald-200', dot: 'bg-emerald-500' },
  { id: 'rose', name: 'Rose', bg: 'bg-rose-50/80 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-900 dark:text-rose-200', dot: 'bg-rose-500' },
  { id: 'sky', name: 'Sky', bg: 'bg-sky-50/80 dark:bg-sky-950/30', border: 'border-sky-200 dark:border-sky-800', text: 'text-sky-900 dark:text-sky-200', dot: 'bg-sky-500' },
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

  const loadNotes = () => {
    setNotes(noteService.getNotes());
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleOpenCreate = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setColor('indigo');
    setModalOpen(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color || 'indigo');
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) {
      toast.error('Please enter a title or note content');
      return;
    }

    if (editingNote) {
      noteService.updateNote(editingNote.id, {
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        color,
      });
      toast.success('Note updated!');
    } else {
      noteService.createNote({
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        color,
      });
      toast.success('Note created!');
    }

    setModalOpen(false);
    loadNotes();
  };

  const handleDelete = (id) => {
    noteService.deleteNote(id);
    toast.success('Note deleted');
    loadNotes();
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchesColor = selectedColor === 'all' || n.color === selectedColor;
    return matchesSearch && matchesColor;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-nimbus-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            Notes & Scratchpad
          </h2>
          <p className="text-nimbus-500 mt-1 text-sm">
            Quick notes, ideas, meeting snippets and personal checklists.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="nimbus-btn-primary self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </motion.div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 nimbus-card">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-nimbus-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-nimbus-50 dark:bg-nimbus-800 border border-nimbus-200 dark:border-nimbus-700 rounded-lg text-nimbus-900 dark:text-white placeholder:text-nimbus-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Color filter tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => setSelectedColor('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedColor === 'all'
                ? 'bg-brand-600 text-white'
                : 'bg-nimbus-100 dark:bg-nimbus-800 text-nimbus-600 dark:text-nimbus-300 hover:bg-nimbus-200'
            }`}
          >
            All Notes
          </button>
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedColor(c.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedColor === c.id
                  ? 'bg-nimbus-900 text-white dark:bg-white dark:text-nimbus-900'
                  : 'bg-nimbus-100 dark:bg-nimbus-800 text-nimbus-600 dark:text-nimbus-300 hover:bg-nimbus-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${c.dot}`} />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full py-16 text-center nimbus-card">
            <Sparkles className="w-10 h-10 text-nimbus-300 dark:text-nimbus-600 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-nimbus-800 dark:text-nimbus-200">
              No notes found
            </h3>
            <p className="text-xs text-nimbus-500 mt-1 max-w-sm mx-auto">
              {search || selectedColor !== 'all'
                ? 'Try changing your search keywords or color filter.'
                : 'Create your first note to begin organizing your ideas and thoughts.'}
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="nimbus-btn-primary text-xs mt-4"
            >
              <Plus className="w-3.5 h-3.5" /> Create Note
            </button>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const colorObj =
              COLOR_OPTIONS.find((c) => c.id === note.color) || COLOR_OPTIONS[0];

            return (
              <motion.div
                layout
                key={note.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`p-5 rounded-xl border ${colorObj.bg} ${colorObj.border} flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-nimbus-200/40 dark:border-nimbus-700/30">
                    <h3 className={`text-base font-bold truncate ${colorObj.text}`}>
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(note)}
                        className="p-1 rounded text-nimbus-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                        title="Edit Note"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(note.id)}
                        className="p-1 rounded text-nimbus-400 hover:text-rose-600 transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-nimbus-700 dark:text-nimbus-300 whitespace-pre-line leading-relaxed line-clamp-6">
                    {note.content || '(No content)'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-4 border-t border-nimbus-200/40 dark:border-nimbus-700/30 text-[11px] text-nimbus-400">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${colorObj.dot}`} />
                    {new Date(note.updatedAt || note.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="capitalize">{note.color || 'indigo'}</span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingNote ? 'Edit Note' : 'Create New Note'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-nimbus-700 dark:text-nimbus-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="nimbus-input"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-nimbus-700 dark:text-nimbus-300 mb-1">
              Content
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="nimbus-input resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-nimbus-700 dark:text-nimbus-300 mb-1.5">
              Color Theme
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${c.dot} ${
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
              className="nimbus-btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="nimbus-btn-primary">
              {editingNote ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NotesPage;
