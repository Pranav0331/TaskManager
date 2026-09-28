import { Search, Filter, ArrowUpDown } from 'lucide-react';

const TaskFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
}) => {
  return (
    <div className="nimbus-card p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nimbus-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title or description..."
            className="nimbus-input pl-9 text-xs sm:text-sm"
          />
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-2 sm:gap-3">
          {/* Status filter */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="nimbus-input text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-2.5 w-full cursor-pointer"
              aria-label="Filter by Status"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="relative">
            <select
              value={priority}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="nimbus-input text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-2.5 w-full cursor-pointer"
              aria-label="Filter by Priority"
            >
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Sort field */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="nimbus-input text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-2.5 w-full cursor-pointer"
              aria-label="Sort by attribute"
            >
              <option value="dueDate">Due Date</option>
              <option value="createdAt">Created Date</option>
              <option value="title">Title</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Sort direction */}
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => onSortOrderChange(e.target.value)}
              className="nimbus-input text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-2.5 w-full cursor-pointer"
              aria-label="Sort order direction"
            >
              <option value="asc">Ascending (↑)</option>
              <option value="desc">Descending (↓)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
