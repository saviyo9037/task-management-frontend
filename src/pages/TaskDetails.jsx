import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft, Calendar, User, Flag, Clock,
  MessageSquare, Send, Trash2, Tag, ChevronDown, CheckCircle2, Circle
} from 'lucide-react';
import { getTaskById, updateTask } from '@/services/taskApi';
import { getComments, addComment, deleteComment } from '@/services/commentApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const statusOptions = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

const statusBadge = (s) => {
  if (s === 'Completed') return 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20';
  if (s === 'In Progress') return 'bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20';
  if (s === 'Cancelled') return 'bg-gray-500/10 text-gray-600 ring-1 ring-gray-500/20';
  return 'bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20';
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted-t/50 transition-colors hover:bg-muted-t">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card-t shadow-sm">
      <Icon className="h-5 w-5 text-accent-t" />
    </div>
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-secondary-t mb-0.5">{label}</p>
      <div className="text-sm font-semibold text-primary-t">{value}</div>
    </div>
  </div>
);

const TaskDetails = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const { data: task, isLoading, isError } = useQuery({
    queryKey: ['task', id],
    queryFn: () => getTaskById(id),
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => getComments(id),
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus) => updateTask({ id, status: newStatus }),
    onSuccess: () => {
      toast.success('Task status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
  });

  const commentMutation = useMutation({
    mutationFn: () => addComment({ taskId: id, comment: commentText }),
    onSuccess: () => {
      setCommentText('');
      toast.success('Comment posted');
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to post comment'),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      toast.success('Comment deleted');
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <Skeleton className="h-10 w-3/4 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="col-span-2 h-96 rounded-[2rem]" />
          <Skeleton className="h-96 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="premium-card bg-red-50/50 p-12 text-center border border-red-100">
        <p className="text-lg font-bold text-red-600">Task not found</p>
        <p className="mt-2 text-sm text-red-500/80 mb-6">This task might have been deleted or doesn't exist.</p>
        <Link to="/tasks" className="btn-primary bg-red-600 text-white hover:bg-red-700 shadow-red-500/20">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/tasks"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-secondary-t hover:text-primary-t transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card-t border border-t-color shadow-sm group-hover:bg-muted-t transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to tasks
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={task.status}
              onChange={(e) => statusMutation.mutate(e.target.value)}
              disabled={statusMutation.isLoading}
              className="appearance-none rounded-xl border border-t-color bg-card-t py-2 pl-4 pr-10 text-sm font-bold text-primary-t shadow-sm outline-none transition-all focus:ring-2 focus:ring-accent-t focus:border-transparent disabled:opacity-50"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-t pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="premium-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${statusBadge(task.status)}`}>
                {task.status === 'Completed' ? <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> : <Circle className="h-3.5 w-3.5 mr-1.5" />}
                {task.status}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${
                task.priority === 'High' ? 'bg-red-500/10 text-red-600 ring-1 ring-red-500/20' :
                task.priority === 'Medium' ? 'bg-orange-500/10 text-orange-600 ring-1 ring-orange-500/20' :
                'bg-gray-500/10 text-gray-600 ring-1 ring-gray-500/20'
              }`}>
                <Flag className="h-3 w-3 mr-1.5" /> {task.priority} Priority
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary-t leading-tight">
              {task.title}
            </h1>
            
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-secondary-t mb-3">Description</p>
              <div className="rounded-2xl bg-muted-t/30 p-5 text-sm sm:text-base text-primary-t leading-relaxed whitespace-pre-wrap border border-t-color/50">
                {task.description || <span className="text-secondary-t italic">No description provided.</span>}
              </div>
            </div>
          </div>

          <div className="premium-card p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="h-5 w-5 text-accent-t" />
              <h2 className="text-lg font-bold tracking-tight text-primary-t">Discussion</h2>
            </div>
            
            <div className="space-y-6 mb-8">
              {commentsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full rounded-2xl" />
                  <Skeleton className="h-16 w-full rounded-2xl" />
                </div>
              ) : comments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-t-color p-8 text-center">
                  <p className="text-sm font-medium text-secondary-t">No comments yet. Start the conversation!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="group relative flex gap-4">
                    <Avatar className="h-10 w-10 border border-t-color shadow-sm">
                      <AvatarFallback className="bg-accent-muted-t text-accent-t font-bold">
                        {comment.user?.name ? comment.user.name.charAt(0) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="rounded-2xl rounded-tl-sm bg-muted-t p-4 pb-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-primary-t">{comment.user?.name || 'Unknown User'}</p>
                          <p className="text-xs font-medium text-secondary-t">
                            {new Date(comment.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-sm text-primary-t leading-relaxed whitespace-pre-wrap">{comment.comment}</p>
                      </div>
                      
                      <button
                        onClick={() => deleteCommentMutation.mutate(comment._id)}
                        className="mt-1 ml-2 text-xs font-bold text-red-500 opacity-0 transition-opacity hover:underline group-hover:opacity-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (commentText.trim()) commentMutation.mutate();
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="input-base bg-muted-t/50 flex-1"
                disabled={commentMutation.isLoading}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || commentMutation.isLoading}
                className="btn-primary shrink-0 rounded-2xl"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Post</span>
              </button>
            </form>
          </div>
        </div>

        {/* ── Meta Column ── */}
        <div className="space-y-6">
          <div className="premium-card p-6">
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-secondary-t">Properties</h3>
            <div className="space-y-3">
              <DetailRow
                icon={Calendar}
                label="Created At"
                value={new Date(task.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              />
              <DetailRow
                icon={Clock}
                label="Due Date"
                value={
                  task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'No due date set'
                }
              />
              <DetailRow
                icon={User}
                label="Assignee"
                value={task.assignedTo?.name || 'Unassigned'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
