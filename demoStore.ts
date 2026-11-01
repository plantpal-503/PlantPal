/**
 * Demo Mode Data Store
 * 
 * This module provides a localStorage-backed data store for demo mode.
 * It is NOT a substitute for Supabase — it is clearly labeled as demo data.
 * When you configure Supabase credentials (VITE_APP_MODE=production),
 * this store is bypassed entirely.
 */

import type {
  Profile,
  UserPreferences,
  UserPlant,
  CareSchedule,
  CareTask,
  CareHistory,
  Notification,
  PlantHealthLog,
  GrowthJournalEntry,
} from '@/types';
import { format, addDays } from 'date-fns';
import { calculateNextDueDate, generateOccurrenceKey } from '@/lib/dateUtils';
import { PLANT_SPECIES_DATA } from './plantSpeciesData';

const STORAGE_KEYS = {
  PROFILE: 'plantpal_demo_profile',
  PREFERENCES: 'plantpal_demo_preferences',
  PLANTS: 'plantpal_demo_plants',
  SCHEDULES: 'plantpal_demo_schedules',
  TASKS: 'plantpal_demo_tasks',
  CARE_HISTORY: 'plantpal_demo_care_history',
  NOTIFICATIONS: 'plantpal_demo_notifications',
  HEALTH_LOGS: 'plantpal_demo_health_logs',
  JOURNAL_ENTRIES: 'plantpal_demo_journal_entries',
  AUTH: 'plantpal_demo_auth',
  ONBOARDING_DONE: 'plantpal_demo_onboarding',
};

export const DEMO_USER_ID = 'demo-user-001';

function load<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Demo store save failed:', err);
  }
}

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ============================================
// Auth
// ============================================
export interface DemoSession {
  user_id: string;
  email: string;
  full_name: string;
  logged_in: boolean;
}

export const demoAuth = {
  getSession(): DemoSession | null {
    return load<DemoSession | null>(STORAGE_KEYS.AUTH, null);
  },

  login(email: string, full_name: string): DemoSession {
    const session: DemoSession = { user_id: DEMO_USER_ID, email, full_name, logged_in: true };
    save(STORAGE_KEYS.AUTH, session);
    return session;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  },

  isOnboardingDone(): boolean {
    return load<boolean>(STORAGE_KEYS.ONBOARDING_DONE, false);
  },

  markOnboardingDone(): void {
    save(STORAGE_KEYS.ONBOARDING_DONE, true);
  },
};

// ============================================
// Profile
// ============================================
export const demoProfileStore = {
  get(): Profile | null {
    const session = demoAuth.getSession();
    if (!session) return null;
    return load<Profile | null>(STORAGE_KEYS.PROFILE, {
      id: DEMO_USER_ID,
      full_name: session.full_name,
      email: session.email,
      avatar_url: null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      created_at: now(),
      updated_at: now(),
    });
  },

  update(data: Partial<Profile>): Profile {
    const current = this.get() || {
      id: DEMO_USER_ID,
      full_name: null,
      email: null,
      avatar_url: null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      created_at: now(),
      updated_at: now(),
    };
    const updated = { ...current, ...data, updated_at: now() };
    save(STORAGE_KEYS.PROFILE, updated);
    return updated;
  },
};

// ============================================
// Preferences
// ============================================
export const demoPreferencesStore = {
  get(): UserPreferences {
    return load<UserPreferences>(STORAGE_KEYS.PREFERENCES, {
      id: generateId(),
      user_id: DEMO_USER_ID,
      garden_type: null,
      experience_level: null,
      theme: 'light',
      date_format: 'MMM d, yyyy',
      time_format: '12h',
      preferred_reminder_time: '08:00',
      notification_preferences: {
        in_app: true,
        browser: false,
        email: false,
        push: false,
        care_types: ['watering', 'fertilizing'],
        reminder_advance_hours: 2,
      },
      onboarding_completed: false,
      created_at: now(),
      updated_at: now(),
    });
  },

  update(data: Partial<UserPreferences>): UserPreferences {
    const current = this.get();
    const updated = { ...current, ...data, updated_at: now() };
    save(STORAGE_KEYS.PREFERENCES, updated);
    return updated;
  },
};

