import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Heart,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ShieldAlert,
  HelpCircle,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { demoPlantsStore, demoHealthLogsStore } from '@/lib/demoStore';
import type { UserPlant, PlantHealthLog, HealthStatus } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from '@/lib/dateUtils';

const COMMON_SYMPTOMS = [
  'Yellowing leaves',
  'Brown tips / margins',
  'Drooping / wilting',
  'Leaf spots / patches',
  'Pests / spider mites',
  'Overwatered / soggy soil',
  'Under-watered / dry crisp',
  'Stunted growth',
  'Powdery mildew',
  'Root rot signs',
];

const DIAGNOSTICS_GUIDE = [
  {
    symptom: 'Yellowing Leaves',
    causes: 'Overwatering, poor soil drainage, or natural aging of lower leaves.',
    solution: 'Check soil moisture 2 inches down. Water only when dry. Ensure pot has drainage holes.',
    badge: 'Common',
  },
  {
    symptom: 'Crispy Brown Leaf Tips',
    causes: 'Low ambient humidity, fluoride in tap water, or underwatering.',
    solution: 'Use filtered or rainwater. Increase humidity with a pebble tray or room humidifier.',
    badge: 'Humidity',
  },
  {
    symptom: 'Drooping / Limp Stems',
    causes: 'Severe underwatering or root rot caused by stagnant water.',
    solution: 'Inspect roots: if white and firm, give a deep drink; if dark and mushy, repot in fresh dry soil.',
    badge: 'Moisture',
  },
  {
    symptom: 'Fine Webbing or Tiny Bugs',
    causes: 'Spider mites or fungus gnats attracted to overly damp conditions.',
    solution: 'Isolate plant immediately. Spray foliage thoroughly with diluted neem oil or insecticidal soap.',
    badge: 'Pests',
  },
];

