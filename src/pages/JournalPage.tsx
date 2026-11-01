import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BookMarked,
  Plus,
  Trash2,
  Calendar,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { demoPlantsStore, demoJournalStore } from '@/lib/demoStore';
import type { UserPlant, GrowthJournalEntry } from '@/types';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';

export default function JournalPage() {
  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [entries, setEntries] = useState<GrowthJournalEntry[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formPlantId, setFormPlantId] = useState('');
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [heightValue, setHeightValue] = useState<string>('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'inches'>('cm');
  const [leafCount, setLeafCount] = useState<string>('');
  const [notes, setNotes] = useState('');

  const loadData = useCallback(() => {
    setPlants(demoPlantsStore.getAll());
    setEntries(demoJournalStore.getAll());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredEntries = useMemo(() => {
    let list = [...entries];
    if (selectedPlantId !== 'all') {
      list = list.filter((e) => e.plant_id === selectedPlantId);
    }
    return list.sort(
      (a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    );
  }, [entries, selectedPlantId]);

  const handleOpenModal = () => {
    if (plants.length > 0) {
      setFormPlantId(plants[0].id);
    }
    setEntryDate(new Date().toISOString().split('T')[0]);
    setHeightValue('');
    setLeafCount('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlantId) {
      toast.error('Please select a plant');
      return;
    }

    demoJournalStore.create({
      plant_id: formPlantId,
      entry_date: entryDate,
      height_value: heightValue ? parseFloat(heightValue) : null,
      height_unit: heightValue ? heightUnit : null,
      leaf_count: leafCount ? parseInt(leafCount, 10) : null,
      notes: notes.trim() || null,
      image_urls: [],
    });

    toast.success('Journal entry recorded! 🌱');
    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteEntry = (id: string) => {
    demoJournalStore.delete(id);
    toast.success('Entry removed');
    loadData();
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = parseISO(dateStr);
      if (isValid(d)) {
        return format(d, 'MMM d, yyyy');
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-darkText flex items-center gap-2">
              <BookMarked className="w-8 h-8 text-primary" />
              Growth Journal
            </h1>
            <p className="text-muted text-sm mt-1">
              Document new leaves, measure height gains, and reflect on your garden's evolution.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleOpenModal}
              className="btn-primary btn-sm text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              New Entry
            </button>
          </div>
        </div>

        {/* Highlight Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="card p-4">
            <span className="text-xs text-muted font-medium">Total Entries</span>
            <p className="text-2xl font-bold text-darkText mt-1">{entries.length}</p>
          </div>

          <div className="card p-4">
            <span className="text-xs text-muted font-medium">Tracked Plants</span>
            <p className="text-2xl font-bold text-darkText mt-1">
              {new Set(entries.map((e) => e.plant_id)).size}
            </p>
          </div>

          <div className="card p-4 col-span-2 sm:col-span-1">
            <span className="text-xs text-muted font-medium">Latest Check-in</span>
            <p className="text-lg font-bold text-darkText mt-1 truncate">
              {entries.length > 0 ? formatDateDisplay(entries[0].entry_date) : 'No entries yet'}
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted" />
            <span className="text-xs font-semibold text-darkText">Filter by Plant:</span>
            <select
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-darkText focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              <option value="all">All Plants ({plants.length})</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.plant_name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-muted">
            Showing {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* Journal Entries Timeline */}
        {filteredEntries.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-3">🌱</div>
            <h3 className="text-lg font-bold text-darkText">Your Growth Journal is Empty</h3>
            <p className="text-muted text-sm mt-1 max-w-sm mx-auto">
              Start writing journal logs to record new shoots, growth measurements, and plant photos over time.
            </p>
            <button
              onClick={handleOpenModal}
              className="btn-primary btn-sm mt-4 text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => {
              const plant = plants.find((p) => p.id === entry.plant_id);

              return (
                <div
                  key={entry.id}
                  className="card p-5 hover:shadow-card-hover transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-mint flex items-center justify-center text-xl shrink-0">
                        {plant?.image_url ? (
                          <img
                            src={plant.image_url}
                            alt={plant.plant_name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        ) : (
                          '🌿'
                        )}
                      </div>
                      <div>
                        <Link
                          to={`/plants/${entry.plant_id}`}
                          className="font-bold text-darkText hover:text-primary transition-colors text-base"
                        >
                          {plant?.plant_name || 'Plant'}
                        </Link>
                        <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-muted" />
                          {formatDateDisplay(entry.entry_date)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-gray-400 hover:text-error transition-colors p-1"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Growth Metrics Pills */}
                  {(entry.height_value != null || entry.leaf_count != null) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {entry.height_value != null && (
                        <span className="badge badge-green text-xs font-semibold py-1 px-3">
                          📏 Height: {entry.height_value} {entry.height_unit || 'cm'}
                        </span>
                      )}
                      {entry.leaf_count != null && (
                        <span className="badge badge-blue text-xs font-semibold py-1 px-3">
                          🍃 Leaf Count: {entry.leaf_count} leaves
                        </span>
                      )}
                    </div>
                  )}

                  {/* Notes text */}
                  {entry.notes && (
                    <p className="text-sm text-darkText/85 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 leading-relaxed">
                      {entry.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* New Entry Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card max-w-lg w-full bg-white p-6 shadow-2xl animate-fade-in my-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="font-bold text-darkText text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  New Growth Log
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
                    Please add a plant to your garden first before creating journal logs.
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
                <form onSubmit={handleCreateEntry} className="space-y-4">
                  <div>
                    <label className="label">Plant</label>
                    <select
                      value={formPlantId}
                      onChange={(e) => setFormPlantId(e.target.value)}
                      className="input"
                      required
                    >
                      {plants.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.plant_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Observation Date</label>
                    <input
                      type="date"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      className="input"
                      required
                    >
                    </input>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Height</label>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={heightValue}
                          onChange={(e) => setHeightValue(e.target.value)}
                          placeholder="e.g. 24"
                          className="input flex-1"
                        />
                        <select
                          value={heightUnit}
                          onChange={(e) => setHeightUnit(e.target.value as 'cm' | 'inches')}
                          className="text-xs border border-gray-200 rounded-xl px-2 bg-white"
                        >
                          <option value="cm">cm</option>
                          <option value="inches">in</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="label">Total Leaves</label>
                      <input
                        type="number"
                        min="0"
                        value={leafCount}
                        onChange={(e) => setLeafCount(e.target.value)}
                        placeholder="e.g. 14"
                        className="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Growth Notes & Observations</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Unfurled a new leaf today, looking very vibrant! Soil is drying nicely."
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
                      Save Entry
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
