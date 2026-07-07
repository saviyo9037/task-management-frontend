import { useQuery } from '@tanstack/react-query';
import {
  ClipboardList, Clock, CheckCircle2, AlertTriangle,
  TrendingUp, CalendarClock, Layers, XCircle, ArrowRight
} from 'lucide-react';
import { getDashboardStats } from '@/services/taskApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const getCardStyle = (type) => {
  switch (type) {
    case 'Total Tasks': return { bg: 'bg-accent-muted-t', text: 'text-accent-t', iconBg: 'bg-accent-t/10' };
    case 'Pending': return { bg: 'bg-amber-500/10', text: 'text-amber-600', iconBg: 'bg-amber-500/20' };
    case 'In Progress': return { bg: 'bg-blue-500/10', text: 'text-blue-600', iconBg: 'bg-blue-500/20' };
    case 'Completed': return { bg: 'bg-emerald-500/10', text: 'text-emerald-600', iconBg: 'bg-emerald-500/20' };
    case 'Overdue': return { bg: 'bg-rose-500/10', text: 'text-rose-600', iconBg: 'bg-rose-500/20' };
    case 'Due Today': return { bg: 'bg-purple-500/10', text: 'text-purple-600', iconBg: 'bg-purple-500/20' };
    default: return { bg: 'bg-muted-t', text: 'text-secondary-t', iconBg: 'bg-sidebar-muted-t/20' };
  }
};

const statCards = (data) => [
  { label: 'Total Tasks', value: data?.totalTasks ?? 0, icon: Layers, href: '/tasks' },
  { label: 'Pending', value: data?.pendingTasks ?? 0, icon: Clock, href: '/tasks?status=Pending' },
  { label: 'In Progress', value: data?.inProgressTasks ?? 0, icon: TrendingUp, href: '/tasks?status=In+Progress' },
  { label: 'Completed', value: data?.completedTasks ?? 0, icon: CheckCircle2, href: '/tasks?status=Completed' },
  { label: 'Overdue', value: data?.overdueTasks ?? 0, icon: AlertTriangle, href: '/tasks' },
  { label: 'Due Today', value: data?.tasksDueToday ?? 0, icon: CalendarClock, href: '/tasks' },
];

const StatSkeleton = () => (
  <div className="stat-card flex flex-col gap-4">
    <Skeleton className="h-12 w-12 rounded-2xl" />
    <div>
      <Skeleton className="h-10 w-20 mb-2" />
      <Skeleton className="h-4 w-28" />
    </div>
  </div>
);

const Dashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  const completionRate = data?.totalTasks
    ? Math.round((data.completedTasks / data.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="relative overflow-hidden rounded-[1.5rem] bg-accent-t p-6 sm:p-8 shadow-premium">
        <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-white/10 blur-[60px] mix-blend-overlay pointer-events-none" />
        <div className="absolute -left-10 -bottom-20 h-48 w-48 rounded-full bg-black/10 blur-[40px] mix-blend-overlay pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2 text-white">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Dashboard
            </h1>
            <p className="max-w-md text-sm font-medium text-white/80 leading-relaxed">
              Here's what's happening with your projects today. You have {data?.pendingTasks || 0} tasks pending.
            </p>
          </div>
          
          <div className="flex shrink-0 items-center gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-md ring-1 ring-white/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 shadow-inner">
              <span className="text-lg font-black text-white">{completionRate}%</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Overall Progress</p>
              <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-black/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-1000 ease-out"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight text-primary-t">Overview</h2>
          <Link to="/tasks" className="group flex items-center gap-1 text-xs font-semibold text-accent-t hover:text-accent-hover-t transition-colors">
            View all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <StatSkeleton key={i} />)
          ) : isError ? (
            <div className="col-span-full rounded-3xl border-2 border-dashed border-red-200 bg-red-50 p-10 text-center text-sm font-semibold text-red-500">
              Failed to load dashboard data.
            </div>
          ) : (
            statCards(data).map((stat) => {
              const style = getCardStyle(stat.label);
              return (
                <Link
                  key={stat.label}
                  to={stat.href}
                  className="stat-card group block"
                >
                  <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${style.iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <stat.icon className={`h-5 w-5 ${style.text}`} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold tracking-tight text-primary-t">{stat.value}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-secondary-t">{stat.label}</p>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 h-1 w-full scale-x-0 bg-accent-t opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100" />
                </Link>
              );
            })
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="premium-card p-8">
          <h3 className="mb-2 text-lg font-bold tracking-tight text-primary-t">Recent Activity</h3>
          <p className="text-sm text-secondary-t">No recent activity to show yet. Start completing tasks!</p>
        </div>
        <div className="premium-card p-8 bg-gradient-to-br from-card-t to-muted-t">
          <h3 className="mb-2 text-lg font-bold tracking-tight text-primary-t">Productivity Score</h3>
          <p className="text-sm text-secondary-t">Keep up the great work! Your team is on a streak.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
