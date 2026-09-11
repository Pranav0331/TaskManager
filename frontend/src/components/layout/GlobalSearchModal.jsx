import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  CheckSquare,
  FileText,
  Calendar as CalendarIcon,
  ArrowRight,
  Clock,
  Pin,
  AlertCircle,
} from 'lucide-react';
import { taskService } from '../../services/taskService';
import { noteService } from '../../services/noteService';
import { formatDate, formatDateTime } from '../../utils/constants';

const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

  // Fetch fresh data whenever modal opens
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveCategory('all');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [taskRes, noteList] = await Promise.all([
          taskService.getTasks().catch(() => ({ data: [] })),
          noteService.getNotes().catch(() => []),
        ]);
        setTasks(taskRes?.data || []);
        setNotes(noteList || []);
      } catch (err) {
        console.error('Failed to load search data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Auto focus search input
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Keyboard shortcut listener (Escape & navigation)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute search results across Tasks, Notes, and Calendar items
  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    // 1. Filter Tasks
    const matchedTasks = tasks.filter((t) => {
      if (!trimmed) return true;
      const matchTitle = (t.title || '').toLowerCase().includes(trimmed);
      const matchDesc = (t.description || '').toLowerCase().includes(trimmed);
      const matchStatus = (t.status || '').toLowerCase().includes(trimmed);
      const matchPriority = (t.priority || '').toLowerCase().includes(trimmed);
      return matchTitle || matchDesc || matchStatus || matchPriority;
    });

    // 2. Filter Calendar items (tasks with dueDate)
    const matchedCalendar = tasks
      .filter((t) => Boolean(t.dueDate))
      .filter((t) => {
        if (!trimmed) return true;
        const matchTitle = (t.title || '').toLowerCase().includes(trimmed);
        const matchDesc = (t.description || '').toLowerCase().includes(trimmed);
        const matchDate = formatDate(t.dueDate).toLowerCase().includes(trimmed);
        return matchTitle || matchDesc || matchDate;
      });

    // 3. Filter Notes
    const matchedNotes = notes.filter((n) => {
      if (!trimmed) return true;
      const matchTitle = (n.title || '').toLowerCase().includes(trimmed);
      const matchContent = (n.content || '').toLowerCase().includes(trimmed);
      const matchColor = (n.color || '').toLowerCase().includes(trimmed);
      return matchTitle || matchContent || matchColor;
    });

    return {
      tasks: matchedTasks,
      calendar: matchedCalendar,
      notes: matchedNotes,
      all: [
        ...matchedTasks.map((item) => ({ ...item, searchType: 'task' })),
        ...matchedNotes.map((item) => ({ ...item, searchType: 'note' })),
        ...matchedCalendar.map((item) => ({ ...item, searchType: 'calendar' })),
      ],
    };
  }, [query, tasks, notes]);

  // Visible items based on activeCategory
  const visibleItems = useMemo(() => {
    if (activeCategory === 'tasks') {
      return searchResults.tasks.map((item) => ({ ...item, searchType: 'task' }));
    }
    if (activeCategory === 'notes') {
      return searchResults.notes.map((item) => ({ ...item, searchType: 'note' }));
    }
    if (activeCategory === 'calendar') {
      return searchResults.calendar.map((item) => ({ ...item, searchType: 'calendar' }));
    }
    return searchResults.all;
  }, [activeCategory, searchResults]);

  // Navigate to item
  const handleSelectItem = (item) => {
    onClose();
    if (item.searchType === 'task') {
      navigate(`/tasks/${item._id || item.id}`);
    } else if (item.searchType === 'calendar') {
      navigate(`/calendar`);
    } else if (item.searchType === 'note') {
      navigate('/notes');
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
      case 'Low':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
      default:
        return 'bg-nimbus-100 text-nimbus-700 dark:bg-nimbus-800 dark:text-nimbus-300';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'In Progress':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300';
      default:
        return 'bg-nimbus-100 text-nimbus-700 dark:bg-nimbus-800 dark:text-nimbus-300';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 pb-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-nimbus-950/60 dark:bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Search Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white dark:bg-nimbus-900 rounded-2xl shadow-2xl border border-nimbus-200/80 dark:border-nimbus-800 overflow-hidden z-10 flex flex-col max-h-[80vh]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-nimbus-200/80 dark:border-nimbus-800 bg-white/70 dark:bg-nimbus-900/70">
              <Search className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, notes, calendar deadlines..."
                className="w-full bg-transparent text-sm sm:text-base font-medium text-nimbus-900 dark:text-white placeholder:text-nimbus-400 focus:outline-none"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-md text-nimbus-400 hover:text-nimbus-600 dark:hover:text-nimbus-200 cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-nimbus-400 hover:text-nimbus-600 dark:hover:text-nimbus-200 hover:bg-nimbus-100 dark:hover:bg-nimbus-800 transition-colors cursor-pointer"
                title="Close search (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-nimbus-100 dark:border-nimbus-800/80 bg-nimbus-50/50 dark:bg-nimbus-950/40 text-xs overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === 'all'
                    ? 'bg-brand-600 text-white font-semibold shadow-2xs'
                    : 'text-nimbus-600 dark:text-nimbus-400 hover:bg-nimbus-200/70 dark:hover:bg-nimbus-800'
                }`}
              >
                <span>All</span>
                <span className="opacity-75 text-[11px]">({searchResults.all.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('tasks')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === 'tasks'
                    ? 'bg-brand-600 text-white font-semibold shadow-2xs'
                    : 'text-nimbus-600 dark:text-nimbus-400 hover:bg-nimbus-200/70 dark:hover:bg-nimbus-800'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Tasks</span>
                <span className="opacity-75 text-[11px]">({searchResults.tasks.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('notes')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === 'notes'
                    ? 'bg-brand-600 text-white font-semibold shadow-2xs'
                    : 'text-nimbus-600 dark:text-nimbus-400 hover:bg-nimbus-200/70 dark:hover:bg-nimbus-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Notes</span>
                <span className="opacity-75 text-[11px]">({searchResults.notes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('calendar')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === 'calendar'
                    ? 'bg-brand-600 text-white font-semibold shadow-2xs'
                    : 'text-nimbus-600 dark:text-nimbus-400 hover:bg-nimbus-200/70 dark:hover:bg-nimbus-800'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Calendar</span>
                <span className="opacity-75 text-[11px]">({searchResults.calendar.length})</span>
              </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 divide-y divide-nimbus-100/70 dark:divide-nimbus-800/50">
              {loading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-nimbus-400">Searching workspace items...</p>
                </div>
              ) : visibleItems.length === 0 ? (
                <div className="py-12 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-nimbus-100 dark:bg-nimbus-800 flex items-center justify-center mx-auto mb-3 text-nimbus-400">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-nimbus-800 dark:text-nimbus-200">
                    {query ? `No matches found for "${query}"` : 'No workspace items found'}
                  </p>
                  <p className="text-xs text-nimbus-400 mt-1 max-w-sm mx-auto">
                    Try searching with another keyword, changing category filters, or create a new task.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {visibleItems.map((item, index) => {
                    const isTask = item.searchType === 'task';
                    const isCalendar = item.searchType === 'calendar';
                    const isNote = item.searchType === 'note';

                    return (
                      <div
                        key={`${item.searchType}-${item._id || item.id || index}`}
                        onClick={() => handleSelectItem(item)}
                        className="group flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-nimbus-50 dark:hover:bg-nimbus-800/60 transition-all cursor-pointer border border-transparent hover:border-nimbus-200/80 dark:hover:border-nimbus-700/60"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {/* Item Type Icon */}
                          <div
                            className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                              isTask
                                ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800/50'
                                : isCalendar
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50'
                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50'
                            }`}
                          >
                            {isTask && <CheckSquare className="w-4 h-4" />}
                            {isCalendar && <CalendarIcon className="w-4 h-4" />}
                            {isNote && <FileText className="w-4 h-4" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            {/* Title & Type Badge */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-nimbus-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                {item.title || (isNote ? 'Untitled Note' : 'Untitled Task')}
                              </p>

                              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-nimbus-100 dark:bg-nimbus-800 text-nimbus-600 dark:text-nimbus-400">
                                {isTask ? 'Task' : isCalendar ? 'Calendar' : 'Note'}
                              </span>

                              {isNote && (item.isPinned || item.pinned) && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                                  <Pin className="w-3 h-3 fill-current" /> Pinned
                                </span>
                              )}

                              {isTask && item.priority && (
                                <span
                                  className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${getPriorityBadge(
                                    item.priority
                                  )}`}
                                >
                                  {item.priority}
                                </span>
                              )}

                              {isTask && item.status && (
                                <span
                                  className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${getStatusBadge(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </span>
                              )}
                            </div>

                            {/* Snippet / Description */}
                            <p className="text-xs text-nimbus-500 dark:text-nimbus-400 mt-1 line-clamp-1">
                              {item.description || item.content || '(No additional description)'}
                            </p>

                            {/* Date / Metadata info */}
                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-nimbus-400">
                              {item.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Due {formatDate(item.dueDate)}
                                </span>
                              )}
                              {item.updatedAt && !item.dueDate && (
                                <span>Updated {formatDateTime(item.updatedAt)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Arrow Action Indicator */}
                        <ArrowRight className="w-4 h-4 text-nimbus-300 dark:text-nimbus-600 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-3" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with keyboard hints */}
            <div className="px-4 py-2.5 bg-nimbus-50 dark:bg-nimbus-950/60 border-t border-nimbus-200/80 dark:border-nimbus-800 flex items-center justify-between text-xs text-nimbus-500 dark:text-nimbus-400">
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-white dark:bg-nimbus-800 border border-nimbus-200 dark:border-nimbus-700 shadow-2xs">
                    ↵
                  </kbd>{' '}
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-white dark:bg-nimbus-800 border border-nimbus-200 dark:border-nimbus-700 shadow-2xs">
                    esc
                  </kbd>{' '}
                  to close
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span>Shortcut:</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-white dark:bg-nimbus-800 border border-nimbus-200 dark:border-nimbus-700 shadow-2xs">
                  {isMac ? '⌘K' : 'Ctrl+K'}
                </kbd>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearchModal;
