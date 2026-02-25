'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Users,
  Loader2,
  ArrowLeft,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
};

type AnalyticsData = {
  totalProjects: number;
  activeProjects: number;
  completedThisMonth: number;
  statusBreakdown: Array<{ name: string; value: number; color: string }>;
  projectsOverTime: Array<{ date: string; count: number }>;
  topCategories: Array<{ category: string; count: number }>;
  teamPerformance: Array<{ member: string; count: number }>;
  leadSources: Array<{ source: string; value: number }>;
  totalQuoted?: number;
  totalCollected?: number;
  totalOutstanding?: number;
  avgJobValue?: number;
};

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toLocaleString()}`;

export default function AnalyticsClient({ company }: { company: Company }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const response = await fetch(`/api/company/${company.slug}/analytics?range=${timeRange}`);
      const result = await response.json();
      if (result.success) setData(result.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f172a' }}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f172a' }}>
        <p className="text-white">Failed to load analytics</p>
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '12px',
  };

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a, #020617)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Back to Dashboard */}
        <div className="mb-6">
          <a
            href={`/${company.slug}/dashboard`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition border border-white/20 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>
        </div>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Analytics Dashboard</h1>
          <p className="text-gray-400 text-sm">Insights and metrics for {company.name}</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>

        {/* Top Metrics — 2 col mobile, 4 col desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/70 text-xs sm:text-sm font-semibold">Total Projects</p>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-white">{data.totalProjects}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/70 text-xs sm:text-sm font-semibold">Active Projects</p>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-white">{data.activeProjects}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/70 text-xs sm:text-sm font-semibold">Completed / Mo</p>
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-white">{data.completedThisMonth}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/70 text-xs sm:text-sm font-semibold">Team Members</p>
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-white">{data.teamPerformance.length}</p>
          </div>
        </div>

        {/* Revenue Metrics — only show if data exists */}
        {(data.totalQuoted != null || data.totalCollected != null || data.totalOutstanding != null) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
            {data.totalQuoted != null && (
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70 text-xs sm:text-sm font-semibold">Total Quoted</p>
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white">{fmt(data.totalQuoted)}</p>
              </div>
            )}
            {data.totalCollected != null && (
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70 text-xs sm:text-sm font-semibold">Collected</p>
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white">{fmt(data.totalCollected)}</p>
              </div>
            )}
            {data.totalOutstanding != null && (
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70 text-xs sm:text-sm font-semibold">Outstanding</p>
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white">{fmt(data.totalOutstanding)}</p>
              </div>
            )}
          </div>
        )}

        {/* Charts Grid — stacked on mobile, 2-col on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          
          {/* Status Breakdown */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/20">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4">Project Status</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend below chart for mobile readability */}
            <div className="grid grid-cols-2 gap-1 mt-2">
              {data.statusBreakdown.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color || COLORS[i % COLORS.length] }} />
                  <span className="text-white/60 capitalize truncate">{s.name}</span>
                  <span className="text-white font-semibold ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Over Time */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/20">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4">Projects Over Time</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.projectsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Bottom Charts — stacked on mobile, 2-col on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Top Categories */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/20">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4">Top Categories</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.topCategories} layout="vertical" margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                <YAxis type="category" dataKey="category" stroke="rgba(255,255,255,0.4)" fontSize={10} width={90} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Team Performance */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/20">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4">Team Performance</h3>
            {data.teamPerformance.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-white/40 text-sm">No team data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.teamPerformance} layout="vertical" margin={{ left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                  <YAxis type="category" dataKey="member" stroke="rgba(255,255,255,0.4)" fontSize={10} width={90} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}