import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getTasks } from '@/services/taskApi';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Activity, ClipboardList, Target, Zap } from 'lucide-react';

const COLORS = {
  Pending: '#f59e0b',
  'In Progress': '#3b82f6',
  Completed: '#10b981',
  Cancelled: '#94a3b8',
};

const PRIORITY_COLORS = {
  High: '#ef4444',
  Medium: '#f97316',
  Low: '#6b7280',
  Critical: '#7c3aed',
};

const Reports = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  // Fetch all tasks for deeper analysis
  const { data: allTasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['allTasksReport'],
    queryFn: () => getTasks({ limit: 100, page: 1 }),
  });

  const isLoading = statsLoading || tasksLoading;
  const tasks = allTasksData?.tasks || [];

  // Status distribution for pie chart
  const statusData = [
    { name: 'Pending', value: stats?.pendingTasks || 0 },
    { name: 'In Progress', value: stats?.inProgressTasks || 0 },
    { name: 'Completed', value: stats?.completedTasks || 0 },
    { name: 'Cancelled', value: stats?.cancelledTasks || 0 },
  ].filter((d) => d.value > 0);

  // Priority distribution
  const priorityCounts = tasks.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {});
  const priorityData = Object.entries(priorityCounts).map(([name, value]) => ({ name, value }));

  // Tasks created per day (last 7 days)
  const dailyCounts = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    dailyCounts[key] = 0;
  }
  tasks.forEach((t) => {
    const created = new Date(t.createdAt);
    const diff = Math.floor((now - created) / 86400000);
    if (diff < 7) {
      const key = created.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      if (key in dailyCounts) dailyCounts[key]++;
    }
  });
  const dailyData = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));

  const completionRate = stats?.totalTasks
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl border border-border-t-color bg-card-t/80 backdrop-blur-xl px-5 py-3 shadow-premium text-sm">
          <p className="font-bold tracking-tight text-primary-t mb-2">{label}</p>
          {payload.map((p, i) => (
             <div key={i} className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
               <p style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
             </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const KPISkeleton = () => (
    <div className="premium-card p-6">
      <Skeleton className="h-10 w-10 rounded-2xl mb-4" />
      <Skeleton className="h-6 w-20 mb-2" />
      <Skeleton className="h-4 w-16" />
    </div>
  );

  const ChartSkeleton = () => (
    <div className="premium-card p-6 flex items-center justify-center min-h-[300px]">
      <Skeleton className="h-40 w-40 rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary-t">Reports & Analytics</h1>
        <p className="mt-1 text-sm font-medium text-secondary-t">Visual breakdown of your task data</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <KPISkeleton key={i} />)
        ) : (
          [
            { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: ClipboardList, color: 'text-violet-600', bg: 'bg-violet-500/10' },
            { label: 'Completion Rate', value: `${completionRate}%`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
            { label: 'Overdue', value: stats?.overdueTasks || 0, icon: Activity, color: 'text-red-600', bg: 'bg-red-500/10' },
            { label: 'Avg tasks/day', value: Math.round(tasks.length / 7) || 0, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          ].map((kpi, i) => (
            <div key={i} className="premium-card p-5 sm:p-6 flex flex-col gap-3 group">
              <div className={`inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl ${kpi.bg} transition-transform group-hover:scale-110`}>
                <kpi.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-t">{kpi.value}</p>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-secondary-t mt-1">{kpi.label}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Task Creation Trend */}
        <div className="premium-card p-6">
          <h2 className="mb-6 text-lg font-bold tracking-tight text-primary-t">Tasks Created (Last 7 Days)</h2>
          {isLoading ? <ChartSkeleton /> : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--text-secondary))' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--text-secondary))' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '5 5' }} />
                  <Area type="monotone" dataKey="count" name="Tasks" stroke="hsl(var(--accent))" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="premium-card p-6">
          <h2 className="mb-6 text-lg font-bold tracking-tight text-primary-t">Tasks by Status</h2>
          {isLoading ? <ChartSkeleton /> : (
            <div className="h-72 w-full">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Pending} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-medium text-secondary-t">No data available</div>
              )}
            </div>
          )}
        </div>

        {/* Priority Distribution */}
        <div className="premium-card p-6 lg:col-span-2">
          <h2 className="mb-6 text-lg font-bold tracking-tight text-primary-t">Tasks by Priority</h2>
          {isLoading ? <ChartSkeleton /> : (
            <div className="h-72 w-full">
              {priorityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--text-secondary))' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--text-secondary))' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                    <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-medium text-secondary-t">No data available</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