// ============================================
// Plants
// ============================================
export const demoPlantsStore = {
  getAll(): UserPlant[] {
    return load<UserPlant[]>(STORAGE_KEYS.PLANTS, []);
  },

  getById(id: string): UserPlant | null {
    return this.getAll().find((p) => p.id === id) || null;
  },

  create(data: Omit<UserPlant, 'id' | 'user_id' | 'created_at' | 'updated_at'>): UserPlant {
    const plant: UserPlant = {
      ...data,
      id: generateId(),
      user_id: DEMO_USER_ID,
      created_at: now(),
      updated_at: now(),
    };
    const plants = this.getAll();
    plants.push(plant);
    save(STORAGE_KEYS.PLANTS, plants);
    return plant;
  },

  update(id: string, data: Partial<UserPlant>): UserPlant | null {
    const plants = this.getAll();
    const index = plants.findIndex((p) => p.id === id);
    if (index === -1) return null;
    plants[index] = { ...plants[index], ...data, updated_at: now() };
    save(STORAGE_KEYS.PLANTS, plants);
    return plants[index];
  },

  delete(id: string): void {
    const plants = this.getAll().filter((p) => p.id !== id);
    save(STORAGE_KEYS.PLANTS, plants);
  },
};

// ============================================
// Care Schedules
// ============================================
export const demoSchedulesStore = {
  getAll(): CareSchedule[] {
    return load<CareSchedule[]>(STORAGE_KEYS.SCHEDULES, []);
  },

  getByPlantId(plantId: string): CareSchedule[] {
    return this.getAll().filter((s) => s.plant_id === plantId);
  },

  getById(id: string): CareSchedule | null {
    return this.getAll().find((s) => s.id === id) || null;
  },

  create(data: Omit<CareSchedule, 'id' | 'user_id' | 'created_at' | 'updated_at'>): CareSchedule {
    const schedule: CareSchedule = {
      ...data,
      id: generateId(),
      user_id: DEMO_USER_ID,
      created_at: now(),
      updated_at: now(),
    };
    const schedules = this.getAll();
    schedules.push(schedule);
    save(STORAGE_KEYS.SCHEDULES, schedules);
    // Generate the first task
    demoTasksStore.generateFromSchedule(schedule);
    return schedule;
  },

  update(id: string, data: Partial<CareSchedule>): CareSchedule | null {
    const schedules = this.getAll();
    const index = schedules.findIndex((s) => s.id === id);
    if (index === -1) return null;
    schedules[index] = { ...schedules[index], ...data, updated_at: now() };
    save(STORAGE_KEYS.SCHEDULES, schedules);
    return schedules[index];
  },

  delete(id: string): void {
    const schedules = this.getAll().filter((s) => s.id !== id);
    save(STORAGE_KEYS.SCHEDULES, schedules);
    // Also delete pending tasks for this schedule
    const tasks = demoTasksStore.getAll().filter(
      (t) => t.schedule_id !== id || t.status === 'completed'
    );
    save(STORAGE_KEYS.TASKS, tasks);
  },
};

