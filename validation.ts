import { z } from 'zod';

// ============================================
// Auth Validation
// ============================================
export const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

// ============================================
// Plant Validation
// ============================================
export const addPlantSchema = z.object({
  plant_name: z.string().min(1, 'Plant name is required').max(100),
  species_id: z.string().uuid().optional().or(z.literal('')),
  category: z.string().optional(),
  location: z.string().max(100).optional().or(z.literal('')),
  is_indoor: z.boolean(),
  acquired_at: z.string().optional().or(z.literal('')),
  light_conditions: z.string().max(200).optional().or(z.literal('')),
  soil_type: z.string().max(200).optional().or(z.literal('')),
  watering_notes: z.string().max(500).optional().or(z.literal('')),
  health_status: z.enum(['healthy', 'needs_attention', 'recovering', 'critical']),
  notes: z.string().max(1000).optional().or(z.literal('')),
  pot_type: z.string().max(100).optional().or(z.literal('')),
});

// ============================================
// Care Schedule Validation
// ============================================
export const careScheduleSchema = z.object({
  plant_id: z.string().uuid('Please select a plant'),
  activity_type: z.enum([
    'watering', 'fertilizing', 'misting', 'pruning', 'repotting',
    'leaf_cleaning', 'soil_check', 'pest_inspection', 'health_check', 'custom'
  ]),
  title: z.string().min(1, 'Title is required').max(200),
  instructions: z.string().max(1000).optional().or(z.literal('')),
  start_date: z.string().min(1, 'Start date is required'),
  due_time: z.string().optional().or(z.literal('')),
  recurrence_type: z.enum(['once', 'daily', 'every_2_days', 'every_3_days', 'weekly', 'every_2_weeks', 'monthly', 'custom']),
  recurrence_interval: z.number().int().min(1).max(365).optional(),
  end_date: z.string().optional().or(z.literal('')),
  notify_before_hours: z.number().int().min(0).max(72),
}).refine((data) => {
  if (data.recurrence_type === 'custom' && !data.recurrence_interval) {
    return false;
  }
  return true;
}, {
  message: 'Custom interval requires a specific number of days',
  path: ['recurrence_interval'],
});

// ============================================
// Health Log Validation
// ============================================
export const healthLogSchema = z.object({
  health_status: z.enum(['healthy', 'needs_attention', 'recovering', 'critical']),
  symptoms: z.array(z.string()).optional(),
  observations: z.string().max(2000).optional().or(z.literal('')),
});

// ============================================
// Journal Entry Validation
// ============================================
export const journalEntrySchema = z.object({
  entry_date: z.string().min(1, 'Entry date is required'),
  notes: z.string().max(5000).optional().or(z.literal('')),
  height_value: z.number().positive().optional(),
  height_unit: z.enum(['cm', 'inches']).optional(),
  leaf_count: z.number().int().positive().optional(),
});

// ============================================
// Settings Validation
// ============================================
export const profileSettingsSchema = z.object({
  full_name: z.string().min(2).max(100),
  timezone: z.string(),
});

export const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark']),
  date_format: z.string(),
  time_format: z.enum(['12h', '24h']),
  preferred_reminder_time: z.string(),
  garden_type: z.enum(['indoor', 'outdoor', 'balcony', 'mixed']).optional(),
  experience_level: z.enum(['beginner', 'intermediate', 'experienced']).optional(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type AddPlantFormData = z.infer<typeof addPlantSchema>;
export type CareScheduleFormData = z.infer<typeof careScheduleSchema>;
export type HealthLogFormData = z.infer<typeof healthLogSchema>;
export type JournalEntryFormData = z.infer<typeof journalEntrySchema>;
export type ProfileSettingsFormData = z.infer<typeof profileSettingsSchema>;
export type PreferencesFormData = z.infer<typeof preferencesSchema>;
