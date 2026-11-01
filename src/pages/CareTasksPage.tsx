import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  Droplets,
  Scissors,
  RefreshCw,
  X,
  Layers,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import TaskCard from '@/components/care/TaskCard';
import EmptyState from '@/components/common/EmptyState';
import { TaskSkeleton } from '@/components/common/Skeleton';
import {
  demoTasksStore,
  demoPlantsStore,
  demoSchedulesStore,
} from '@/lib/demoStore';
import type { CareTask, UserPlant, ActivityType, RecurrenceType } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import { Link } from 'react-router-dom';

type FilterTab = 'all' | 'today' | 'overdue' | 'upcoming' | 'completed';

export default function CareTasksPage() {
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState<FilterTab>('today');
  const [selectedPlantId, setSelectedPlantId] = useState<string>('all');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | 'all'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlantId, setNewPlantId] = useState('');
  const [newActivity, setNewActivity] = useState<ActivityType>('watering');
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newDueTime, setNewDueTime] = useState('09:00');
  const [newRecurrence, setNewRecurrence] = useState<RecurrenceType>('weekly');

  const loadData = useCallback(() => {
    const allTasks = demoTasksStore.getAll();
    const allPlants = demoPlantsStore.getAll();
    setTasks(allTasks);
    setPlants(allPlants);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCompleteTask = (taskId: string) => {
    demoTasksStore.complete(taskId);
    toast.success('Task marked as complete! 🌿');
    loadData();
  };

  const handleCompleteAllToday = () => {
    const today = demoTasksStore.getDueToday();
    if (today.length === 0) return;
    today.forEach((t) => demoTasksStore.complete(t.id));
    toast.success(`Marked ${today.length} tasks as complete! 🎉`);
    loadData();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlantId) {
      toast.error('Please select a plant');
      return;
    }

    const plant = demoPlantsStore.getById(newPlantId);
    const title = newTitle.trim() || `${newActivity.charAt(0).toUpperCase() + newActivity.slice(1)} - ${plant?.plant_name || 'Plant'}`;

    if (newRecurrence === 'once') {
      demoTasksStore.create({
        plant_id: newPlantId,
        schedule_id: null,
        activity_type: newActivity,
        title,
        due_at: `${newDueDate}T${newDueTime}:00`,
        status: 'pending',
        completed_at: null,
        skipped_at: null,
        skipped_reason: null,
        notes: null,
        occurrence_key: null,
      });
    } else {
      demoSchedulesStore.create({
        plant_id: newPlantId,
        activity_type: newActivity,
        title,
        instructions: `Regular ${newActivity} care for ${plant?.plant_name}`,
        start_date: `${newDueDate}T${newDueTime}:00`,
        due_time: newDueTime,
        recurrence_type: newRecurrence,
        recurrence_interval: 1,
        next_due_at: `${newDueDate}T${newDueTime}:00`,
        end_date: null,
        is_active: true,
        notify_before_hours: 2,
      });
    }

    toast.success('Care task scheduled successfully! 🌿');
    setIsModalOpen(false);
    loadData();
  };

  // Counts
  const counts = useMemo(() => {
    const today = demoTasksStore.getDueToday().length;
    const overdue = demoTasksStore.getOverdue().length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const total = tasks.length;
    return { today, overdue, completed, total };
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Status filter tab
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab === 'today') {
      result = result.filter(
        (t) => t.status === 'pending' && t.due_at.startsWith(todayStr)
      );
    } else if (activeTab === 'overdue') {
      result = result.filter(
        (t) => t.status === 'pending' && new Date(t.due_at) < today
      );
    } else if (activeTab === 'upcoming') {
      result = result.filter(
        (t) => t.status === 'pending' && new Date(t.due_at) > new Date()
      );
    } else if (activeTab === 'completed') {
      result = result.filter((t) => t.status === 'completed');
    }

    // Plant filter
    if (selectedPlantId !== 'all') {
      result = result.filter((t) => t.plant_id === selectedPlantId);
    }

    // Activity filter
    if (selectedActivity !== 'all') {
      result = result.filter((t) => t.activity_type === selectedActivity);
    }

    // Sort by due date (soonest first)
    return result.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
  }, [tasks, activeTab, selectedPlantId, selectedActivity]);

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-darkText flex items-center gap-2">
              <ClipboardList className="w-8 h-8 text-primary" />
              Care Tasks
            </h1>
            <p className="text-muted text-sm mt-1">
              Manage your daily hydration, feeding, and grooming routines.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {counts.today > 0 && activeTab === 'today' && (
              <button
                onClick={handleCompleteAllToday}
                className="btn-outline btn-sm text-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Complete All Today ({counts.today})
              </button>
            )}
            <button
              onClick={() => {
                if (plants.length > 0) {
                  setNewPlantId(plants[0].id);
                }
                setIsModalOpen(true);
              }}
              className="btn-primary btn-sm text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Schedule Care
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => setActiveTab('today')}
            className={cn(
              'card p-4 cursor-pointer transition-all border',
              activeTab === 'today'
                ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                : 'border-transparent hover:border-gray-200'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted font-medium">Due Today</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-darkText mt-2">{counts.today}</p>
          </div>

          <div
            onClick={() => setActiveTab('overdue')}
            className={cn(
              'card p-4 cursor-pointer transition-all border',
              activeTab === 'overdue'
                ? 'border-error ring-2 ring-error/20 shadow-sm'
                : 'border-transparent hover:border-gray-200'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted font-medium">Overdue</span>
              <AlertCircle className="w-4 h-4 text-error" />
            </div>
            <p className={cn('text-2xl font-bold mt-2', counts.overdue > 0 ? 'text-error' : 'text-darkText')}>
              {counts.overdue}
            </p>
          </div>

          <div
            onClick={() => setActiveTab('completed')}
            className={cn(
              'card p-4 cursor-pointer transition-all border',
              activeTab === 'completed'
                ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                : 'border-transparent hover:border-gray-200'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted font-medium">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-darkText mt-2">{counts.completed}</p>
          </div>

          <div
            onClick={() => setActiveTab('all')}
            className={cn(
              'card p-4 cursor-pointer transition-all border',
              activeTab === 'all'
                ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                : 'border-transparent hover:border-gray-200'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted font-medium">Total Tasks</span>
              <Layers className="w-4 h-4 text-gray-500" />
            </div>
            <p className="text-2xl font-bold text-darkText mt-2">{counts.total}</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="card p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(
                [
                  { id: 'today', label: 'Due Today' },
                  { id: 'overdue', label: 'Overdue' },
                  { id: 'upcoming', label: 'Upcoming' },
                  { id: 'completed', label: 'Done' },
                  { id: 'all', label: 'All Tasks' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-muted hover:bg-gray-200 hover:text-darkText'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Select Dropdowns */}
            <div className="flex items-center gap-2">
              <select
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value)}
                className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-darkText focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="all">All Plants</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.plant_name}
                  </option>
                ))}
              </select>

              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value as ActivityType | 'all')}
                className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-darkText focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="all">All Activities</option>
                <option value="watering">Watering 💧</option>
                <option value="fertilizing">Fertilizing ✨</option>
                <option value="misting">Misting ☁️</option>
                <option value="pruning">Pruning ✂️</option>
                <option value="repotting">Repotting 🪴</option>
                <option value="leaf_cleaning">Leaf Cleaning 🍃</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <TaskSkeleton key={i} />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="w-10 h-10 text-primary" />}
            title={
              activeTab === 'today'
                ? 'All caught up for today! 🎉'
                : activeTab === 'overdue'
                ? 'No overdue tasks 👍'
                : 'No tasks found'
            }
            description={
              plants.length === 0
                ? 'You have not added any plants yet. Add a plant from the library to set up care schedules.'
                : 'No tasks match your current filter settings. Schedule a new task or change filters.'
            }
            action={
              plants.length === 0 ? (
                <Link to="/library" className="btn-primary btn">
                  Browse Plant Library
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setNewPlantId(plants[0]?.id || '');
                    setIsModalOpen(true);
                  }}
                  className="btn-primary btn"
                >
                  <Plus className="w-4 h-4" /> Schedule Care Task
                </button>
              )
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
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

        {/* Schedule Care Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card max-w-md w-full bg-white p-6 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="font-bold text-darkText text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Schedule Care Task
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-muted hover:text-darkText"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {plants.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted text-sm mb-4">
                    You need to have at least one plant to schedule a care task.
                  </p>
                  <Link
                    to="/library"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-primary btn-sm"
                  >
                    Go to Plant Library
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="label">Plant</label>
                    <select
                      value={newPlantId}
                      onChange={(e) => setNewPlantId(e.target.value)}
                      className="input"
                      required
                    >
                      {plants.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.plant_name} {p.location ? `(${p.location})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Activity Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'watering', label: 'Water', icon: Droplets },
                        { id: 'fertilizing', label: 'Feed', icon: Sparkles },
                        { id: 'misting', label: 'Mist', icon: Droplets },
                        { id: 'pruning', label: 'Prune', icon: Scissors },
                        { id: 'repotting', label: 'Repot', icon: RefreshCw },
                        { id: 'leaf_cleaning', label: 'Clean', icon: Sparkles },
                      ].map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setNewActivity(id as ActivityType)}
                          className={cn(
                            'p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all',
                            newActivity === id
                              ? 'border-primary bg-mint text-primary font-semibold'
                              : 'border-gray-200 text-muted hover:bg-gray-50'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Task Title (Optional)</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Deep soak with filtered water"
                      className="input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Due Date</label>
                      <input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Due Time</label>
                      <input
                        type="time"
                        value={newDueTime}
                        onChange={(e) => setNewDueTime(e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Recurrence</label>
                    <select
                      value={newRecurrence}
                      onChange={(e) => setNewRecurrence(e.target.value as RecurrenceType)}
                      className="input"
                    >
                      <option value="once">Once only</option>
                      <option value="daily">Every day</option>
                      <option value="every_2_days">Every 2 days</option>
                      <option value="every_3_days">Every 3 days</option>
                      <option value="weekly">Weekly (Every 7 days)</option>
                      <option value="every_2_weeks">Bi-weekly (Every 14 days)</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="btn-ghost btn flex-1"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary btn flex-1">
                      Schedule Care
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
