import React from 'react';
import { Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  TrendingUp,
  Database,
  AlertCircle,
  Users,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn, CHART_TOOLTIP_STYLE, CHART_ITEM_STYLE } from '../lib/utils';
import { useModels } from '../hooks/useModels';
import { useStats } from '../hooks/useStats';

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  'trending-up': <TrendingUp className="w-6 h-6" />,
  'database': <Database className="w-6 h-6" />,
  'alert-circle': <AlertCircle className="w-6 h-6" />,
  'users': <Users className="w-6 h-6" />,
};

// Interfaces
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  iconColorClass: string;
  iconBgClass: string;
}

// Components (moved to separate file for better organization)
const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon, iconColorClass, iconBgClass }) => (
  <div className="glass rounded-2xl p-6 flex flex-col justify-between h-full hover:scale-[1.02] transition-transform duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-2xl flex items-center justify-center", iconBgClass, iconColorClass)}>
        {icon}
      </div>
      <div className={cn(
        "flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm",
        isPositive
          ? "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 border border-emerald-200/50"
          : "bg-red-100/50 text-red-700 dark:bg-red-900/50 dark:text-red-400 border border-red-200/50"
      )}>
        {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
        {change}
      </div>
    </div>
    <div>
      <h3 className="text-3xl font-extrabold tracking-tight mb-1 text-foreground">{value}</h3>
      <p className="text-sm text-muted-foreground font-medium">{title}</p>
    </div>
  </div>
);


const trendData = [
  { date: '12/01', requests: 4000, tokens: 240000 },
  { date: '12/02', requests: 3000, tokens: 139800 },
  { date: '12/03', requests: 2000, tokens: 980000 },
  { date: '12/04', requests: 2780, tokens: 390800 },
  { date: '12/05', requests: 1890, tokens: 480000 },
  { date: '12/06', requests: 2390, tokens: 380000 },
  { date: '12/07', requests: 3490, tokens: 430000 },
];

// Remove hardcoded data - will use config instead

export default function DashboardHome() {
  const { models, chartColors } = useModels();
  const { dashboardStats } = useStats();
  const [period, setPeriod] = React.useState('7');
  const [granularity, setGranularity] = React.useState('day');
  const [modelPeriod, setModelPeriod] = React.useState('daily');

  // Transform model data for the chart
  const modelData = models.map(model => ({
    name: model.name,
    value: model.stats.percentage,
    requests: model.stats.requests,
    tokens: model.stats.tokens,
  }));

  // Transform stats data with icons
  const stats = dashboardStats.map(stat => ({
    ...stat,
    icon: iconMap[stat.icon],
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent inline-block">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Overview of your AI usage and performance.</p>
        </div>

        {/* Date Filter */}
        <div className="flex bg-muted/50 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-sm">
          {['1', '7', '30'].map((val) => (
            <button
              key={val}
              onClick={() => setPeriod(val)}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
                period === val
                  ? "bg-white dark:bg-slate-800 text-foreground shadow-md scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/20"
              )}
            >
              {val === '1' ? '24h' : `${val} Days`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Usage Trend */}
        <div className="lg:col-span-2 glass rounded-3xl p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Usage Trends</h2>
              <p className="text-sm text-muted-foreground">Requests & Tokens</p>
            </div>
            <div className="flex bg-muted/50 rounded-lg p-1 text-xs backdrop-blur-sm">
              {['day', 'hour'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className={cn(
                    "px-3 py-1.5 rounded-md transition-all capitalize font-bold",
                    granularity === g ? "bg-white dark:bg-slate-800 shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={CHART_ITEM_STYLE}
                  labelStyle={{ color: '#64748b' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Area yAxisId="left" name="Requests" type="monotone" dataKey="requests" stroke="#6366f1" fillOpacity={1} fill="url(#colorRequests)" strokeWidth={3} />
                <Area yAxisId="right" name="Tokens" type="monotone" dataKey="tokens" stroke="#10B981" fillOpacity={1} fill="url(#colorTokens)" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Distribution (Donut Chart) */}
        <div className="glass rounded-3xl p-8 flex flex-col h-[500px] lg:h-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Distribution</h2>
              <p className="text-sm text-muted-foreground">Usage by Model</p>
            </div>
            <select
              value={modelPeriod}
              onChange={(e) => setModelPeriod(e.target.value)}
              className="bg-muted/50 text-sm font-bold text-foreground rounded-lg py-1.5 pl-3 pr-8 border-none focus:ring-2 focus:ring-primary cursor-pointer backdrop-blur-sm"
            >
              <option value="daily">Daily</option>
              <option value="total">Total</option>
            </select>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[240px]">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={modelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80} // Larger inner radius for thinner donut
                  outerRadius={100}
                  paddingAngle={6}
                  cornerRadius={8} // Rounded corners
                  dataKey="value"
                >
                  {modelData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColors[index % chartColors.length]}
                      stroke="transparent"
                      strokeWidth={0}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  itemStyle={CHART_ITEM_STYLE}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-[-10px]">
              <div className="text-4xl font-black text-foreground tracking-tighter">1.2K</div>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Total</div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {models.map((model, index) => (
              <div key={model.id} className="flex items-center justify-between text-sm p-3 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                  <span className="font-bold text-foreground">{model.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-foreground/90">{model.stats.requests}</span>
                  <span className="text-muted-foreground font-mono text-xs w-8 text-right">{model.stats.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}