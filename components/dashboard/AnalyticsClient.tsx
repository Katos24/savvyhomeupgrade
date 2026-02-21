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
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Users,
  Loader2,
  Calendar,
  ArrowLeft  
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
};

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

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
      if (result.success) {
        setData(result.data);
      }
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

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a, #020617)' }}>
      <div className="max-w-7xl mx-auto">

     {/* Back to Dashboard */}
<div className="mb-6">
  <a
    href={`/${company.slug}/dashboard`}
    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition border border-white/20"
  >
    <ArrowLeft className="w-4 h-4" />
    Back to Dashboard
  </a>
</div>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Insights and metrics for {company.name}</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/70 text-sm font-semibold">Total Projects</p>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-4xl font-bold text-white">{data.totalProjects}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/70 text-sm font-semibold">Active Projects</p>
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-4xl font-bold text-white">{data.activeProjects}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/70 text-sm font-semibold">Completed This Month</p>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-4xl font-bold text-white">{data.completedThisMonth}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/70 text-sm font-semibold">Team Members</p>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-4xl font-bold text-white">{data.teamPerformance.length}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Status Breakdown */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Project Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
label={(entry: any) => `${entry.name}: ${entry.value}`}
                >
                  {data.statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Projects Over Time */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Projects Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.projectsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="date" stroke="#ffffff70" />
                <YAxis stroke="#ffffff70" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20' }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Categories */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Top Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topCategories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="category" stroke="#ffffff70" />
                <YAxis stroke="#ffffff70" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20' }} />
                <Bar dataKey="count" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Team Performance */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Team Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.teamPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="member" stroke="#ffffff70" />
                <YAxis stroke="#ffffff70" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20' }} />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>
    </div>
  );
}