// ============================================
// Care Tasks
// ============================================
export const demoTasksStore = {
  getAll(): CareTask[] {
    return load<CareTask[]>(STORAGE_KEYS.TASKS, []);
  },

  getByPlantId(plantId: string): CareTask[] {
    return this.getAll().filter((t) => t.plant_id === plantId);
  },

  getById(id: string): CareTask | null {
    return this.getAll().find((t) => t.id === id) || null;
  },

  getDueToday(): CareTask[] {
    const today = format(new Date(), 'yyyy-MM-dd');
    return this.getAll().filter((t) => {
      return t.due_at.startsWith(today) && t.status === 'pending';
    });
  },

  getOverdue(): CareTask[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.getAll().filter((t) => {
      return new Date(t.due_at) < today && t.status === 'pending';
    });
  },

  getUpcoming(days = 7): CareTask[] {
    const start = new Date();
    start.setHours(23, 59, 59, 999); // after today
    const end = addDays(new Date(), days);
    end.setHours(23, 59, 59, 999);
    return this.getAll().filter((t) => {
      const due = new Date(t.due_at);
      return due > start && due <= end && t.status === 'pending';
    });
  },

  create(data: Omit<CareTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>): CareTask {
    const task: CareTask = {
      ...data,
      id: generateId(),
      user_id: DEMO_USER_ID,
      created_at: now(),
      updated_at: now(),
    };
    const tasks = this.getAll();
    tasks.push(task);
    save(STORAGE_KEYS.TASKS, tasks);
    return task;
  },

  update(id: string, data: Partial<CareTask>): CareTask | null {
    const tasks = this.getAll();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...data, updated_at: now() };
    save(STORAGE_KEYS.TASKS, tasks);
    return tasks[index];
  },

  /**
   * Mark a task as complete. Records history and schedules next occurrence.
   */
  complete(id: string, notes?: string): CareTask | null {
    const task = this.getById(id);
    if (!task || task.status === 'completed') return null;

    const completedAt = now();
    const updated = this.update(id, {
      status: 'completed',
      completed_at: completedAt,
      notes: notes ?? task.notes,
    });

    // Record in care history
    demoCareHistoryStore.create({
      plant_id: task.plant_id,
      task_id: task.id,
      activity_type: task.activity_type,
      action: 'completed',
      completed_at: completedAt,
      notes: notes ?? null,
    });

    // If recurring, generate next task
    if (task.schedule_id) {
      const schedule = demoSchedulesStore.getById(task.schedule_id);
      if (schedule && schedule.is_active && schedule.recurrence_type !== 'once') {
        const dueDate = new Date(task.due_at);
        const nextDate = calculateNextDueDate(dueDate, schedule.recurrence_type, schedule.recurrence_interval);
        if (nextDate) {
          // Check end date
          if (!schedule.end_date || nextDate <= new Date(schedule.end_date)) {
            const nextDueAt = format(nextDate, "yyyy-MM-dd'T'HH:mm:ss");
            const occurrenceKey = generateOccurrenceKey(schedule.id, nextDate);
            const existing = this.getAll().find((t) => t.occurrence_key === occurrenceKey);
            if (!existing) {
              this.create({
                schedule_id: schedule.id,
                plant_id: task.plant_id,
                activity_type: task.activity_type,
                title: task.title,
                due_at: nextDueAt,
                status: 'pending',
                completed_at: null,
                skipped_at: null,
                skipped_reason: null,
                notes: null,
                occurrence_key: occurrenceKey,
              });
              // Update schedule's next_due_at
              demoSchedulesStore.update(schedule.id, { next_due_at: nextDueAt });
            }
          }
        }
      }
    }

    // Create in-app notification
    demoNotificationsStore.create({
      plant_id: task.plant_id,
      task_id: task.id,
      title: 'Task Completed ✓',
      message: `${task.title} has been marked as complete.`,
      notification_type: 'info',
      is_read: false,
      read_at: null,
    });

    return updated;
  },

  /**
   * Skip a task and record the reason.
   */
  skip(id: string, reason?: string): CareTask | null {
    const task = this.getById(id);
    if (!task) return null;

    const skippedAt = now();
    const updated = this.update(id, {
      status: 'skipped',
      skipped_at: skippedAt,
      skipped_reason: reason ?? null,
    });

    demoCareHistoryStore.create({
      plant_id: task.plant_id,
      task_id: task.id,
      activity_type: task.activity_type,
      action: 'skipped',
      completed_at: skippedAt,
      notes: reason ?? null,
    });

    // Generate next occurrence for recurring
    if (task.schedule_id) {
      const schedule = demoSchedulesStore.getById(task.schedule_id);
      if (schedule && schedule.is_active && schedule.recurrence_type !== 'once') {
        const dueDate = new Date(task.due_at);
        const nextDate = calculateNextDueDate(dueDate, schedule.recurrence_type, schedule.recurrence_interval);
        if (nextDate) {
          const nextDueAt = format(nextDate, "yyyy-MM-dd'T'HH:mm:ss");
          const occurrenceKey = generateOccurrenceKey(schedule.id, nextDate);
          const existing = this.getAll().find((t) => t.occurrence_key === occurrenceKey);
          if (!existing) {
            this.create({
              schedule_id: schedule.id,
              plant_id: task.plant_id,
              activity_type: task.activity_type,
              title: task.title,
              due_at: nextDueAt,
              status: 'pending',
              completed_at: null,
              skipped_at: null,
              skipped_reason: null,
              notes: null,
              occurrence_key: occurrenceKey,
            });
          }
        }
      }
    }

    return updated;
  },

  /**
   * Generate a care task from a schedule (called on schedule creation).
   */
  generateFromSchedule(schedule: CareSchedule): CareTask | null {
    const dueDate = new Date(schedule.next_due_at);
    const occurrenceKey = generateOccurrenceKey(schedule.id, dueDate);

    // Idempotency: don't create duplicate
    const existing = this.getAll().find((t) => t.occurrence_key === occurrenceKey);
    if (existing) return existing;

    return this.create({
      schedule_id: schedule.id,
      plant_id: schedule.plant_id,
      activity_type: schedule.activity_type,
      title: schedule.title,
      due_at: schedule.next_due_at,
      status: 'pending',
      completed_at: null,
      skipped_at: null,
      skipped_reason: null,
      notes: null,
      occurrence_key: occurrenceKey,
    });
  },

  /**
   * Process overdue tasks — update their statuses.
   */
  processOverdue(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tasks = this.getAll();
    let changed = false;
    tasks.forEach((t, i) => {
      if (t.status === 'pending' && new Date(t.due_at) < today) {
        tasks[i] = { ...t, status: 'overdue', updated_at: now() };
        changed = true;
      }
    });
    if (changed) save(STORAGE_KEYS.TASKS, tasks);
  },
};

