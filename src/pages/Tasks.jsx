import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search, SlidersHorizontal, Plus, Trash2, Eye,
  ChevronLeft, ChevronRight, ClipboardList, Calendar, Flag, User, Clock, AlertTriangle
} from 'lucide-react';
import { getTasks, deleteTask } from '@/services/taskApi';
import { Skeleton } from '@/components/ui/skeleton';
import TaskFormModal from '@/components/ui/TaskFormModal';

const priorityBadge = (p) => {
  if (p === 'High') return 'badge-high';
  if (p === 'Medium') return 'badge-medium';
  return 'badge-low';
};

const statusBadge = (s) => {
  if (s === 'Completed') return 'badge-completed';
  if (s === 'In Progress') return 'badge-inprogress';
  if (s === 'Cancelled') return 'badge-cancelled';
  return 'badge-pending';
};

const TaskCard = ({ task, onDelete }) => (
  <div className="premium-card p-5 space-y-4">
    <div className="flex items-start justify-between gap-3">
      <Link
        to={`/tasks/${task._id}`}
        className="flex-1 text-base font-bold tracking-tight text-primary-t leading-snug hover:text-accent-t transition-colors"
      >
        {task.title}
      </Link>
      <span className={statusBadge(task.status)}>{task.status}</span>
    </div>

    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-secondary-t">
      <span className="flex items-center gap-1.5">
        <Flag className={`h-3.5 w-3.5 ${task.priority === 'High' ? 'text-red-500' : ''}`} />
        {task.priority}
      </span>
      {task.dueDate && (
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </span>
      )}
      {task.assignedTo?.name && (
        <span className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          {task.assignedTo.name}
        </span>
      )}
    </div>

    <div className="flex items-center gap-3 pt-2">
      <Link
        to={`/tasks/${task._id}`}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-muted-t py-2.5 text-xs font-bold text-accent-t transition-transform active:scale-95"
      >
        <Eye className="h-4 w-4" /> View
      </Link>
      <button
        onClick={() => onDelete(task._id)}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2.5 text-xs font-bold text-red-600 transition-transform active:scale-95"
      >
        <Trash2 className="h-4 w-4" /> Delete
      </button>
    </div>
  </div>
);

const RowSkeleton = () => (
  <tr>
    {[1, 2, 3, 4, 5].map((i) => (
      <td key={i} className="px-6 py-5">
        <Skeleton className="h-5 w-full rounded-md" />
      </td>
    ))}
  </tr>
);

const CardSkeleton = () => (
  <div className="premium-card p-5 space-y-4">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-10 w-full rounded-xl" />
  </div>
);


const Tasks = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks', { page, status, priority, keyword }],
    queryFn: () => getTasks({ page, limit: 10, status, priority, keyword }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success('Task deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error deleting task'),
  });

  const handleDelete = (id) => {
    toast('Delete this task?', {
      action: { label: 'Delete', onClick: () => deleteMutation.mutate(id) },
      cancel: { label: 'Cancel' },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-primary-t sm:text-3xl">Tasks</h1>
          <p className="mt-1 text-sm font-medium text-secondary-t">
            {data?.total ? `Managing ${data.total} tasks` : 'Manage your tasks'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
          New Task
        </button>
      </div>

      <TaskFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Search & Filters */}
      <div className="premium-card p-4 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sidebar-muted-t" />
            <input
              type="search"
              placeholder="Search tasks by title..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              className="input-base pl-12 h-12"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ${
              showFilters || status || priority
                ? 'bg-accent-t text-white shadow-premium-sm'
                : 'bg-muted-t text-secondary-t hover:bg-border-t-color'
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <select className="input-base h-12" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select className="input-base h-12" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        )}
      </div>

      <div className="sm:hidden space-y-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
        ) : isError ? (
          <div className="premium-card bg-red-50/50 p-6 text-center border border-red-100">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm font-semibold text-red-600">Failed to load tasks.</p>
          </div>
        ) : data?.tasks?.length === 0 ? (
          <div className="flex flex-col items-center justify-center premium-card py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted-t mb-4">
              <ClipboardList className="h-8 w-8 text-sidebar-muted-t" />
            </div>
            <p className="text-base font-bold text-primary-t">No tasks found</p>
            <p className="mt-1 text-sm text-secondary-t">Try adjusting your filters or create a new task.</p>
          </div>
        ) : (
          data?.tasks?.map((task) => (
            <TaskCard key={task._id} task={task} onDelete={handleDelete} />
          ))
        )}
      </div>

      <div className="hidden sm:block premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-t-color bg-muted-t/30">
                {['Task Title', 'Status', 'Priority', 'Due Date', 'Assignee', ''].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary-t"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)_/_0.5)] bg-card-t">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <RowSkeleton key={i} />)
              ) : isError ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-sm font-semibold text-red-500">
                    Failed to load tasks.
                  </td>
                </tr>
              ) : data?.tasks?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted-t mb-4">
                      <ClipboardList className="h-8 w-8 text-sidebar-muted-t" />
                    </div>
                    <p className="text-base font-bold text-primary-t">No tasks found</p>
                    <p className="mt-1 text-sm text-secondary-t">Try adjusting your filters or create a new task.</p>
                  </td>
                </tr>
              ) : (
                data?.tasks?.map((task) => (
                  <tr key={task._id} className="group transition-colors hover:bg-muted-t/50">
                    <td className="px-6 py-5">
                      <Link
                        to={`/tasks/${task._id}`}
                        className="text-sm font-bold tracking-tight text-primary-t transition-colors group-hover:text-accent-t"
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5">
                      <span className={statusBadge(task.status)}>{task.status}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5">
                      <span className={priorityBadge(task.priority)}>{task.priority}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-secondary-t">
                        <Clock className="h-4 w-4" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'No date'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5">
                      <span className="flex items-center gap-2 text-sm font-medium text-primary-t">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-muted-t text-[10px] font-bold text-accent-t">
                          {task.assignedTo?.name ? task.assignedTo.name.charAt(0) : '?'}
                        </div>
                        {task.assignedTo?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5 text-right opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/tasks/${task._id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-muted-t text-accent-t hover:bg-accent-t hover:text-white transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors dark:bg-red-500/10"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination */}
        {!isLoading && !isError && data?.pages > 1 && (
          <div className="flex items-center justify-between border-t border-t-color bg-muted-t/20 px-6 py-4">
            <p className="text-sm font-medium text-secondary-t">
              Showing page <span className="text-primary-t">{page}</span> of <span className="text-primary-t">{data.pages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 rounded-xl bg-card-t border border-t-color px-4 py-2 text-sm font-bold text-primary-t hover:bg-muted-t disabled:opacity-50 transition-colors shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pages}
                className="flex items-center gap-1.5 rounded-xl bg-card-t border border-t-color px-4 py-2 text-sm font-bold text-primary-t hover:bg-muted-t disabled:opacity-50 transition-colors shadow-sm"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Pagination */}
      {!isLoading && !isError && data?.pages > 1 && (
        <div className="flex items-center justify-between sm:hidden">
          <p className="text-sm font-medium text-secondary-t">Page {page} of {data.pages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-t shadow-premium-sm border border-t-color disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.pages}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-t shadow-premium-sm border border-t-color disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
