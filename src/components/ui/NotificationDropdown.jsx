import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, X, BellOff, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/services/notificationApi';

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const getTypeIcon = (type) => {
  if (type === 'Task Assigned') return '📋';
  if (type === 'Task Completed') return '✅';
  return '🔔';
};

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All marked as read');
    },
  });

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Bell */}
      <button
        onClick={() => setOpen(!open)}
        className="tap-target relative flex h-9 w-9 items-center justify-center rounded-xl border border-t-color bg-card-t text-secondary-t shadow-sm transition hover:bg-muted-t active:bg-muted-t"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown — right-aligned, avoids going off-screen */}
      {open && (
        <div
          className="absolute right-0 top-11 z-50 w-[calc(100vw-2rem)] max-w-xs rounded-2xl border border-t-color bg-card-t shadow-2xl sm:w-80"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-t-color px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-primary-t">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  className="tap-target flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-50 transition"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">All read</span>
                </button>
              )}
              <button onClick={() => setOpen(false)} className="tap-target rounded-lg p-1 text-sidebar-muted-t hover:bg-muted-t">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <BellOff className="h-8 w-8 text-gray-200" />
                <p className="mt-2 text-sm text-sidebar-muted-t">No notifications</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n._id}
                  className={`group flex items-start gap-3 border-b border-gray-50 px-4 py-3 last:border-0 transition hover:bg-muted-t ${
                    !n.isRead ? 'bg-violet-50/50' : ''
                  }`}
                >
                  <span className="mt-0.5 shrink-0 text-base">{getTypeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug sm:text-sm ${!n.isRead ? 'font-semibold text-primary-t' : 'text-secondary-t'}`}>
                      {n.message}
                    </p>
                    <p className="mt-0.5 text-[10px] text-sidebar-muted-t">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => markReadMutation.mutate(n._id)}
                      className="tap-target shrink-0 rounded-full p-1 text-violet-400 opacity-0 transition group-hover:opacity-100 hover:bg-violet-100"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer link */}
          {notifications.length > 0 && (
            <div className="border-t border-t-color px-4 py-2.5">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1 text-xs font-medium text-violet-600 hover:underline"
              >
                View all notifications
                <ChevronDown className="h-3 w-3 -rotate-90" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
