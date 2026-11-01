import { useState, useMemo, useCallback } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Droplets,
  Sparkles,
  Scissors,
  Check,
  Clock,
  Layers,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  isToday,
} from 'date-fns';
import { demoTasksStore, demoPlantsStore } from '@/lib/demoStore';
import type { CareTask, UserPlant } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import { Link } from 'react-router-dom';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<CareTask[]>(() => demoTasksStore.getAll());
  const [plants, setPlants] = useState<UserPlant[]>(() => demoPlantsStore.getAll());

  const refreshData = useCallback(() => {
    setTasks(demoTasksStore.getAll());
    setPlants(demoPlantsStore.getAll());
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleCompleteTask = (taskId: string) => {
    demoTasksStore.complete(taskId);
    toast.success('Task marked as done! 🌿');
    refreshData();
  };

  // Days in calendar view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Map tasks by date string (yyyy-MM-dd)
  const tasksByDate = useMemo(() => {
    const map = new Map<string, CareTask[]>();
    tasks.forEach((t) => {
      const dateKey = t.due_at.split('T')[0];
      const list = map.get(dateKey) || [];
      list.push(t);
      map.set(dateKey, list);
    });
    return map;
  }, [tasks]);

  // Tasks for selected date
  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayTasks = tasksByDate.get(selectedDateKey) || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'watering':
        return <Droplets className="w-3.5 h-3.5 text-blue-500" />;
      case 'fertilizing':
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      case 'pruning':
        return <Scissors className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-darkText flex items-center gap-2">
              <CalendarDays className="w-8 h-8 text-primary" />
              Care Calendar
            </h1>
            <p className="text-muted text-sm mt-1">
              Track watering schedules and plant care routines across the month.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleToday}
              className="btn-outline btn-sm text-xs font-semibold"
            >
              Today
            </button>
            <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-xs">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 text-muted hover:text-darkText transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold text-darkText min-w-[130px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 text-muted hover:text-darkText transition-colors"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Link to="/tasks" className="btn-primary btn-sm text-xs flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Schedule
            </Link>
          </div>
        </div>

        {/* Layout Grid: Calendar on Left, Selected Day Details on Right */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Card */}
          <div className="lg:col-span-2 card p-4 sm:p-6 space-y-4">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-xs font-bold text-muted py-2 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarDays.map((day, idx) => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const dayTasks = tasksByDate.get(dayKey) || [];
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isDayToday = isToday(day);

                const pendingTasks = dayTasks.filter((t) => t.status === 'pending');
                const completedTasks = dayTasks.filter((t) => t.status === 'completed');

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'min-h-[72px] sm:min-h-[88px] p-1.5 sm:p-2 rounded-xl text-left border flex flex-col justify-between transition-all group relative',
                      !isCurrentMonth && 'opacity-35 bg-gray-50/50',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-mint/30 shadow-sm'
                        : 'border-gray-100 bg-white hover:border-primary-200 hover:bg-gray-50/70',
                      isDayToday && !isSelected && 'border-primary-300 font-bold'
                    )}
                  >
                    {/* Date Number */}
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center',
                          isDayToday
                            ? 'bg-primary text-white font-bold'
                            : isSelected
                            ? 'text-primary font-bold'
                            : 'text-darkText'
                        )}
                      >
                        {format(day, 'd')}
                      </span>
                    </div>

                    {/* Task Indicators */}
                    <div className="space-y-1 w-full overflow-hidden">
                      {pendingTasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className="text-[10px] truncate px-1.5 py-0.5 rounded bg-mint text-primary font-medium flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}
                      {pendingTasks.length > 2 && (
                        <span className="text-[9px] text-muted font-medium pl-1">
                          +{pendingTasks.length - 2} more
                        </span>
                      )}
                      {completedTasks.length > 0 && pendingTasks.length === 0 && (
                        <div className="text-[10px] text-muted flex items-center gap-1 pl-1">
                          <Check className="w-2.5 h-2.5 text-primary" />
                          <span>{completedTasks.length} done</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details Card */}
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted uppercase font-bold tracking-wider">
                    Selected Day
                  </span>
                  <h3 className="text-lg font-bold text-darkText mt-0.5">
                    {format(selectedDate, 'EEEE, MMM d, yyyy')}
                  </h3>
                </div>
                {isToday(selectedDate) && (
                  <span className="badge badge-green text-xs font-semibold">Today</span>
                )}
              </div>

              {selectedDayTasks.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto text-xl mb-3 text-muted">
                    🌱
                  </div>
                  <h4 className="text-sm font-semibold text-darkText">No tasks scheduled</h4>
                  <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                    Nothing is due on this day. Your plants can enjoy their rest!
                  </p>
                  <Link to="/tasks" className="btn-outline btn-sm text-xs mt-4 inline-flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Schedule a Task
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayTasks.map((task) => {
                    const plant = plants.find((p) => p.id === task.plant_id);
                    const isCompleted = task.status === 'completed';

                    return (
                      <div
                        key={task.id}
                        className={cn(
                          'p-3.5 rounded-xl border border-gray-100 transition-all flex items-center justify-between gap-3',
                          isCompleted ? 'bg-gray-50/70 opacity-60' : 'bg-white hover:border-primary-200'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                            {getActivityIcon(task.activity_type)}
                          </div>
                          <div className="min-w-0">
                            <h4
                              className={cn(
                                'text-xs font-semibold text-darkText truncate',
                                isCompleted && 'line-through text-muted'
                              )}
                            >
                              {task.title}
                            </h4>
                            <p className="text-[11px] text-muted truncate mt-0.5">
                              🌱 {plant?.plant_name || 'Plant'} {task.due_at.split('T')[1]?.slice(0, 5) ? `• ${task.due_at.split('T')[1].slice(0, 5)}` : ''}
                            </p>
                          </div>
                        </div>

                        {!isCompleted ? (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="btn-primary btn-sm text-xs p-2 shrink-0 rounded-lg"
                            title="Complete task"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="badge badge-green text-[10px] shrink-0">
                            <Check className="w-3 h-3" /> Done
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick care guide summary */}
            <div className="card p-4 bg-mint/30 border border-primary-100">
              <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5" /> Calendar Tip
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Consistent timing is key to healthy plant roots. Water early in the morning so excess moisture evaporates safely during daylight.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

