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
    <div className="nimbus-card p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nimbus-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="nimbus-input pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-nimbus-400" />
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="nimbus-input w-auto min-w-[130px]"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="nimbus-input w-auto min-w-[130px]"
          >
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-nimbus-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="nimbus-input w-auto min-w-[130px]"
            >
              <option value="dueDate">Due Date</option>
              <option value="createdAt">Created Date</option>
              <option value="title">Title</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => onSortOrderChange(e.target.value)}
              className="nimbus-input w-auto min-w-[100px]"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
