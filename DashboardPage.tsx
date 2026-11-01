import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout, ClipboardList, AlertTriangle, Heart, Plus, CalendarDays,
  BookOpen, ArrowRight, CheckCircle2, Clock,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/contexts/AuthContext';
import {
  demoAnalytics,
  demoPlantsStore,
  demoTasksStore,
  demoNotificationsStore,
  demoCareHistoryStore,
} from '@/lib/demoStore';
import type { UserPlant, CareTask, CareHistory } from '@/types';
import { toast } from 'sonner';
import { formatDistanceToNow, parseISO, getDueStatus } from '@/lib/dateUtils';
import { cn } from '@/lib/cn';
import TaskCard from '@/components/care/TaskCard';
import PlantCard from '@/components/plants/PlantCard';
import { CardSkeleton, TaskSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';

interface DashboardStats {
  total_plants: number;
  tasks_due_today: number;
  tasks_overdue: number;
  plants_needing_attention: number;
}

export default function DashboardPage() {
  useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total_plants: 0,
    tasks_due_today: 0,
    tasks_overdue: 0,
    plants_needing_attention: 0,
  });
  const [todayTasks, setTodayTasks] = useState<CareTask[]>([]);
  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [recentActivity, setRecentActivity] = useState<CareHistory[]>([]);

  const loadData = useCallback(() => {
    demoNotificationsStore.generateDailyReminders();

    const stats = demoAnalytics.getDashboardStats();
    const tasks = demoTasksStore.getDueToday();
    const overdue = demoTasksStore.getOverdue();
    const allPlants = demoPlantsStore.getAll();
    const history = demoCareHistoryStore.getAll()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    setStats(stats);
    setTodayTasks([...overdue, ...tasks].slice(0, 5));
    setPlants(allPlants.slice(0, 6));
    setRecentActivity(history);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCompleteTask = (taskId: string) => {
    demoTasksStore.complete(taskId);
    toast.success('Task completed! 🌿');
    loadData();
  };

  const statCards = [
    {
      label: 'Total Plants',
      value: stats.total_plants,
      icon: Sprout,
      color: 'bg-mint text-primary',
      link: '/plants',
    },
    {
      label: 'Due Today',
      value: stats.tasks_due_today,
      icon: ClipboardList,
      color: 'bg-blue-50 text-blue-600',
      link: '/tasks',
    },
    {
      label: 'Overdue Tasks',
      value: stats.tasks_overdue,
      icon: AlertTriangle,
      color: stats.tasks_overdue > 0 ? 'bg-red-50 text-error' : 'bg-gray-50 text-muted',
      link: '/tasks',
    },
    {
      label: 'Needs Attention',
      value: stats.plants_needing_attention,
      icon: Heart,
      color: stats.plants_needing_attention > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-muted',
      link: '/health',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))
          ) : (
            statCards.map(({ label, value, icon: Icon, color, link }) => (
              <Link key={label} to={link} className="card p-5 hover:shadow-card-hover transition-shadow group">
                <div className="flex items-start justify-between">
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-darkText">{value}</p>
                  <p className="text-sm text-muted mt-0.5">{label}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-darkText">Today's Care</h2>
              <Link to="/tasks" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <TaskSkeleton key={i} />)
            ) : todayTasks.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="w-8 h-8" />}
                title="All caught up! 🎉"
                description="No plant care tasks are due today. Check back tomorrow or add a care schedule."
                action={
                  <Link to="/tasks" className="btn-primary btn">
                    <Plus className="w-4 h-4" /> Schedule Care
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {todayTasks.map((task) => {
                  const plant = demoPlantsStore.getById(task.plant_id);
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      plant={plant}
                      onComplete={handleCompleteTask}
                      onRefresh={loadData}
                    />
                  );
                })}
              </div>
            )}

            {/* Upcoming Tasks */}
            {!isLoading && (
              <div className="mt-6">
                <h2 className="text-lg font-bold text-darkText mb-3">Upcoming This Week</h2>
                {(() => {
                  const upcoming = demoTasksStore.getUpcoming(7);
                  if (upcoming.length === 0) {
                    return (
                      <div className="card p-4 text-center text-sm text-muted">
                        No upcoming tasks for the next 7 days.
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {upcoming.slice(0, 4).map((task) => {
                        const plant = demoPlantsStore.getById(task.plant_id);
                        const { label } = getDueStatus(task.due_at);
                        return (
                          <div key={task.id} className="card p-3 flex items-center gap-3">
                            <div className="w-10 h-10 bg-mint rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                              {plant?.image_url ? (
                                <img src={plant.image_url} alt={plant.plant_name} className="w-10 h-10 rounded-xl object-cover" />
                              ) : '🌿'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-darkText truncate">{task.title}</p>
                              <p className="text-xs text-muted">{plant?.plant_name}</p>
                            </div>
                            <span className="badge badge-gray text-xs flex-shrink-0">
                              <Clock className="w-3 h-3" />
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-bold text-darkText mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Plus, label: 'Add Plant', to: '/plants?add=true', color: 'bg-mint text-primary' },
                  { icon: CalendarDays, label: 'Calendar', to: '/calendar', color: 'bg-blue-50 text-blue-600' },
                  { icon: BookOpen, label: 'Plant Library', to: '/library', color: 'bg-amber-50 text-amber-600' },
                  { icon: Heart, label: 'Health Log', to: '/health', color: 'bg-red-50 text-error' },
                ].map(({ icon: Icon, label, to, color }) => (
                  <Link
                    key={label}
                    to={to}
                    className="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-card-hover transition-all duration-200 group active:scale-95"
                  >
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-darkText">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-lg font-bold text-darkText mb-3">Recent Activity</h2>
              <div className="card divide-y divide-gray-50">
                {recentActivity.length === 0 ? (
                  <div className="p-4 text-sm text-muted text-center">
                    No activity yet. Complete a care task to see it here.
                  </div>
                ) : (
                  recentActivity.map((history) => {
                    const plant = demoPlantsStore.getById(history.plant_id);
                    return (
                      <div key={history.id} className="p-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-mint rounded-lg flex items-center justify-center flex-shrink-0 text-sm">
                          {history.action === 'completed' ? '✅' : history.action === 'skipped' ? '⏭️' : '📅'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-darkText truncate">
                            {history.action === 'completed' ? 'Completed' : history.action === 'skipped' ? 'Skipped' : 'Scheduled'}{' '}
                            {plant?.plant_name || 'care'}
                          </p>
                          <p className="text-xs text-muted">
                            {formatDistanceToNow(parseISO(history.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Plants Overview */}
        {!isLoading && plants.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-darkText">My Plants</h2>
              <Link to="/plants" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all ({stats.total_plants}) <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state for new users */}
        {!isLoading && plants.length === 0 && (
          <div className="card p-10 text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="text-2xl font-bold text-darkText mb-3">Start Your Plant Collection</h2>
            <p className="text-muted mb-6 max-w-md mx-auto">
              Add your first plant to get started. Browse our library of 20+ plants or create a custom entry.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/plants?add=true" className="btn-primary btn">
                <Plus className="w-4 h-4" /> Add My First Plant
              </Link>
              <Link to="/library" className="btn-outline btn">
                <BookOpen className="w-4 h-4" /> Browse Library
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
