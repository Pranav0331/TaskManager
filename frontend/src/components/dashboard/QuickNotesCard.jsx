import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  ArrowRight,
  Trash2,
  Calendar,
  Sparkles,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { noteService } from '../../services/noteService';
import Modal from '../ui/Modal';

const COLOR_MAP = {
  indigo: {
    bg: 'bg-indigo-50/80 dark:bg-indigo-950/30',
    border: 'border-indigo-200/70 dark:border-indigo-800/60',
    text: 'text-indigo-900 dark:text-indigo-200',
    tag: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
    dot: 'bg-indigo-500',
  },
  amber: {
    bg: 'bg-amber-50/80 dark:bg-amber-950/30',
    border: 'border-amber-200/70 dark:border-amber-800/60',
    text: 'text-amber-900 dark:text-amber-200',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  emerald: {
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
    border: 'border-emerald-200/70 dark:border-emerald-800/60',
    text: 'text-emerald-900 dark:text-emerald-200',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  rose: {
    bg: 'bg-rose-50/80 dark:bg-rose-950/30',
    border: 'border-rose-200/70 dark:border-rose-800/60',
    text: 'text-rose-900 dark:text-rose-200',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
  sky: {
    bg: 'bg-sky-50/80 dark:bg-sky-950/30',
    border: 'border-sky-200/70 dark:border-sky-800/60',
    text: 'text-sky-900 dark:text-sky-200',
    tag: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
    dot: 'bg-sky-500',
  },
};

const QuickNotesCard = () => {
  const [notes, setNotes] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState('indigo');

  const loadNotes = () => {
    setNotes(noteService.getRecentNotes(3));
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!newTitle.trim() && !newContent.trim()) {
      toast.error('Please enter a note title or content');
      return;
    }

    noteService.createNote({
      title: newTitle.trim() || 'Untitled Note',
      content: newContent.trim(),
      color: newColor,
    });

    toast.success('Note saved!');
    setNewTitle('');
    setNewContent('');
    setNewColor('indigo');
    setCreateModalOpen(false);
    loadNotes();
  };

  const handleDeleteNote = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    noteService.deleteNote(id);
    toast.success('Note removed');
    loadNotes();
  };

  const formatNoteDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="nimbus-card p-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-nimbus-100 dark:border-nimbus-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-nimbus-900 dark:text-white">
                  Quick Notes
                </h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-nimbus-100 text-nimbus-600 dark:bg-nimbus-800 dark:text-nimbus-300">
                  {notes.length} recent
                </span>
              </div>
              <p className="text-xs text-nimbus-500">Capture thoughts, meeting items & reminders</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/80 text-brand-700 dark:text-brand-300 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Note
            </button>
            <Link
              to="/notes"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-nimbus-600 hover:text-nimbus-900 dark:text-nimbus-400 dark:hover:text-white transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Notes Grid (3 items) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {notes.length === 0 ? (
            <div className="col-span-full py-8 text-center bg-nimbus-50/50 dark:bg-nimbus-800/20 rounded-xl border border-dashed border-nimbus-200 dark:border-nimbus-800">
              <Sparkles className="w-6 h-6 text-nimbus-400 mx-auto mb-1.5" />
              <p className="text-sm font-medium text-nimbus-700 dark:text-nimbus-300">
                No notes yet
              </p>
              <p className="text-xs text-nimbus-400 mt-0.5">
                Click "+ New Note" above to write your first quick memo.
              </p>
            </div>
          ) : (
            notes.map((note) => {
              const colorStyle = COLOR_MAP[note.color] || COLOR_MAP.indigo;
              return (
                <div
                  key={note.id}
                  className={`p-4 rounded-xl border ${colorStyle.bg} ${colorStyle.border} flex flex-col justify-between transition-all duration-200 hover:shadow-sm group`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h4
                        className={`text-sm font-semibold truncate ${colorStyle.text}`}
                        title={note.title}
                      >
                        {note.title}
                      </h4>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        title="Delete Note"
                        className="opacity-0 group-hover:opacity-100 p-1 text-nimbus-400 hover:text-rose-600 transition-all rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-nimbus-600 dark:text-nimbus-300 line-clamp-3 leading-relaxed whitespace-pre-line">
                      {note.content || '(No content)'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-nimbus-200/50 dark:border-nimbus-700/40 text-[11px] text-nimbus-400">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${colorStyle.dot}`} />
                      {formatNoteDate(note.updatedAt || note.createdAt)}
                    </span>
                    <Link
                      to="/notes"
                      className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium"
                    >
                      Open &rarr;
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* New Note Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Quick Note"
        size="md"
      >
        <form onSubmit={handleCreateNote} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-nimbus-700 dark:text-nimbus-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Standup Notes, Project Links..."
              className="nimbus-input"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-nimbus-700 dark:text-nimbus-300 mb-1">
              Note Content
            </label>
            <textarea
              rows={4}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write your note here..."
              className="nimbus-input resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-nimbus-700 dark:text-nimbus-300 mb-1.5">
              Color Accent
            </label>
            <div className="flex items-center gap-2.5">
              {['indigo', 'amber', 'emerald', 'rose', 'sky'].map((color) => {
                const isSelected = newColor === color;
                const dotStyle = COLOR_MAP[color]?.dot || 'bg-indigo-500';
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${dotStyle} ${
                      isSelected ? 'ring-2 ring-offset-2 ring-brand-500 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-nimbus-100 dark:border-nimbus-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="nimbus-btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="nimbus-btn-primary">
              Save Note
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default QuickNotesCard;
