import { Link } from 'react-router-dom';
import { Sprout, MapPin, Heart, ArrowRight } from 'lucide-react';
import type { UserPlant } from '@/types';
import { cn } from '@/lib/cn';

interface PlantCardProps {
  plant: UserPlant;
  className?: string;
}

export default function PlantCard({ plant, className }: PlantCardProps) {
  const healthBadge = {
    healthy: { label: 'Healthy', className: 'badge-green' },
    needs_attention: { label: 'Needs Care', className: 'badge-yellow' },
    recovering: { label: 'Recovering', className: 'badge-blue' },
    critical: { label: 'Critical', className: 'badge-red' },
  }[plant.health_status] || { label: 'Healthy', className: 'badge-green' };

  return (
    <Link
      to={`/plants/${plant.id}`}
      className={cn(
        'card group hover:shadow-card-hover transition-all duration-200 flex flex-col',
        className
      )}
    >
      {/* Plant Image / Header */}
      <div className="relative h-44 bg-primary-50 overflow-hidden">
        {plant.image_url ? (
          <img
            src={plant.image_url}
            alt={plant.plant_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-primary-400 bg-mint">
            <Sprout className="w-12 h-12 stroke-[1.5]" />
          </div>
        )}

        <div className="absolute top-3 right-3 flex gap-1.5">
          <span className={cn('badge text-xs shadow-sm font-medium', healthBadge.className)}>
            {healthBadge.label}
          </span>
        </div>

        {plant.category && (
          <div className="absolute bottom-3 left-3">
            <span className="badge bg-white/90 backdrop-blur-sm text-darkText text-[11px] font-medium shadow-sm capitalize">
              {plant.category}
            </span>
          </div>
        )}
      </div>

      {/* Plant Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-darkText group-hover:text-primary transition-colors line-clamp-1">
              {plant.plant_name}
            </h3>
            <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 shrink-0 mt-0.5" />
          </div>

          {plant.species?.scientific_name && (
            <p className="text-xs text-muted italic line-clamp-1 mt-0.5">
              {plant.species.scientific_name}
            </p>
          )}

          {plant.location && (
            <p className="text-xs text-muted flex items-center gap-1 mt-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{plant.location}</span>
            </p>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs text-muted">
          <span className="flex items-center gap-1 capitalize">
            {plant.is_indoor ? '🏡 Indoor' : '🌳 Outdoor'}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-primary" />
            <span>Care active</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

