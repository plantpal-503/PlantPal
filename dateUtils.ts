import {
  addDays,
  addWeeks,
  addMonths,
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isFuture,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  differenceInHours,
  parseISO,
  isValid,
  formatDistanceToNow,
} from 'date-fns';
import type { RecurrenceType } from '@/types';

export {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isFuture,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  differenceInHours,
  parseISO,
  isValid,
  formatDistanceToNow,
  addDays,
  addWeeks,
  addMonths,
};

/**
 * Calculates the next due date for a recurring schedule.
 * Returns null for 'once' recurrence.
 */
export function calculateNextDueDate(
  currentDueDate: Date,
  recurrenceType: RecurrenceType,
  recurrenceInterval?: number | null
): Date | null {
  switch (recurrenceType) {
    case 'once':
      return null;
    case 'daily':
      return addDays(currentDueDate, 1);
    case 'every_2_days':
      return addDays(currentDueDate, 2);
    case 'every_3_days':
      return addDays(currentDueDate, 3);
    case 'weekly':
      return addWeeks(currentDueDate, 1);
    case 'every_2_weeks':
      return addWeeks(currentDueDate, 2);
    case 'monthly':
      return addMonths(currentDueDate, 1);
    case 'custom':
      if (!recurrenceInterval || recurrenceInterval < 1) {
        throw new Error('Custom recurrence requires a valid interval (>= 1 day)');
      }
      return addDays(currentDueDate, recurrenceInterval);
    default:
      return null;
  }
}

/**
 * Generates a stable occurrence key for a task to prevent duplicates.
 * Format: scheduleId_YYYY-MM-DD
 */
export function generateOccurrenceKey(scheduleId: string, dueDate: Date): string {
  return `${scheduleId}_${format(dueDate, 'yyyy-MM-dd')}`;
}

/**
 * Returns a human-readable label for a date relative to today.
 */
export function getRelativeDateLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;

  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';

  const diffDays = differenceInDays(date, startOfDay(new Date()));

  if (diffDays > 0 && diffDays <= 7) {
    return format(date, 'EEEE'); // Day name
  }

  return format(date, 'MMM d, yyyy');
}

/**
 * Returns a human-readable due status.
 */
export function getDueStatus(dueAt: string): { label: string; isOverdue: boolean; isDueToday: boolean } {
  const date = parseISO(dueAt);
  if (!isValid(date)) return { label: 'Unknown', isOverdue: false, isDueToday: false };

  const now = new Date();

  if (isPast(date) && !isToday(date)) {
    const daysAgo = Math.abs(differenceInDays(date, now));
    return {
      label: daysAgo === 1 ? 'Due yesterday' : `${daysAgo} days overdue`,
      isOverdue: true,
      isDueToday: false,
    };
  }

  if (isToday(date)) {
    const hoursLeft = differenceInHours(date, now);
    if (hoursLeft < 0) {
      return { label: 'Due today (overdue)', isOverdue: true, isDueToday: true };
    }
    return { label: 'Due today', isOverdue: false, isDueToday: true };
  }

  return {
    label: getRelativeDateLabel(dueAt),
    isOverdue: false,
    isDueToday: false,
  };
}

/**
 * Format a date for display using the user's preferred format.
 */
export function formatDate(dateStr: string, dateFormat = 'MMM d, yyyy'): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, dateFormat);
}

/**
 * Format a time string for display.
 */
export function formatTime(timeStr: string, use24h = false): string {
  // timeStr is like "14:30:00" or "14:30"
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return format(date, use24h ? 'HH:mm' : 'h:mm a');
}

/**
 * Gets today's date string in ISO format (date only).
 */
export function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Gets the greeting based on time of day.
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Checks if a recurrence interval is valid.
 */
export function isValidRecurrenceInterval(interval: number): boolean {
  return Number.isInteger(interval) && interval >= 1 && interval <= 365;
}

/**
 * Returns the label for a recurrence type.
 */
export function getRecurrenceLabel(type: RecurrenceType, interval?: number | null): string {
  switch (type) {
    case 'once': return 'One time';
    case 'daily': return 'Every day';
    case 'every_2_days': return 'Every 2 days';
    case 'every_3_days': return 'Every 3 days';
    case 'weekly': return 'Every week';
    case 'every_2_weeks': return 'Every 2 weeks';
    case 'monthly': return 'Every month';
    case 'custom': return interval ? `Every ${interval} days` : 'Custom interval';
    default: return type;
  }
}

/**
 * Get start of 7-day window from today.
 */
export function getWeekRange(): { start: Date; end: Date } {
  const start = startOfDay(new Date());
  const end = endOfDay(addDays(start, 6));
  return { start, end };
}
