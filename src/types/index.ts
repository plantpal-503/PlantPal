// ============================================
// Core Database Types matching Supabase schema
// ============================================

export type HealthStatus = 'healthy' | 'needs_attention' | 'recovering' | 'critical';
export type ActivityType =
  | 'watering'
  | 'fertilizing'
  | 'misting'
  | 'pruning'
  | 'repotting'
  | 'leaf_cleaning'
  | 'soil_check'
  | 'pest_inspection'
  | 'health_check'
  | 'custom';

export type RecurrenceType =
  | 'once'
  | 'daily'
  | 'every_2_days'
  | 'every_3_days'
  | 'weekly'
  | 'every_2_weeks'
  | 'monthly'
  | 'custom';

export type TaskStatus = 'pending' | 'completed' | 'skipped' | 'overdue';
export type GardenType = 'indoor' | 'outdoor' | 'balcony' | 'mixed';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'experienced';
export type PlantCategory =
  | 'succulents'
  | 'cacti'
  | 'flowering'
  | 'foliage'
  | 'herbs'
  | 'vegetables'
  | 'fruit'
  | 'trees'
  | 'ferns'
  | 'climbers'
  | 'other';

export type DifficultyLevel = 'easy' | 'moderate' | 'hard';
export type NotificationChannel = 'in_app' | 'browser' | 'email' | 'push';
export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'skipped';

