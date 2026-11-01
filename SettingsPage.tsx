import { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Bell,
  Sliders,
  Shield,
  Save,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/contexts/AuthContext';
import { demoProfileStore, demoPreferencesStore, demoAuth } from '@/lib/demoStore';
import type { GardenType, ExperienceLevel, ActivityType } from '@/types';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, logout, updateProfile, updatePreferences } = useAuth();

  // Profile form state
  const [fullName, setFullName] = useState(user?.profile?.full_name || 'Plant Enthusiast');
  const [email] = useState(user?.email || 'demo@plantpal.app');
  const [timezone, setTimezone] = useState(
    user?.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Notification Preferences
  const [inAppNotifs, setInAppNotifs] = useState(
    user?.preferences?.notification_preferences?.in_app ?? true
  );
  const [browserNotifs, setBrowserNotifs] = useState(
    user?.preferences?.notification_preferences?.browser ?? false
  );
  const [emailNotifs, setEmailNotifs] = useState(
    user?.preferences?.notification_preferences?.email ?? false
  );
  const [reminderTime, setReminderTime] = useState(
    user?.preferences?.preferred_reminder_time || '08:00'
  );
  const [careTypes, setCareTypes] = useState<ActivityType[]>(
    user?.preferences?.notification_preferences?.care_types || ['watering', 'fertilizing']
  );

  // Garden preferences
  const [gardenType, setGardenType] = useState<GardenType>(
    user?.preferences?.garden_type || 'indoor'
  );
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    user?.preferences?.experience_level || 'beginner'
  );
  const [dateFormat, setDateFormat] = useState(
    user?.preferences?.date_format || 'MMM d, yyyy'
  );
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(
    user?.preferences?.time_format || '12h'
  );

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      if (user.profile.full_name) setFullName(user.profile.full_name);
      if (user.profile.timezone) setTimezone(user.profile.timezone);
    }
    if (user?.preferences) {
      if (user.preferences.garden_type) setGardenType(user.preferences.garden_type);
      if (user.preferences.experience_level) setExperienceLevel(user.preferences.experience_level);
      if (user.preferences.preferred_reminder_time) {
        setReminderTime(user.preferences.preferred_reminder_time);
      }
      if (user.preferences.notification_preferences) {
        setInAppNotifs(user.preferences.notification_preferences.in_app);
        setBrowserNotifs(user.preferences.notification_preferences.browser);
        setEmailNotifs(user.preferences.notification_preferences.email);
        setCareTypes(user.preferences.notification_preferences.care_types);
      }
    }
  }, [user]);

  const handleToggleCareType = (type: ActivityType) => {
    setCareTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Update profile
      await updateProfile({
        full_name: fullName,
        timezone,
      });

      // Update preferences
      await updatePreferences({
        garden_type: gardenType,
        experience_level: experienceLevel,
        preferred_reminder_time: reminderTime,
        date_format: dateFormat,
        time_format: timeFormat,
        notification_preferences: {
          in_app: inAppNotifs,
          browser: browserNotifs,
          email: emailNotifs,
          push: false,
          care_types: careTypes,
          reminder_advance_hours: 2,
        },
      });

      // Sync demo stores
      demoProfileStore.update({ full_name: fullName, timezone });
      demoPreferencesStore.update({
        garden_type: gardenType,
        experience_level: experienceLevel,
        preferred_reminder_time: reminderTime,
        date_format: dateFormat,
        time_format: timeFormat,
        notification_preferences: {
          in_app: inAppNotifs,
          browser: browserNotifs,
          email: emailNotifs,
          push: false,
          care_types: careTypes,
          reminder_advance_hours: 2,
        },
      });

      toast.success('Settings saved successfully! 🌿');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo data to default state? This will clear locally added custom plants.')) {
      localStorage.clear();
      demoAuth.login('demo@plantpal.app', 'Plant Enthusiast');
      toast.success('Demo data reset! Refreshing...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in pb-16 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-darkText flex items-center gap-2">
              <Settings className="w-8 h-8 text-primary" />
              Settings
            </h1>
            <p className="text-muted text-sm mt-1">
              Customize your profile, notification reminders, and garden environment.
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="btn-primary btn-sm text-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <form onSubmit={handleSaveAll} className="space-y-6">
          {/* Profile Card */}
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-bold text-darkText flex items-center gap-2 border-b border-gray-100 pb-3">
              <User className="w-4 h-4 text-primary" />
              User Profile
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="input bg-gray-50 text-muted cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="input"
                />
                <p className="text-xs text-muted mt-1">
                  Used for computing exact morning care reminders.
                </p>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-bold text-darkText flex items-center gap-2 border-b border-gray-100 pb-3">
              <Bell className="w-4 h-4 text-primary" />
              Reminders & Notifications
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50/80 cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-darkText">In-App Care Alerts</p>
                  <p className="text-xs text-muted">Show notifications in the top bar bell icon</p>
                </div>
                <input
                  type="checkbox"
                  checked={inAppNotifs}
                  onChange={(e) => setInAppNotifs(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50/80 cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-darkText">Browser Push Notifications</p>
                  <p className="text-xs text-muted">Receive reminders when your browser is open</p>
                </div>
                <input
                  type="checkbox"
                  checked={browserNotifs}
                  onChange={(e) => setBrowserNotifs(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50/80 cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-darkText">Email Summary Digest</p>
                  <p className="text-xs text-muted">Weekly recap of upcoming tasks and plant health</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
              <div>
                <label className="label">Preferred Daily Reminder Time</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Notify for Activities</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(['watering', 'fertilizing', 'misting', 'pruning', 'repotting'] as ActivityType[]).map(
                    (act) => {
                      const active = careTypes.includes(act);
                      return (
                        <button
                          key={act}
                          type="button"
                          onClick={() => handleToggleCareType(act)}
                          className={`text-xs px-2.5 py-1 rounded-lg border capitalize font-medium transition-colors ${
                            active
                              ? 'bg-primary text-white border-primary'
                              : 'bg-gray-50 text-muted border-gray-200'
                          }`}
                        >
                          {act}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Garden & Preferences Card */}
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-bold text-darkText flex items-center gap-2 border-b border-gray-100 pb-3">
              <Sliders className="w-4 h-4 text-primary" />
              Garden Setup & Formats
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Garden Environment</label>
                <select
                  value={gardenType}
                  onChange={(e) => setGardenType(e.target.value as GardenType)}
                  className="input"
                >
                  <option value="indoor">Indoor Houseplants</option>
                  <option value="balcony">Balcony & Patio</option>
                  <option value="outdoor">Outdoor Garden</option>
                  <option value="mixed">Mixed (Indoor & Outdoor)</option>
                </select>
              </div>

              <div>
                <label className="label">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                  className="input"
                >
                  <option value="beginner">Beginner (New Plant Parent)</option>
                  <option value="intermediate">Intermediate (Comfortable Caring)</option>
                  <option value="experienced">Green Thumb (Expert Collector)</option>
                </select>
              </div>

              <div>
                <label className="label">Date Format</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="input"
                >
                  <option value="MMM d, yyyy">Nov 1, 2026 (MMM d, yyyy)</option>
                  <option value="yyyy-MM-dd">2026-11-01 (yyyy-MM-dd)</option>
                  <option value="dd/MM/yyyy">01/11/2026 (dd/MM/yyyy)</option>
                </select>
              </div>

              <div>
                <label className="label">Time Format</label>
                <select
                  value={timeFormat}
                  onChange={(e) => setTimeFormat(e.target.value as '12h' | '24h')}
                  className="input"
                >
                  <option value="12h">12-hour (08:00 AM)</option>
                  <option value="24h">24-hour (08:00)</option>
                </select>
              </div>
            </div>
          </div>

          {/* System & Demo Mode Management */}
          <div className="card p-6 space-y-4 border border-primary-100 bg-mint/20">
            <h2 className="text-base font-bold text-darkText flex items-center gap-2 border-b border-primary-100 pb-3">
              <Shield className="w-4 h-4 text-primary" />
              Demo Data & System Management
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-darkText">Local Demo Storage</p>
                <p className="text-xs text-muted mt-0.5">
                  PlantPal is currently running with local browser storage. Reset to restore sample plants and tasks.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="btn-outline btn-sm text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Demo Data
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="btn-danger btn-sm text-xs flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
