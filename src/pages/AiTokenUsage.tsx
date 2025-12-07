import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wallet, BarChart3, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { useApiCall } from '../hooks/useApiCall';
import apiService from '../api/apiService';

interface TokenUsage {
  name: string;
  value: number;
  [key: string]: string | number; // 添加索引签名以兼容 ChartDataInput
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

export default function AiTokenUsage() {
  const { data: tokenData, loading, error } = useApiCall<{ data: TokenUsage[] }>(
    () => apiService.getTokenUsage(),
    true // auto-fetch on mount
  );

  const data = tokenData?.data || [];

  // Calculate statistics from data
  const totalTokens = data.reduce((sum, item) => sum + item.value, 0);
  const mostPopularModel = data.length > 0
    ? data.reduce((max, item) => item.value > max.value ? item : max, data[0]).name
    : 'N/A';
  const estimatedCost = (totalTokens * 0.00003).toFixed(2); // Example: $0.03 per 1000 tokens

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading token usage data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center glass rounded-2xl p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to load token usage</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Token Usage</h1>
        <p className="text-muted-foreground mt-2">Monitor and analyze your AI model consumption.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Chart Card */}
        <div className="glass rounded-3xl p-8 flex flex-col h-[500px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <PieChart className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Token Distribution</h2>
          </div>

          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={8}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="transparent"
                      className="hover:opacity-80 transition-opacity duration-300"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.05)',
                    color: '#1e293b'
                  }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none text-muted-foreground/20">
              <Sparkles className="w-16 h-16" />
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="glass rounded-3xl p-8 flex flex-col justify-center gap-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Usage Statistics</h2>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                <DatabaseIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Total Tokens Used</span>
              </div>
              <div className="text-4xl font-black text-primary tracking-tight">
                {totalTokens.toLocaleString()}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                <Wallet className="w-5 h-5" />
                <span className="text-sm font-medium">Estimated Cost</span>
              </div>
              <div className="text-4xl font-black text-emerald-500 tracking-tight">
                ${estimatedCost}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Most Popular Model</span>
              </div>
              <div className="text-4xl font-black text-purple-500 tracking-tight">
                {mostPopularModel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DatabaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
