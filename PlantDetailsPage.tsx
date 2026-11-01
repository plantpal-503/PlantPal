import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Droplets,
  Heart,
  MapPin,
  Trash2,
  Plus,
  X,
  BookMarked,
  Info,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import {
  demoPlantsStore,
  demoTasksStore,
  demoSchedulesStore,
  demoHealthLogsStore,
  demoJournalStore,
} from '@/lib/demoStore';
import type {
  UserPlant,
  CareTask,
  CareSchedule,
  PlantHealthLog,
  GrowthJournalEntry,
  ActivityType,
  HealthStatus,
} from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import { formatDistanceToNow, parseISO, format } from '@/lib/dateUtils';
import TaskCard from '@/components/care/TaskCard';

export default function PlantDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [plant, setPlant] = useState<UserPlant | null>(null);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [schedules, setSchedules] = useState<CareSchedule[]>([]);
  const [healthLogs, setHealthLogs] = useState<PlantHealthLog[]>([]);
  const [journalEntries, setJournalEntries] = useState<GrowthJournalEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'care' | 'health' | 'journal' | 'guide'>('care');

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskActivity, setTaskActivity] = useState<ActivityType>('watering');
  const [taskDueDate, setTaskDueDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [journalHeight, setJournalHeight] = useState('');
  const [journalLeaves, setJournalLeaves] = useState('');
  const [journalNotes, setJournalNotes] = useState('');

  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('healthy');
  const [healthObservations, setHealthObservations] = useState('');

  const loadData = useCallback(() => {
    if (!id) return;
    const foundPlant = demoPlantsStore.getById(id);
    if (!foundPlant) {
      setPlant(null);
      return;
    }
    setPlant(foundPlant);
    setTasks(demoTasksStore.getByPlantId(id));
    setSchedules(demoSchedulesStore.getByPlantId(id));
    setHealthLogs(demoHealthLogsStore.getByPlantId(id));
    setJournalEntries(demoJournalStore.getByPlantId(id));
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!plant) {
    return (
      <AppShell>
        <div className="card p-12 text-center max-w-md mx-auto my-12 animate-fade-in">
          <div className="text-5xl mb-4">🪴</div>
          <h2 className="text-xl font-bold text-darkText mb-2">Plant Not Found</h2>
          <p className="text-muted text-sm mb-6">
            We couldn't locate this plant in your garden collection. It may have been removed.
          </p>
          <Link to="/plants" className="btn-primary btn">
            <ArrowLeft className="w-4 h-4" /> Back to My Plants
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleQuickWater = () => {
    // Complete existing pending watering task if any
    const pendingWatering = tasks.find(
      (t) => t.activity_type === 'watering' && t.status === 'pending'
    );
    if (pendingWatering) {
      demoTasksStore.complete(pendingWatering.id);
    } else {
      // Or create and complete a quick watering task
      const newTask = demoTasksStore.create({
        plant_id: plant.id,
        schedule_id: null,
        activity_type: 'watering',
        title: `Water ${plant.plant_name}`,
        due_at: new Date().toISOString(),
        status: 'completed',
        completed_at: new Date().toISOString(),
        skipped_at: null,
        skipped_reason: null,
        notes: 'Quick watered via plant details',
        occurrence_key: null,
      });
      demoTasksStore.complete(newTask.id);
    }
    toast.success(`${plant.plant_name} watered! 💧`);
    loadData();
  };

  const handleDeletePlant = () => {
    if (window.confirm(`Are you sure you want to remove "${plant.plant_name}" from your garden?`)) {
      demoPlantsStore.delete(plant.id);
      toast.success('Plant removed from garden');
      navigate('/plants');
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    demoTasksStore.create({
      plant_id: plant.id,
      schedule_id: null,
      activity_type: taskActivity,
      title: `${taskActivity.charAt(0).toUpperCase() + taskActivity.slice(1)} - ${plant.plant_name}`,
      due_at: `${taskDueDate}T09:00:00`,
      status: 'pending',
      completed_at: null,
      skipped_at: null,
      skipped_reason: null,
      notes: null,
      occurrence_key: null,
    });
    toast.success('Care task scheduled! 🌿');
    setIsTaskModalOpen(false);
    loadData();
  };

  const handleCreateJournal = (e: React.FormEvent) => {
    e.preventDefault();
    demoJournalStore.create({
      plant_id: plant.id,
      entry_date: new Date().toISOString().split('T')[0],
      height_value: journalHeight ? parseFloat(journalHeight) : null,
      height_unit: 'cm',
      leaf_count: journalLeaves ? parseInt(journalLeaves, 10) : null,
      notes: journalNotes.trim() || null,
      image_urls: [],
    });
    toast.success('Growth entry saved! 📖');
    setIsJournalModalOpen(false);
    setJournalHeight('');
    setJournalLeaves('');
    setJournalNotes('');
    loadData();
  };

  const handleUpdateHealth = (e: React.FormEvent) => {
    e.preventDefault();
    demoPlantsStore.update(plant.id, { health_status: healthStatus });
    demoHealthLogsStore.create({
      plant_id: plant.id,
      health_status: healthStatus,
      symptoms: healthStatus === 'healthy' ? ['Normal'] : ['Observations noted'],
      observations: healthObservations.trim() || null,
      image_urls: [],
    });
    toast.success('Health status updated! 🩺');
    setIsHealthModalOpen(false);
    setHealthObservations('');
    loadData();
  };

  const healthBadge = {
    healthy: { label: 'Healthy', className: 'badge-green' },
    needs_attention: { label: 'Needs Care', className: 'badge-yellow' },
    recovering: { label: 'Recovering', className: 'badge-blue' },
    critical: { label: 'Critical', className: 'badge-red' },
  }[plant.health_status] || { label: 'Healthy', className: 'badge-green' };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in pb-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/plants"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Plants
          </Link>

          <button
            onClick={handleDeletePlant}
            className="text-gray-400 hover:text-error transition-colors text-xs flex items-center gap-1 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Plant
          </button>
        </div>

        {/* Hero Card */}
        <div className="card overflow-hidden">
          <div className="grid md:grid-cols-3 gap-0">
            {/* Plant Photo */}
            <div className="relative h-64 md:h-auto bg-primary-100/50">
              {plant.image_url ? (
                <img
                  src={plant.image_url}
                  alt={plant.plant_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  🪴
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className={cn('badge text-xs font-semibold shadow-sm', healthBadge.className)}>
                  {healthBadge.label}
                </span>
              </div>
            </div>

            {/* Plant Info & Quick Actions */}
            <div className="p-6 md:col-span-2 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="badge bg-mint text-primary text-xs font-semibold capitalize">
                    {plant.category || 'Foliage'}
                  </span>
                  <span className="badge bg-gray-100 text-muted text-xs capitalize">
                    {plant.is_indoor ? '🏡 Indoor' : '🌳 Outdoor'}
                  </span>
                  {plant.location && (
                    <span className="badge bg-gray-100 text-muted text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {plant.location}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-darkText">
                  {plant.plant_name}
                </h1>

                {plant.species?.scientific_name && (
                  <p className="text-sm text-muted italic mt-0.5">
                    {plant.species.scientific_name}
                  </p>
                )}

                {plant.notes && (
                  <p className="text-xs text-muted mt-3 leading-relaxed max-w-xl">
                    {plant.notes}
                  </p>
                )}

                {/* Quick specs grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 mt-4 border-t border-gray-100 text-xs">
                  <div>
                    <span className="text-muted block text-[11px]">Light</span>
                    <span className="font-semibold text-darkText truncate block mt-0.5">
                      {plant.light_conditions || 'Indirect light'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Soil</span>
                    <span className="font-semibold text-darkText truncate block mt-0.5">
                      {plant.soil_type || 'Well-draining mix'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[11px]">Pot Type</span>
                    <span className="font-semibold text-darkText truncate block mt-0.5">
                      {plant.pot_type || 'Ceramic Pot'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={handleQuickWater}
                  className="btn-primary btn-sm text-xs flex items-center gap-1.5 shadow-none"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  Quick Water
                </button>
                <button
                  onClick={() => {
                    setHealthStatus(plant.health_status);
                    setIsHealthModalOpen(true);
                  }}
                  className="btn-outline btn-sm text-xs flex items-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 text-error" />
                  Update Health
                </button>
                <button
                  onClick={() => setIsJournalModalOpen(true)}
                  className="btn-outline btn-sm text-xs flex items-center gap-1.5"
                >
                  <BookMarked className="w-3.5 h-3.5 text-primary" />
                  Add Journal Log
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="card p-2 flex gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'care', label: 'Care Schedule & Tasks', count: tasks.filter((t) => t.status === 'pending').length },
            { id: 'health', label: 'Health History', count: healthLogs.length },
            { id: 'journal', label: 'Growth Journal', count: journalEntries.length },
            { id: 'guide', label: 'Care Requirements', count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2',
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:bg-gray-100 hover:text-darkText'
              )}
            >
              <span>{tab.label}</span>
              {tab.count != null && tab.count > 0 && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-mint text-primary'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Care Schedule & Tasks */}
        {activeTab === 'care' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-darkText text-base">Upcoming Care Tasks</h3>
                <p className="text-xs text-muted">Tasks scheduled specifically for {plant.plant_name}</p>
              </div>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="btn-primary btn-sm text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Schedule Task
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-muted text-xs">No care tasks scheduled for this plant.</p>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="btn-outline btn-sm text-xs mt-3 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    plant={plant}
                    onComplete={(id) => {
                      demoTasksStore.complete(id);
                      toast.success('Task done! 🌿');
                      loadData();
                    }}
                    onRefresh={loadData}
                  />
                ))}
              </div>
            )}

            {/* Active Recurring Schedules */}
            {schedules.length > 0 && (
              <div className="pt-4 space-y-3">
                <h4 className="font-bold text-darkText text-sm">Recurring Care Routines</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {schedules.map((sch) => (
                    <div key={sch.id} className="card p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-darkText capitalize">
                          {sch.title}
                        </span>
                        <span className="badge badge-green text-[10px] capitalize">
                          {sch.recurrence_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-muted">{sch.instructions || 'Routine automated care'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Health History */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-darkText text-base">Health Inspection History</h3>
                <p className="text-xs text-muted">Past wellness checks and treatments</p>
              </div>
              <button
                onClick={() => {
                  setHealthStatus(plant.health_status);
                  setIsHealthModalOpen(true);
                }}
                className="btn-primary btn-sm text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Log Inspection
              </button>
            </div>

            {healthLogs.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-muted text-xs">No health checks logged yet for this plant.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {healthLogs.map((log) => (
                  <div key={log.id} className="card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-green text-xs capitalize">
                        {log.health_status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-muted">
                        {formatDistanceToNow(parseISO(log.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {log.symptoms?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {log.symptoms.map((s, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-muted">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    {log.observations && (
                      <p className="text-xs text-darkText/80 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        {log.observations}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Growth Journal */}
        {activeTab === 'journal' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-darkText text-base">Growth Timeline</h3>
                <p className="text-xs text-muted">Milestones and height progress</p>
              </div>
              <button
                onClick={() => setIsJournalModalOpen(true)}
                className="btn-primary btn-sm text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Milestone
              </button>
            </div>

            {journalEntries.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-muted text-xs">No journal entries recorded for this plant yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {entry.height_value && (
                          <span className="badge badge-green text-xs font-semibold">
                            📏 {entry.height_value} {entry.height_unit || 'cm'}
                          </span>
                        )}
                        {entry.leaf_count && (
                          <span className="badge badge-blue text-xs font-semibold">
                            🍃 {entry.leaf_count} leaves
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted">
                        {format(parseISO(entry.entry_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-darkText/85 bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-relaxed">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Care Requirements Guide */}
        {activeTab === 'guide' && (
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-darkText text-base flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Care & Environment Guide
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-darkText block mb-1">💧 Watering Guide</span>
                <p className="text-muted leading-relaxed">
                  {plant.watering_notes || 'Water thoroughly when top 2 inches of soil feel dry. Do not let roots sit in standing water.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-darkText block mb-1">☀️ Sunlight & Exposure</span>
                <p className="text-muted leading-relaxed">
                  {plant.light_conditions || 'Bright, indirect sunlight. Avoid intense direct afternoon sun.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-darkText block mb-1">🌱 Soil & Drainage</span>
                <p className="text-muted leading-relaxed">
                  {plant.soil_type || 'Well-aerated potting mix containing peat, perlite, and pine bark.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-bold text-darkText block mb-1">🪴 Potting & Growth</span>
                <p className="text-muted leading-relaxed">
                  {plant.pot_type ? `Currently housed in ${plant.pot_type}.` : 'Ensure drainage holes are clear. Repot every 1-2 years.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Schedule Task */}
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card max-w-sm w-full bg-white p-6 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h4 className="font-bold text-darkText">Schedule Care</h4>
                <button onClick={() => setIsTaskModalOpen(false)}>
                  <X className="w-4 h-4 text-muted" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="label">Activity</label>
                  <select
                    value={taskActivity}
                    onChange={(e) => setTaskActivity(e.target.value as ActivityType)}
                    className="input"
                  >
                    <option value="watering">Watering 💧</option>
                    <option value="fertilizing">Fertilizing ✨</option>
                    <option value="misting">Misting ☁️</option>
                    <option value="pruning">Pruning ✂️</option>
                    <option value="repotting">Repotting 🪴</option>
                  </select>
                </div>

                <div>
                  <label className="label">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTaskModalOpen(false)}
                    className="btn-ghost btn flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary btn flex-1">
                    Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Journal Log */}
        {isJournalModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card max-w-sm w-full bg-white p-6 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h4 className="font-bold text-darkText">Record Growth</h4>
                <button onClick={() => setIsJournalModalOpen(false)}>
                  <X className="w-4 h-4 text-muted" />
                </button>
              </div>

              <form onSubmit={handleCreateJournal} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label">Height (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={journalHeight}
                      onChange={(e) => setJournalHeight(e.target.value)}
                      placeholder="e.g. 30"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Leaf Count</label>
                    <input
                      type="number"
                      value={journalLeaves}
                      onChange={(e) => setJournalLeaves(e.target.value)}
                      placeholder="e.g. 12"
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Milestone Notes</label>
                  <textarea
                    rows={2}
                    value={journalNotes}
                    onChange={(e) => setJournalNotes(e.target.value)}
                    placeholder="e.g. New growth shoot observed"
                    className="input"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsJournalModalOpen(false)}
                    className="btn-ghost btn flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary btn flex-1">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Update Health */}
        {isHealthModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card max-w-sm w-full bg-white p-6 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h4 className="font-bold text-darkText">Update Health Status</h4>
                <button onClick={() => setIsHealthModalOpen(false)}>
                  <X className="w-4 h-4 text-muted" />
                </button>
              </div>

              <form onSubmit={handleUpdateHealth} className="space-y-3">
                <div>
                  <label className="label">Current Condition</label>
                  <select
                    value={healthStatus}
                    onChange={(e) => setHealthStatus(e.target.value as HealthStatus)}
                    className="input"
                  >
                    <option value="healthy">Healthy</option>
                    <option value="needs_attention">Needs Attention</option>
                    <option value="recovering">In Recovery</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="label">Observations / Remedies</label>
                  <textarea
                    rows={2}
                    value={healthObservations}
                    onChange={(e) => setHealthObservations(e.target.value)}
                    placeholder="e.g. Leaves perking up after moisture check."
                    className="input"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsHealthModalOpen(false)}
                    className="btn-ghost btn flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary btn flex-1">
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
