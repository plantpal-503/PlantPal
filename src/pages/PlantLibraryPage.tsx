import { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Plus,
  Check,
  Droplets,
  Sun,
  Thermometer,
  ShieldAlert,
  Sparkles,
  Info,
  X,
  Wind,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { PLANT_SPECIES_DATA } from '@/lib/plantSpeciesData';
import { demoPlantsStore, demoSchedulesStore } from '@/lib/demoStore';
import type { PlantSpecies, PlantCategory, DifficultyLevel } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

const categories: { label: string; value: PlantCategory | 'all' }[] = [
  { label: 'All Plants', value: 'all' },
  { label: 'Foliage', value: 'foliage' },
  { label: 'Succulents', value: 'succulents' },
  { label: 'Flowering', value: 'flowering' },
  { label: 'Herbs', value: 'herbs' },
  { label: 'Ferns', value: 'ferns' },
  { label: 'Climbers', value: 'climbers' },
];

const difficultyLevels: { label: string; value: DifficultyLevel | 'all' }[] = [
  { label: 'All Difficulties', value: 'all' },
  { label: 'Easy Care', value: 'easy' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Demanding', value: 'hard' },
];

export default function PlantLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlantCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<PlantSpecies | null>(null);
  const [addedSpeciesIds, setAddedSpeciesIds] = useState<Set<string>>(() => {
    const existing = demoPlantsStore.getAll();
    return new Set(existing.map((p) => p.species_id).filter(Boolean) as string[]);
  });

  const filteredSpecies = useMemo(() => {
    return PLANT_SPECIES_DATA.filter((species) => {
      const matchesSearch =
        species.common_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (species.scientific_name &&
          species.scientific_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        species.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || species.category === selectedCategory;

      const matchesDifficulty =
        selectedDifficulty === 'all' || species.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const handleAddToGarden = (species: PlantSpecies) => {
    // Add plant to demoPlantsStore
    const newPlant = demoPlantsStore.create({
      species_id: species.id,
      plant_name: species.common_name,
      image_url: species.image_url,
      location: 'Living Room',
      is_indoor: true,
      acquired_at: new Date().toISOString(),
      planted_at: new Date().toISOString(),
      light_conditions: species.care_info.light,
      soil_type: species.care_info.soil,
      watering_notes: species.care_info.watering,
      health_status: 'healthy',
      notes: species.description,
      pot_type: 'Ceramic Pot',
      category: species.category,
      species: species,
    });

    // Create initial watering schedule (every 7 days)
    demoSchedulesStore.create({
      plant_id: newPlant.id,
      activity_type: 'watering',
      title: `Water ${species.common_name}`,
      instructions: species.care_info.watering,
      start_date: new Date().toISOString(),
      due_time: '09:00',
      recurrence_type: 'weekly',
      recurrence_interval: 1,
      next_due_at: new Date().toISOString(),
      end_date: null,
      is_active: true,
      notify_before_hours: 2,
    });

    setAddedSpeciesIds((prev) => new Set([...prev, species.id]));
    toast.success(`${species.common_name} added to your garden! 🌿`, {
      description: 'Default watering schedule has been scheduled.',
    });
  };

  const getDifficultyBadge = (level: DifficultyLevel) => {
    switch (level) {
      case 'easy':
        return <span className="badge badge-green">Easy Care</span>;
      case 'moderate':
        return <span className="badge badge-yellow">Moderate</span>;
      case 'hard':
        return <span className="badge badge-red">Challenging</span>;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-darkText flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              Plant Library
            </h1>
            <p className="text-muted text-sm mt-1">
              Explore plant care encyclopedia and discover species for your indoor or outdoor oasis.
            </p>
          </div>
          <div className="text-xs bg-mint/60 border border-primary-100 text-primary-800 px-3.5 py-2 rounded-xl font-medium shrink-0 self-start md:self-auto">
            Showing {filteredSpecies.length} of {PLANT_SPECIES_DATA.length} species
          </div>
        </div>

        {/* Search & Filters */}
        <div className="card p-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by common or botanical name, care keywords..."
              className="input pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-darkText"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-gray-100">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                    selectedCategory === cat.value
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-muted hover:bg-gray-200 hover:text-darkText'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | 'all')}
              className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-darkText focus:outline-none focus:ring-2 focus:ring-primary-300 shrink-0"
            >
              {difficultyLevels.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Species Grid */}
        {filteredSpecies.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-darkText">No plants matched your search</h3>
            <p className="text-muted text-sm mt-1 max-w-sm mx-auto">
              Try adjusting your search keywords or switching filters back to all categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
              className="btn-outline btn-sm mt-4 inline-flex items-center gap-1.5"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSpecies.map((species) => {
              const isAdded = addedSpeciesIds.has(species.id);

              return (
                <div
                  key={species.id}
                  className="card group hover:shadow-card-hover transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image & Badges */}
                    <div className="relative h-48 bg-primary-50 overflow-hidden">
                      {species.image_url ? (
                        <img
                          src={species.image_url}
                          alt={species.common_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-mint">
                          🌿
                        </div>
                      )}

                      <div className="absolute top-3 right-3 flex gap-1">
                        {getDifficultyBadge(species.difficulty)}
                      </div>

                      <div className="absolute bottom-3 left-3">
                        <span className="badge bg-white/90 backdrop-blur-sm text-darkText text-[11px] font-medium shadow-sm capitalize">
                          {species.category}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-2.5">
                      <div>
                        <h3 className="font-bold text-darkText text-base group-hover:text-primary transition-colors line-clamp-1">
                          {species.common_name}
                        </h3>
                        {species.scientific_name && (
                          <p className="text-xs text-muted italic line-clamp-1">
                            {species.scientific_name}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                        {species.description}
                      </p>

                      {/* Care highlights */}
                      <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-muted">
                        <div className="flex items-center gap-1.5 truncate">
                          <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate">Regular check</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">Indirect light</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 flex gap-2">
                    <button
                      onClick={() => setSelectedSpecies(species)}
                      className="btn-outline btn-sm flex-1 text-xs"
                    >
                      <Info className="w-3.5 h-3.5" />
                      Care Guide
                    </button>
                    <button
                      onClick={() => handleAddToGarden(species)}
                      className={cn(
                        'btn btn-sm text-xs flex items-center justify-center gap-1.5',
                        isAdded
                          ? 'bg-mint text-primary hover:bg-mint/80'
                          : 'btn-primary'
                      )}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Care Guide Modal */}
        {selectedSpecies && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="card max-w-2xl w-full max-h-[90vh] flex flex-col bg-white overflow-hidden shadow-2xl animate-fade-in my-auto">
              {/* Modal Header */}
              <div className="relative h-56 bg-primary-100 shrink-0">
                {selectedSpecies.image_url ? (
                  <img
                    src={selectedSpecies.image_url}
                    alt={selectedSpecies.common_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🌿</div>
                )}
                <button
                  onClick={() => setSelectedSpecies(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-1">
                    {selectedSpecies.category}
                  </div>
                  <h2 className="text-2xl font-bold drop-shadow-md">
                    {selectedSpecies.common_name}
                  </h2>
                  {selectedSpecies.scientific_name && (
                    <p className="text-xs opacity-90 italic drop-shadow-md">
                      {selectedSpecies.scientific_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                <div>
                  <h3 className="text-sm font-bold text-darkText uppercase tracking-wider text-muted mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-darkText leading-relaxed">
                    {selectedSpecies.description}
                  </p>
                </div>

                {/* Detailed Requirements Grid */}
                <div>
                  <h3 className="text-sm font-bold text-darkText uppercase tracking-wider text-muted mb-3">
                    Care Requirements
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-darkText">Light Conditions</h4>
                        <p className="text-xs text-muted mt-0.5">
                          {selectedSpecies.care_info.light}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-darkText">Watering Schedule</h4>
                        <p className="text-xs text-muted mt-0.5">
                          {selectedSpecies.care_info.watering}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                        <Wind className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-darkText">Humidity</h4>
                        <p className="text-xs text-muted mt-0.5">
                          {selectedSpecies.care_info.humidity}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Thermometer className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-darkText">Temperature</h4>
                        <p className="text-xs text-muted mt-0.5">
                          {selectedSpecies.care_info.temperature}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Common Problems & Tips */}
                {selectedSpecies.care_info.common_problems?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-darkText uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      Common Issues & Solutions
                    </h3>
                    <ul className="space-y-1.5 list-disc list-inside text-xs text-muted bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                      {selectedSpecies.care_info.common_problems.map((prob, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {prob}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedSpecies.care_info.care_tips?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-darkText uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Pro Tips
                    </h3>
                    <ul className="space-y-1.5 list-disc list-inside text-xs text-muted bg-mint/40 p-4 rounded-xl border border-primary-100">
                      {selectedSpecies.care_info.care_tips.map((tip, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedSpecies(null)}
                  className="btn-ghost btn-sm text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAddToGarden(selectedSpecies);
                    setSelectedSpecies(null);
                  }}
                  className="btn-primary btn-sm text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add to My Garden
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

