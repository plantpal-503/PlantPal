import {
  Droplets,
  Sparkles,
  Scissors,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type { CareTask, UserPlant, ActivityType } from '@/types';
import { getDueStatus } from '@/lib/dateUtils';
import { cn } from '@/lib/cn';
import { Link } from 'react-router-dom';

interface TaskCardProps {
  task: CareTask;
  plant?: UserPlant | null;
  onComplete?: (taskId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

const activityConfig: Record<ActivityType, { icon: typeof Droplets; label: string; bg: string; text: string }> = {
  watering: { icon: Droplets, label: 'Watering', bg: 'bg-blue-50', text: 'text-blue-600' },
  fertilizing: { icon: Sparkles, label: 'Fertilizing', bg: 'bg-amber-50', text: 'text-amber-600' },
  misting: { icon: Droplets, label: 'Misting', bg: 'bg-cyan-50', text: 'text-cyan-600' },
  pruning: { icon: Scissors, label: 'Pruning', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  repotting: { icon: RefreshCw, label: 'Repotting', bg: 'bg-purple-50', text: 'text-purple-600' },
  leaf_cleaning: { icon: Sparkles, label: 'Leaf Cleaning', bg: 'bg-teal-50', text: 'text-teal-600' },
  soil_check: { icon: Eye, label: 'Soil Check', bg: 'bg-orange-50', text: 'text-orange-600' },
  pest_inspection: { icon: AlertCircle, label: 'Pest Inspection', bg: 'bg-rose-50', text: 'text-rose-600' },
  health_check: { icon: Eye, label: 'Health Check', bg: 'bg-lime-50', text: 'text-lime-700' },
  custom: { icon: HelpCircle, label: 'Care Task', bg: 'bg-gray-100', text: 'text-gray-700' },
};

export default function TaskCard({ task, plant, onComplete, className }: TaskCardProps) {
  const { label, isOverdue, isDueToday } = getDueStatus(task.due_at);
  const config = activityConfig[task.activity_type] || activityConfig.custom;
  const ActivityIcon = config.icon;

  const isCompleted = task.status === 'completed';

  return (
    <div
      className={cn(
        'card p-4 transition-all duration-200 flex items-center justify-between gap-4',
        isCompleted && 'opacity-60 bg-gray-50/80',
        className
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Activity Icon */}
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform',
            config.bg,
            config.text
          )}
        >
          <ActivityIcon className="w-5 h-5" />
        </div>

        {/* Task Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={cn(
                'text-sm font-semibold text-darkText truncate',
                isCompleted && 'line-through text-muted'
              )}
            >
              {task.title}
            </h4>

            {isCompleted ? (
              <span className="badge badge-green text-[11px]">
                <Check className="w-3 h-3" /> Done
              </span>
            ) : isOverdue ? (
              <span className="badge badge-red text-[11px]">
                <AlertCircle className="w-3 h-3" /> {label}
              </span>
            ) : isDueToday ? (
              <span className="badge badge-yellow text-[11px]">
                <Clock className="w-3 h-3" /> {label}
              </span>
            ) : (
              <span className="badge badge-gray text-[11px]">
                <Clock className="w-3 h-3" /> {label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-muted">
            {plant ? (
              <Link
                to={`/plants/${plant.id}`}
                className="hover:text-primary hover:underline font-medium text-darkText/80 truncate"
              >
                🌱 {plant.plant_name}
              </Link>
            ) : (
              <span>Plant Pal</span>
            )}

            {plant?.location && (
              <>
                <span>•</span>
                <span className="truncate">{plant.location}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="shrink-0 flex items-center gap-2">
        {!isCompleted && onComplete && (
          <button
            onClick={() => onComplete(task.id)}
            className="btn-primary btn-sm flex items-center gap-1.5 rounded-xl shadow-none hover:shadow-sm"
            title="Mark as done"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">Complete</span>
          </button>
        )}
      </div>
    </div>
  );
}

