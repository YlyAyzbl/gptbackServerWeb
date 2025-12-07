import { Users, ShoppingBag, Megaphone, HeadphonesIcon, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Select, MenuItem } from '@mui/material';

const selectStyles = {
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
  backgroundColor: 'rgba(var(--background), 0.5)',
  borderRadius: '0.75rem',
  border: 'none', // Dashboard specific: borderless look for chart filter
  fontSize: '0.875rem',
  transition: 'all 0.2s',
  height: '32px',
  '& .MuiSelect-select': {
    paddingTop: '4px',
    paddingBottom: '4px',
  },
  '&:hover': { backgroundColor: 'hsl(var(--muted))' },
};

const menuProps = {
  PaperProps: {
    className: "bg-background/95 backdrop-blur-xl border border-border shadow-xl rounded-xl mt-2",
    sx: {
      '& .MuiMenuItem-root': {
        fontSize: '0.875rem',
        borderRadius: '0.5rem',
        margin: '4px 8px',
        '&:hover': { backgroundColor: 'hsl(var(--muted))' },
        '&.Mui-selected': {
          backgroundColor: 'hsl(var(--primary) / 0.1)',
          color: 'hsl(var(--primary))',
          '&:hover': { backgroundColor: 'hsl(var(--primary) / 0.2)' },
        },
      },
    },
  },
};

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="glass p-6 rounded-3xl border border-white/20 dark:border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
    <div className={`absolute -right-6 -top-6 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl group-hover:bg-${color}-500/20 transition-colors`}></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-500`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'} bg-background/50 px-2 py-1 rounded-lg`}>
          <TrendingUp className={`w-3 h-3 ${change < 0 && 'rotate-180'}`} />
          {Math.abs(change)}%
        </div>
      </div>
      <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  </div>
);

const RecentActivity = () => {
  const activities = [
    { id: 1, user: 'Alice', action: 'Created new ticket', time: '2 mins ago', icon: HeadphonesIcon, color: 'blue' },
    { id: 2, user: 'Bob', action: 'Purchased API Pro', time: '15 mins ago', icon: ShoppingBag, color: 'purple' },
    { id: 3, user: 'System', action: 'Backup completed', time: '1 hour ago', icon: CheckCircle2, color: 'emerald' },
    { id: 4, user: 'Charlie', action: 'Failed login attempt', time: '2 hours ago', icon: AlertCircle, color: 'rose' },
  ];

  return (
    <div className="glass rounded-3xl border border-white/20 dark:border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">Recent Activity</h3>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors">
            <div className={`p-2.5 rounded-xl bg-${activity.color}-500/10 text-${activity.color}-500`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                <span className="font-bold">{activity.user}</span> {activity.action}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of system performance and activities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value="12,345" change={12.5} icon={Users} color="indigo" />
        <StatCard title="Active Services" value="85" change={5.2} icon={ShoppingBag} color="purple" />
        <StatCard title="Pending Tickets" value="23" change={-8.4} icon={HeadphonesIcon} color="orange" />
        <StatCard title="Announcements" value="12" change={0} icon={Megaphone} color="blue" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area (Placeholder) */}
        <div className="lg:col-span-2 glass rounded-3xl border border-white/20 dark:border-white/5 p-6 flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">System Traffic</h3>
            <Select
              defaultValue="7days"
              sx={selectStyles}
              MenuProps={menuProps}
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
            </Select>
          </div>
          <div className="flex-1 w-full bg-gradient-to-b from-primary/5 to-transparent rounded-2xl flex items-center justify-center border border-dashed border-border">
            <p className="text-muted-foreground text-sm">Chart Visualization Placeholder</p>
          </div>
        </div>

        {/* Activity Feed */}
        <RecentActivity />
      </div>
    </div>
  );
}