export default function HealthPage() {
  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [logs, setLogs] = useState<PlantHealthLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [newStatus, setNewStatus] = useState<HealthStatus>('needs_attention');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [observations, setObservations] = useState('');

  const loadData = useCallback(() => {
    setPlants(demoPlantsStore.getAll());
    setLogs(demoHealthLogsStore.getAll());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const healthy = plants.filter((p) => p.health_status === 'healthy').length;
    const attention = plants.filter((p) => p.health_status === 'needs_attention').length;
    const recovering = plants.filter((p) => p.health_status === 'recovering').length;
    const critical = plants.filter((p) => p.health_status === 'critical').length;
    return { healthy, attention, recovering, critical };
  }, [plants]);

  const plantsNeedingCare = useMemo(() => {
    return plants.filter(
      (p) => p.health_status === 'needs_attention' || p.health_status === 'critical'
    );
  }, [plants]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleOpenModal = (plantId?: string) => {
    if (plantId) {
      setSelectedPlantId(plantId);
      const target = plants.find((p) => p.id === plantId);
      if (target) setNewStatus(target.health_status);
    } else if (plants.length > 0) {
      setSelectedPlantId(plants[0].id);
      setNewStatus('healthy');
    }
    setSelectedSymptoms([]);
    setObservations('');
    setIsModalOpen(true);
  };

  const handleQuickRecover = (plantId: string) => {
    demoPlantsStore.update(plantId, { health_status: 'healthy' });
    demoHealthLogsStore.create({
      plant_id: plantId,
      health_status: 'healthy',
      symptoms: ['Recovered'],
      observations: 'Plant has restored full vigor and healthy leaf color.',
      image_urls: [],
    });
    toast.success('Plant marked as fully healthy! 🌿');
    loadData();
  };

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlantId) {
      toast.error('Please select a plant');
      return;
    }

    demoHealthLogsStore.create({
      plant_id: selectedPlantId,
      health_status: newStatus,
      symptoms: selectedSymptoms,
      observations: observations.trim() || null,
      image_urls: [],
    });

    demoPlantsStore.update(selectedPlantId, {
      health_status: newStatus,
    });

    toast.success('Health observation logged! 📋');
    setIsModalOpen(false);
    loadData();
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-darkText flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary" />
              Plant Health Tracker
            </h1>
            <p className="text-muted text-sm mt-1">
              Log wellness checks, identify leaf symptoms, and monitor healing progress.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary btn-sm text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Log Health Check
            </button>
          </div>
        </div>

        {/* Health Status Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase">
              <span>Healthy</span>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-darkText mt-2">{stats.healthy}</p>
            <p className="text-xs text-muted mt-1">Thriving normally</p>
          </div>

          <div className="card p-5 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase">
              <span>Needs Attention</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-darkText mt-2">{stats.attention}</p>
            <p className="text-xs text-muted mt-1">Mild issues spotted</p>
          </div>

          <div className="card p-5 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase">
              <span>In Recovery</span>
              <Sparkles className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-darkText mt-2">{stats.recovering}</p>
            <p className="text-xs text-muted mt-1">Healing after care</p>
          </div>

          <div className="card p-5 border-l-4 border-l-rose-500">
            <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase">
              <span>Critical</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-3xl font-bold text-darkText mt-2">{stats.critical}</p>
            <p className="text-xs text-muted mt-1">Urgent care needed</p>
          </div>
        </div>

        {/* Attention Banner if any plants are struggling */}
        {plantsNeedingCare.length > 0 && (
          <div className="card p-5 bg-amber-50/70 border border-amber-200 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <h3 className="font-bold text-amber-900 text-sm">
                {plantsNeedingCare.length} {plantsNeedingCare.length === 1 ? 'Plant' : 'Plants'} Require Attention
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {plantsNeedingCare.map((plant) => (
                <div
                  key={plant.id}
                  className="p-3.5 bg-white rounded-xl border border-amber-200/80 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-lg shrink-0">
                      {plant.image_url ? (
                        <img
                          src={plant.image_url}
                          alt={plant.plant_name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      ) : (
                        '🌿'
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-darkText truncate">
                        {plant.plant_name}
                      </h4>
                      <span className="badge badge-yellow text-[10px] mt-0.5 capitalize">
                        {plant.health_status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleQuickRecover(plant.id)}
                      className="btn-ghost btn-sm text-[11px] text-green-700 hover:bg-green-50 px-2"
                      title="Mark healthy"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(plant.id)}
                      className="btn-primary btn-sm text-[11px] px-2.5"
                    >
                      Diagnose
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagnostics & Recent Logs Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Health Log History */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-darkText">Recent Health Observations</h2>
              <span className="text-xs text-muted">{logs.length} logs recorded</span>
            </div>

            {logs.length === 0 ? (
              <div className="card p-10 text-center">
                <div className="text-4xl mb-3">🩺</div>
                <h3 className="text-base font-bold text-darkText">No Health Logs Yet</h3>
                <p className="text-muted text-xs mt-1 max-w-sm mx-auto">
                  Log your first health inspection to build a medical history for your plant collection.
                </p>
                <button
                  onClick={() => handleOpenModal()}
                  className="btn-primary btn-sm mt-4 text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Log First Check
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => {
                  const plant = plants.find((p) => p.id === log.plant_id);
                  const statusColors: Record<HealthStatus, string> = {
                    healthy: 'badge-green',
                    needs_attention: 'badge-yellow',
                    recovering: 'badge-blue',
                    critical: 'badge-red',
                  };

                  return (
                    <div key={log.id} className="card p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">🪴</span>
                          <div>
                            <Link
                              to={`/plants/${log.plant_id}`}
                              className="text-sm font-bold text-darkText hover:text-primary transition-colors"
                            >
                              {plant?.plant_name || 'Plant'}
                            </Link>
                            <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(parseISO(log.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>

                        <span
                          className={cn(
                            'badge text-[11px] capitalize',
                            statusColors[log.health_status] || 'badge-gray'
                          )}
                        >
                          {log.health_status.replace('_', ' ')}
                        </span>
                      </div>

                      {log.symptoms?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {log.symptoms.map((symptom, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-muted font-medium"
                            >
                              {symptom}
                            </span>
                          ))}
                        </div>
                      )}

                      {log.observations && (
                        <p className="text-xs text-darkText/80 bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-relaxed">
                          "{log.observations}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Plant Doctor Guide Column */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-darkText flex items-center gap-1.5">
              <HelpCircle className="w-5 h-5 text-primary" />
              Plant Doctor Quick Guide
            </h2>

            <div className="space-y-3">
              {DIAGNOSTICS_GUIDE.map((guide, idx) => (
                <div key={idx} className="card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-darkText">{guide.symptom}</h4>
                    <span className="badge badge-gray text-[10px] font-semibold">{guide.badge}</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    <strong className="text-darkText font-medium">Causes: </strong>
                    {guide.causes}
                  </p>
                  <p className="text-xs text-primary leading-relaxed bg-mint/40 p-2 rounded-lg">
                    <strong className="font-medium">Action: </strong>
                    {guide.solution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Log Health Check Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card max-w-lg w-full bg-white p-6 shadow-2xl animate-fade-in my-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="font-bold text-darkText text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Log Health Check
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
                    Please add a plant to your garden first.
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
                <form onSubmit={handleSubmitLog} className="space-y-4">
                  <div>
                    <label className="label">Plant</label>
                    <select
                      value={selectedPlantId}
                      onChange={(e) => setSelectedPlantId(e.target.value)}
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
                    <label className="label">Observed Health Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'healthy', label: 'Healthy', badge: 'badge-green' },
                        { id: 'needs_attention', label: 'Needs Care', badge: 'badge-yellow' },
                        { id: 'recovering', label: 'Recovering', badge: 'badge-blue' },
                        { id: 'critical', label: 'Critical', badge: 'badge-red' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setNewStatus(item.id as HealthStatus)}
                          className={cn(
                            'p-2.5 rounded-xl border text-xs font-semibold text-center transition-all',
                            newStatus === item.id
                              ? 'border-primary bg-mint text-primary ring-1 ring-primary'
                              : 'border-gray-200 text-muted hover:bg-gray-50'
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Observed Symptoms</label>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_SYMPTOMS.map((symptom) => {
                        const isSelected = selectedSymptoms.includes(symptom);
                        return (
                          <button
                            key={symptom}
                            type="button"
                            onClick={() => toggleSymptom(symptom)}
                            className={cn(
                              'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                              isSelected
                                ? 'bg-primary text-white border-primary'
                                : 'bg-gray-50 text-muted border-gray-200 hover:bg-gray-100'
                            )}
                          >
                            {symptom}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="label">Diagnosis Notes & Action Taken</label>
                    <textarea
                      rows={3}
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="e.g. Cleared away fallen leaves, dusted foliage with moist cloth, moved away from draft."
                      className="input"
                    />
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
                      Save Record
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
