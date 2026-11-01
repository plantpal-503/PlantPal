import { useState, useEffect } from 'react';
import {
  BarChart3,
  Flame,
  CheckCircle2,
  Sprout,
  AlertTriangle,
  TrendingUp,
  Droplets,
  Award,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { demoAnalytics } from '@/lib/demoStore';
import type { AnalyticsData } from '@/types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Link } from 'react-router-dom';

const ACTIVITY_COLORS: Record<string, string> = {
  watering: '#2E7D32',
  fertilizing: '#E65100',
  misting: '#0288D1',
  pruning: '#43A047',
  repotting: '#7B1FA2',
  leaf_cleaning: '#00897B',
  custom: '#616161',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    setData(demoAnalytics.getAnalyticsData());
  }, []);

  if (!data) {
    return (
      <AppShell>
        <div className="card p-12 text-center">
          <p className="text-muted">Loading analytics...</p>
        </div>
      </AppShell>
    );
  }

  // Format weekly dates for chart
  const formattedWeekly = data.weekly_activity.map((item) => {
    const parts = item.date.split('-');
    const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : item.date;
    return {
      ...item,
      displayDate: label,
    };
  });

  const pieData = data.activity_breakdown.map((item) => ({
    name: item.activity_type.charAt(0).toUpperCase() + item.activity_type.slice(1).replace('_', ' '),
    value: item.count,
    color: ACTIVITY_COLORS[item.activity_type] || '#2E7D32',
  }));

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-darkText flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-primary" />
              Plant Care Analytics
            </h1>
            <p className="text-muted text-sm mt-1">
              Visualize care trends, streak records, and routine completion rates.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="badge badge-green text-xs px-3 py-1.5 font-semibold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Healthy Routine
            </span>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Care Streak */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted font-semibold uppercase">Care Streak</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-5 h-5 fill-amber-500" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold text-darkText">
                {data.streak_days}{' '}
                <span className="text-sm font-medium text-muted">days</span>
              </p>
              <p className="text-xs text-amber-600 font-medium mt-1">
                {data.streak_days > 0 ? 'Consistent green thumb! 🔥' : 'Log a care task today'}
              </p>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted font-semibold uppercase">Completion Rate</span>
              <div className="w-9 h-9 rounded-xl bg-mint text-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold text-darkText">
                {data.completion_rate}%
              </p>
              <p className="text-xs text-primary font-medium mt-1">
                {data.completion_rate >= 80 ? 'Excellent care pace 🌱' : 'Room to grow!'}
              </p>
            </div>
          </div>

          {/* Total Tasks Done */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted font-semibold uppercase">Completed Tasks</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold text-darkText">
                {data.total_tasks_completed}
              </p>
              <p className="text-xs text-muted mt-1">
                {data.total_tasks_pending} tasks still pending
              </p>
            </div>
          </div>

          {/* Plants in Care */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted font-semibold uppercase">Total Plants</span>
              <div className="w-9 h-9 rounded-xl bg-mint text-primary flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold text-darkText">
                {data.total_plants}
              </p>
              <p className="text-xs text-muted mt-1">Active in garden collection</p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Weekly Activity Bar Chart */}
          <div className="lg:col-span-2 card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-darkText text-base">Weekly Care Activity</h3>
                <p className="text-xs text-muted">Completed vs pending tasks across the past 7 days</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-primary" />
                  <span className="text-muted">Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-gray-200" />
                  <span className="text-muted">Pending</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedWeekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="completed" fill="#2E7D32" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="pending" fill="#E5E7EB" radius={[4, 4, 0, 0]} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Breakdown Pie Chart */}
          <div className="card p-5 space-y-4">
            <div>
              <h3 className="font-bold text-darkText text-base">Care Distribution</h3>
              <p className="text-xs text-muted">Breakdown by care activity type</p>
            </div>

            {pieData.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-center text-xs text-muted">
                <Droplets className="w-8 h-8 text-muted/50 mb-2" />
                Complete tasks to see activity distribution
              </div>
            ) : (
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Legend list */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100 max-h-32 overflow-y-auto">
              {data.activity_breakdown.map((item) => (
                <div key={item.activity_type} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: ACTIVITY_COLORS[item.activity_type] || '#2E7D32' }}
                    />
                    <span className="text-muted capitalize">
                      {item.activity_type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="font-semibold text-darkText">{item.count} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Most Active Plants & Health Overview */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Plants Card */}
          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-darkText text-base">Most Attended Plants</h3>

            {data.top_plants.length === 0 ? (
              <p className="text-xs text-muted text-center py-8">
                No care activity logged for plants yet.
              </p>
            ) : (
              <div className="space-y-3">
                {data.top_plants.map((tp, idx) => (
                  <div key={tp.plant_id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-mint text-primary text-xs font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <Link
                          to={`/plants/${tp.plant_id}`}
                          className="text-sm font-semibold text-darkText hover:text-primary transition-colors"
                        >
                          {tp.plant_name}
                        </Link>
                      </div>
                    </div>
                    <span className="badge badge-green text-xs font-semibold">
                      {tp.task_count} care tasks
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plant Health & Garden Insights */}
          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-darkText text-base">Garden Insights</h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-primary-100 bg-mint/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-darkText">Hydration Regularity</h4>
                  <p className="text-xs text-muted mt-0.5">
                    Your watering schedule shows great consistency. Regularly checking topsoil prevents root stress and rot.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/50 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-darkText">Seasonal Adjustment</h4>
                  <p className="text-xs text-muted mt-0.5">
                    As weather transitions, inspect indoor heating/air vents. Move plants away from direct drafts to prevent tip browning.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted">Need to expand your collection?</span>
                <Link to="/library" className="btn-outline btn-sm text-xs">
                  Explore Plant Library
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