// ============================================
// Care History
// ============================================
export const demoCareHistoryStore = {
  getAll(): CareHistory[] {
    return load<CareHistory[]>(STORAGE_KEYS.CARE_HISTORY, []);
  },

  getByPlantId(plantId: string): CareHistory[] {
    return this.getAll()
      .filter((h) => h.plant_id === plantId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  create(data: Omit<CareHistory, 'id' | 'user_id' | 'created_at'>): CareHistory {
    const entry: CareHistory = {
      ...data,
      id: generateId(),
      user_id: DEMO_USER_ID,
      created_at: now(),
    };
    const history = this.getAll();
    history.push(entry);
    save(STORAGE_KEYS.CARE_HISTORY, history);
    return entry;
  },

  /**
   * Calculate care streak from completion history.
   * A streak is the number of consecutive days with at least one completion.
   */
  getStreak(): number {
    const history = this.getAll().filter((h) => h.action === 'completed');
    if (history.length === 0) return 0;

    const dateSet = new Set(history.map((h) => h.completed_at.split('T')[0]));
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const checkDate = format(addDays(today, -i), 'yyyy-MM-dd');
      if (dateSet.has(checkDate)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  },
};

// ============================================
// Notifications
// ============================================
export const demoNotificationsStore = {
  getAll(): Notification[] {
    return load<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getUnreadCount(): number {
    return this.getAll().filter((n) => !n.is_read).length;
  },

  create(data: Omit<Notification, 'id' | 'user_id' | 'created_at'>): Notification {
    const notification: Notification = {
      ...data,
      id: generateId(),
      user_id: DEMO_USER_ID,
      created_at: now(),
    };
    const notifications = load<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    notifications.unshift(notification);
    // Keep only last 100 notifications
    save(STORAGE_KEYS.NOTIFICATIONS, notifications.slice(0, 100));
    return notification;
  },

  markRead(id: string): void {
    const notifications = load<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const index = notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications[index] = { ...notifications[index], is_read: true, read_at: now() };
      save(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  },

  markAllRead(): void {
    const notifications = load<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const updated = notifications.map((n) => ({ ...n, is_read: true, read_at: now() }));
    save(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  delete(id: string): void {
    const notifications = load<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []).filter((n) => n.id !== id);
    save(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  /**
   * Generate due-today notifications for pending tasks.
   * Called when the app loads to create in-app reminders.
   */
  generateDailyReminders(): void {
    const tasks = demoTasksStore.getDueToday();
    const plants = demoPlantsStore.getAll();

    tasks.forEach((task) => {
      // Check if we already have a notification for this task today
      const existing = this.getAll().find(
        (n) => n.task_id === task.id && n.created_at.startsWith(format(new Date(), 'yyyy-MM-dd'))
      );
      if (existing) return;

      const plant = plants.find((p) => p.id === task.plant_id);
      if (!plant) return;

      this.create({
        plant_id: task.plant_id,
        task_id: task.id,
        title: `Care reminder: ${plant.plant_name}`,
        message: `${task.title} is due today.`,
        notification_type: 'care_reminder',
        is_read: false,
        read_at: null,
      });
    });

    // Overdue notifications
    const overdue = demoTasksStore.getOverdue();
    overdue.forEach((task) => {
      const existing = this.getAll().find(
        (n) =>
          n.task_id === task.id &&
          n.notification_type === 'overdue_task' &&
          n.created_at.startsWith(format(new Date(), 'yyyy-MM-dd'))
      );
      if (existing) return;

      const plant = plants.find((p) => p.id === task.plant_id);
      if (!plant) return;

      this.create({
        plant_id: task.plant_id,
        task_id: task.id,
        title: `Overdue: ${plant.plant_name}`,
        message: `${task.title} is overdue and needs attention.`,
        notification_type: 'overdue_task',
        is_read: false,
        read_at: null,
      });
    });
  },
};

// ============================================
// Health Logs
// ============================================
export const demoHealthLogsStore = {
  getAll(): PlantHealthLog[] {
    return load<PlantHealthLog[]>(STORAGE_KEYS.HEALTH_LOGS, []);
  },

  getByPlantId(plantId: string): PlantHealthLog[] {
    return this.getAll()
      .filter((l) => l.plant_id === plantId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  create(data: Omit<PlantHealthLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>): PlantHealthLog {
    const log: PlantHealthLog = {
      ...data,
      id: generateId(),
      user_id: DEMO_USER_ID,
      created_at: now(),
      updated_at: now(),
    };
    const logs = this.getAll();
    logs.push(log);
    save(STORAGE_KEYS.HEALTH_LOGS, logs);
    return log;
  },

  delete(id: string): void {
    save(STORAGE_KEYS.HEALTH_LOGS, this.getAll().filter((l) => l.id !== id));
  },
};

// ============================================
// Growth Journal
// ============================================
export const demoJournalStore = {
  getAll(): GrowthJournalEntry[] {
    return load<GrowthJournalEntry[]>(STORAGE_KEYS.JOURNAL_ENTRIES, []);
  },

  getByPlantId(plantId: string): GrowthJournalEntry[] {
    return this.getAll()
      .filter((e) => e.plant_id === plantId)
      .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
  },

  create(data: Omit<GrowthJournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): GrowthJournalEntry {
    const entry: GrowthJournalEntry = {
      ...data,
      id: generateId(),
      user_id: DEMO_USER_ID,
      created_at: now(),
      updated_at: now(),
    };
    const entries = this.getAll();
    entries.push(entry);
    save(STORAGE_KEYS.JOURNAL_ENTRIES, entries);
    return entry;
  },

  update(id: string, data: Partial<GrowthJournalEntry>): GrowthJournalEntry | null {
    const entries = this.getAll();
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) return null;
    entries[index] = { ...entries[index], ...data, updated_at: now() };
    save(STORAGE_KEYS.JOURNAL_ENTRIES, entries);
    return entries[index];
  },

  delete(id: string): void {
    save(STORAGE_KEYS.JOURNAL_ENTRIES, this.getAll().filter((e) => e.id !== id));
  },
};

// ============================================
// Plant Species (read-only, from static data)
// ============================================
export const demoSpeciesStore = {
  getAll() {
    return PLANT_SPECIES_DATA;
  },

  getById(id: string) {
    return PLANT_SPECIES_DATA.find((s) => s.id === id) || null;
  },

  search(query: string) {
    const q = query.toLowerCase();
    return PLANT_SPECIES_DATA.filter(
      (s) =>
        s.common_name.toLowerCase().includes(q) ||
        (s.scientific_name && s.scientific_name.toLowerCase().includes(q))
    );
  },
};

// ============================================
// Analytics (computed from stored data)
// ============================================
export const demoAnalytics = {
  getDashboardStats() {
    const plants = demoPlantsStore.getAll();
    const todayTasks = demoTasksStore.getDueToday();
    const overdueTasks = demoTasksStore.getOverdue();
    const needingAttention = plants.filter(
      (p) => p.health_status === 'needs_attention' || p.health_status === 'critical'
    );

    return {
      total_plants: plants.length,
      tasks_due_today: todayTasks.length,
      tasks_overdue: overdueTasks.length,
      plants_needing_attention: needingAttention.length,
    };
  },

  getAnalyticsData() {
    const plants = demoPlantsStore.getAll();
    const allHistory = demoCareHistoryStore.getAll();
    const allTasks = demoTasksStore.getAll();

    const completed = allTasks.filter((t) => t.status === 'completed').length;
    const pending = allTasks.filter((t) => t.status === 'pending').length;
    const overdue = allTasks.filter((t) => t.status === 'overdue').length;
    const total = allTasks.length;

    // Weekly activity (last 7 days)
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(addDays(new Date(), -i), 'yyyy-MM-dd');
      const dayCompleted = allHistory.filter(
        (h) => h.action === 'completed' && h.completed_at.startsWith(date)
      ).length;
      const dayPending = allTasks.filter(
        (t) => t.due_at.startsWith(date) && t.status === 'pending'
      ).length;
      weeklyActivity.push({ date, completed: dayCompleted, pending: dayPending });
    }

    // Activity breakdown
    const activityCounts: Record<string, number> = {};
    allHistory.forEach((h) => {
      activityCounts[h.activity_type] = (activityCounts[h.activity_type] || 0) + 1;
    });
    const activityTotal = Object.values(activityCounts).reduce((a, b) => a + b, 0);
    const activityBreakdown = Object.entries(activityCounts).map(([type, count]) => ({
      activity_type: type as any,
      count,
      percentage: activityTotal > 0 ? Math.round((count / activityTotal) * 100) : 0,
    }));

    // Top plants
    const plantTaskCounts: Record<string, number> = {};
    allHistory.forEach((h) => {
      plantTaskCounts[h.plant_id] = (plantTaskCounts[h.plant_id] || 0) + 1;
    });
    const topPlants = Object.entries(plantTaskCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([plant_id, task_count]) => {
        const plant = plants.find((p) => p.id === plant_id);
        return { plant_id, plant_name: plant?.plant_name || 'Unknown', task_count };
      });

    return {
      total_plants: plants.length,
      total_tasks_completed: completed,
      total_tasks_pending: pending,
      total_tasks_overdue: overdue,
      completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      streak_days: demoCareHistoryStore.getStreak(),
      weekly_activity: weeklyActivity,
      monthly_activity: [],
      activity_breakdown: activityBreakdown,
      top_plants: topPlants,
    };
  },
};

// Initialize: process overdue tasks on load
if (typeof window !== 'undefined') {
  demoTasksStore.processOverdue();
}
