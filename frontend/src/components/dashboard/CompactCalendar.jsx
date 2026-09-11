import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RotateCcw,
} from 'lucide-react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const CompactCalendar = ({ tasks = [], selectedDate, onSelectDate }) => {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  // Map task dates to counts / indicators
  const tasksByDate = useMemo(() => {
    const map = new Map();
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const d = new Date(task.dueDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const existing = map.get(key) || [];
      existing.push(task);
      map.set(key, existing);
    });
    return map;
  }, [tasks]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Calculate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
      });
    }

    // Next month leading days to fill up complete weeks (multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    onSelectDate(now);
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="nimbus-card p-5 flex flex-col justify-between h-full bg-white dark:bg-nimbus-900">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-nimbus-100 dark:border-nimbus-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-nimbus-900 dark:text-white">
              {monthName}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleGoToToday}
              title="Jump to Today"
              className="px-2 py-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-md transition-colors mr-1"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1 rounded-md text-nimbus-500 hover:text-nimbus-800 hover:bg-nimbus-100 dark:hover:bg-nimbus-800 dark:hover:text-nimbus-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1 rounded-md text-nimbus-500 hover:text-nimbus-800 hover:bg-nimbus-100 dark:hover:bg-nimbus-800 dark:hover:text-nimbus-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mt-3 text-center">
          {WEEKDAYS.map((wd) => (
            <span
              key={wd}
              className="text-[11px] font-semibold text-nimbus-400 dark:text-nimbus-500 uppercase tracking-wider py-1"
            >
              {wd}
            </span>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1 mt-1">
          {calendarDays.map((item, idx) => {
            const dateObj = new Date(item.year, item.month, item.day);
            const isToday = isSameDay(dateObj, today);
            const isSelected = selectedDate && isSameDay(dateObj, selectedDate);
            const dateKey = `${item.year}-${item.month}-${item.day}`;
            const dateTasks = tasksByDate.get(dateKey) || [];
            const hasTasks = dateTasks.length > 0;
            const hasOverdueOrHigh = dateTasks.some(
              (t) => t.priority === 'High' || t.status !== 'Completed'
            );

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectDate(dateObj)}
                className={`group relative flex flex-col items-center justify-center h-8 sm:h-9 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm font-semibold'
                    : isToday
                    ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-semibold ring-1 ring-brand-400/40'
                    : item.isCurrentMonth
                    ? 'text-nimbus-800 dark:text-nimbus-200 hover:bg-nimbus-100 dark:hover:bg-nimbus-800'
                    : 'text-nimbus-300 dark:text-nimbus-600 hover:bg-nimbus-50 dark:hover:bg-nimbus-800/40'
                }`}
              >
                <span>{item.day}</span>

                {/* Task dot indicator */}
                {hasTasks && (
                  <span
                    className={`absolute bottom-1 w-1.2 h-1.2 rounded-full ${
                      isSelected
                        ? 'bg-white'
                        : hasOverdueOrHigh
                        ? 'bg-brand-600 dark:bg-brand-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: '4px', height: '4px' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Filter Info */}
      <div className="pt-3 mt-3 border-t border-nimbus-100 dark:border-nimbus-800/80 flex items-center justify-between text-xs text-nimbus-500">
        <div className="flex items-center gap-1.5 truncate">
          <span className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-400 flex-shrink-0" />
          <span className="truncate">
            {selectedDate
              ? isSameDay(selectedDate, today)
                ? 'Showing Today'
                : `Filtered: ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : 'All dates'}
          </span>
        </div>

        {selectedDate && !isSameDay(selectedDate, today) && (
          <button
            type="button"
            onClick={handleGoToToday}
            className="flex items-center gap-1 text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline flex-shrink-0"
          >
            <RotateCcw className="w-3 h-3" /> Reset to Today
          </button>
        )}
      </div>
    </div>
  );
};

export default CompactCalendar;
