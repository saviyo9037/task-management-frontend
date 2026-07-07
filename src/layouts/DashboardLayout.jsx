import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  LayoutDashboard, CheckSquare, User, LogOut,
  Menu, X, ChevronRight, BarChart2, Bell, Palette
} from 'lucide-react';
import { logoutUser } from '@/services/authApi';
import { logout } from '@/redux/slices/authSlice';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import ThemeModal from '@/components/ui/ThemeModal';
import { getNotifications } from '@/services/notificationApi';

const navLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/notifications', icon: Bell, label: 'Notifications', badge: true },
  { to: '/profile', icon: User, label: 'Profile' },
];

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [navigate]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 30000,
  });
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      dispatch(logout());
      navigate('/login');
      toast.success('Logged out successfully');
    },
    onError: () => {
      dispatch(logout());
      navigate('/login');
    },
  });

  const initials = userInfo?.name
    ? userInfo.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const NavContent = ({ onClose }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between gap-3 border-b border-sidebar-t px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-t">
            <CheckSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-sidebar-t">TaskFlow</p>
            <p className="text-xs text-sidebar-muted-t">Task Manager</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-muted-t hover:bg-muted-t hover:text-sidebar-t lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-sidebar-muted-t">
          Menu
        </p>
        {navLinks.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `sidebar-item tap-target ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{label}</span>
            {badge && unreadCount > 0 ? (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : (
              <ChevronRight className="h-3.5 w-3.5 opacity-30" />
            )}
          </NavLink>
        ))}
      </nav>

      
      <div className="border-t border-sidebar-t p-3 pb-safe">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <Avatar className="h-9 w-9 shrink-0 border border-t-color">
            <AvatarFallback className="bg-accent-muted-t text-xs font-bold text-accent-t">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-bold text-sidebar-t">{userInfo?.name}</p>
            <p className="truncate text-xs font-medium text-sidebar-muted-t">{userInfo?.email}</p>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            title="Logout"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sidebar-muted-t hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-app transition-colors duration-300">
      
      <aside className="hidden w-64 shrink-0 flex-col lg:flex bg-sidebar-t border-r border-sidebar-t transition-colors duration-300">
        <NavContent />
      </aside>


      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="relative z-10 flex w-72 max-w-[85vw] flex-col shadow-2xl bg-sidebar-t transition-colors duration-300"
            style={{ paddingLeft: 'env(safe-area-inset-left)' }}
          >
            <NavContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* ─── Main Content Area ─── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header
          className="glass-header z-10 flex h-14 shrink-0 items-center justify-between px-4 shadow-sm sm:h-16 sm:px-6"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-t-color text-secondary-t transition hover:bg-muted-t active:bg-muted-t lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
                <CheckSquare className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-primary-t">TaskFlow</span>
            </Link>

            <p className="hidden text-base font-semibold text-primary-t lg:block">
              Welcome back, {userInfo?.name?.split(' ')[0] || 'User'}! 👋
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setThemeModalOpen(true)}
              title="Change theme"
              className="tap-target flex h-9 w-9 items-center justify-center rounded-xl border transition"
              style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--bg-muted))', color: 'hsl(var(--text-secondary))' }}
            >
              <Palette className="h-4 w-4" />
            </button>
            <NotificationDropdown />
            <Link to="/profile">
              <Avatar className="h-9 w-9 cursor-pointer">
                <AvatarFallback className="text-xs font-bold text-white" style={{ backgroundColor: 'hsl(var(--accent))' }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <ThemeModal isOpen={themeModalOpen} onClose={() => setThemeModalOpen(false)} />

        <main
          className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 content-pb"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
