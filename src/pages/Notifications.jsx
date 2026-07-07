import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BellOff, Check, CheckCheck, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/services/notificationApi';

const typeConfig = {
  'Task Assigned': { icon: '📋', color: 'bg-blue-500/10 text-blue-600 ring-blue-500/20' },
  'Task Completed': { icon: '✅', color: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' },
  default: { icon: '🔔', color: 'bg-muted-t text-secondary-t border-t-color' },
};

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

const Notifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: () => toast.error('Failed to mark as read'),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary-t">Notifications</h1>
          <p className="mt-1 text-sm font-medium text-secondary-t">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-t-color bg-card-t px-4 py-2.5 text-sm font-bold text-secondary-t shadow-sm transition hover:bg-muted-t active:scale-95 disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4 text-accent-t" />
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div className="premium-card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-[hsl(var(--border)_/_0.5)]">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-6">
                <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted-t shadow-inner mb-6">
              <BellOff className="h-10 w-10 text-sidebar-muted-t" />
            </div>
            <p className="text-lg font-bold text-primary-t">No notifications</p>
            <p className="mt-1 text-sm font-medium text-secondary-t">You're all caught up! Check back later.</p>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border)_/_0.5)]">
            {unreadCount > 0 && (
              <div className="bg-accent-muted-t px-6 py-3 border-b border-[hsl(var(--border)_/_0.5)]">
                <p className="text-xs font-bold uppercase tracking-widest text-accent-t">
                  Unread ({unreadCount})
                </p>
              </div>
            )}
            {notifications.map((n) => {
              const config = typeConfig[n.type] || typeConfig.default;
              return (
                <div
                  key={n._id}
                  className={`group flex items-start gap-5 p-6 transition-colors hover:bg-muted-t/50 ${
                    !n.isRead ? 'bg-accent-muted-t/30' : ''
                  }`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ring-1 shadow-sm ${config.color}`}>
                    {config.icon}
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <p className={`text-base leading-snug ${!n.isRead ? 'font-bold tracking-tight text-primary-t' : 'font-medium text-secondary-t'}`}>
                      {n.message}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-sidebar-muted-t" />
                      <span className="text-xs font-semibold text-sidebar-muted-t">{timeAgo(n.createdAt)}</span>
                      {!n.isRead && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-accent-muted-t px-2 py-0.5 text-[10px] font-black tracking-widest text-accent-t">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => markReadMutation.mutate(n._id)}
                      title="Mark as read"
                      className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border border-t-color text-sidebar-muted-t opacity-0 group-hover:opacity-100 hover:border-accent-t/30 hover:bg-accent-muted-t hover:text-accent-t transition-all"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