// ============================================
// Profile
// ============================================
export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// User Preferences
// ============================================
export interface NotificationPreferences {
  in_app: boolean;
  browser: boolean;
  email: boolean;
  push: boolean;
  care_types: ActivityType[];
  reminder_advance_hours: number;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  garden_type: GardenType | null;
  experience_level: ExperienceLevel | null;
  theme: 'light' | 'dark';
  date_format: string;
  time_format: '12h' | '24h';
  preferred_reminder_time: string;
  notification_preferences: NotificationPreferences;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Plant Species (Library)
// ============================================
export interface PlantCareInfo {
  light: string;
  watering: string;
  humidity: string;
  temperature: string;
  soil: string;
  fertilizer: string;
  toxicity?: string;
  common_problems: string[];
  care_tips: string[];
}

export interface PlantSpecies {
  id: string;
  common_name: string;
  scientific_name: string | null;
  category: PlantCategory;
  description: string;
  care_info: PlantCareInfo;
  image_url: string | null;
  difficulty: DifficultyLevel;
  created_at: string;
  updated_at: string;
}

// ============================================
// User Plants
// ============================================
export interface UserPlant {
  id: string;
  user_id: string;
  species_id: string | null;
  plant_name: string;
  image_url: string | null;
  location: string | null;
  is_indoor: boolean;
  acquired_at: string | null;
  planted_at: string | null;
  light_conditions: string | null;
  soil_type: string | null;
  watering_notes: string | null;
  health_status: HealthStatus;
  notes: string | null;
  pot_type: string | null;
  category: PlantCategory | null;
  created_at: string;
  updated_at: string;
  // Joined
  species?: PlantSpecies;
  next_care_task?: CareTask | null;
  care_schedules?: CareSchedule[];
}

// ============================================
// Care Schedules
// ============================================
export interface CareSchedule {
  id: string;
  user_id: string;
  plant_id: string;
  activity_type: ActivityType;
  title: string;
  instructions: string | null;
  start_date: string;
  due_time: string | null;
  recurrence_type: RecurrenceType;
  recurrence_interval: number | null;
  next_due_at: string;
  end_date: string | null;
  is_active: boolean;
  notify_before_hours: number;
  created_at: string;
  updated_at: string;
  // Joined
  plant?: UserPlant;
}

// ============================================
// Care Tasks
// ============================================
export interface CareTask {
  id: string;
  user_id: string;
  schedule_id: string | null;
  plant_id: string;
  activity_type: ActivityType;
  title: string;
  due_at: string;
  status: TaskStatus;
  completed_at: string | null;
  skipped_at: string | null;
  skipped_reason: string | null;
  notes: string | null;
  occurrence_key: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  plant?: UserPlant;
  schedule?: CareSchedule;
}

// ============================================
// Care History
// ============================================
export interface CareHistory {
  id: string;
  user_id: string;
  plant_id: string;
  task_id: string | null;
  activity_type: ActivityType;
  action: 'completed' | 'skipped' | 'scheduled' | 'rescheduled';
  completed_at: string;
  notes: string | null;
  created_at: string;
  // Joined
  plant?: UserPlant;
}

// ============================================
// Notifications
// ============================================
export interface Notification {
  id: string;
  user_id: string;
  plant_id: string | null;
  task_id: string | null;
  title: string;
  message: string;
  notification_type: 'care_reminder' | 'overdue_task' | 'info' | 'health_alert';
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  // Joined
  plant?: UserPlant;
  task?: CareTask;
}

// ============================================
// Plant Health Logs
// ============================================
export interface PlantHealthLog {
  id: string;
  user_id: string;
  plant_id: string;
  health_status: HealthStatus;
  symptoms: string[];
  observations: string | null;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  // Joined
  plant?: UserPlant;
}

// ============================================
// Growth Journal
// ============================================
export interface GrowthJournalEntry {
  id: string;
  user_id: string;
  plant_id: string;
  entry_date: string;
  notes: string | null;
  height_value: number | null;
  height_unit: 'cm' | 'inches' | null;
  leaf_count: number | null;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  // Joined
  plant?: UserPlant;
}

// ============================================
// Push Subscriptions
// ============================================
export interface PushSubscription {
  id: string;
  user_id: string;
  subscription_endpoint: string;
  subscription_data: object;
  created_at: string;
  updated_at: string;
}

// ============================================
// User Location (for weather)
// ============================================
export interface UserLocation {
  id: string;
  user_id: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Weather
// ============================================
export interface WeatherData {
  city: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  is_raining: boolean;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  max_temp: number;
  min_temp: number;
  description: string;
  precipitation_probability: number;
}

// ============================================
// Analytics
// ============================================
export interface AnalyticsData {
  total_plants: number;
  total_tasks_completed: number;
  total_tasks_pending: number;
  total_tasks_overdue: number;
  completion_rate: number;
  streak_days: number;
  weekly_activity: WeeklyActivity[];
  monthly_activity: MonthlyActivity[];
  activity_breakdown: ActivityBreakdown[];
  top_plants: TopPlant[];
}

export interface WeeklyActivity {
  date: string;
  completed: number;
  pending: number;
}

export interface MonthlyActivity {
  month: string;
  completed: number;
  total: number;
}

export interface ActivityBreakdown {
  activity_type: ActivityType;
  count: number;
  percentage: number;
}

export interface TopPlant {
  plant_id: string;
  plant_name: string;
  task_count: number;
}

// ============================================
// Form Types
// ============================================
export interface AddPlantFormData {
  plant_name: string;
  species_id?: string;
  scientific_name?: string;
  category?: PlantCategory;
  location?: string;
  is_indoor: boolean;
  acquired_at?: string;
  light_conditions?: string;
  soil_type?: string;
  watering_notes?: string;
  health_status: HealthStatus;
  notes?: string;
  pot_type?: string;
}

export interface CareScheduleFormData {
  plant_id: string;
  activity_type: ActivityType;
  title: string;
  instructions?: string;
  start_date: string;
  due_time?: string;
  recurrence_type: RecurrenceType;
  recurrence_interval?: number;
  end_date?: string;
  notify_before_hours: number;
}

// ============================================
// App State
// ============================================
export interface AppUser {
  id: string;
  email: string | null;
  profile: Profile | null;
  preferences: UserPreferences | null;
}

export interface DashboardStats {
  total_plants: number;
  tasks_due_today: number;
  tasks_overdue: number;
  plants_needing_attention: number;
}
