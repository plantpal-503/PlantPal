import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { GardenType, ExperienceLevel, ActivityType } from '@/types';
import { cn } from '@/lib/cn';

const STEPS = ['Welcome', 'Garden Type', 'Experience', 'Care Preferences', 'Notifications', 'All Set!'];

const GARDEN_TYPES: { value: GardenType; label: string; emoji: string; description: string }[] = [
  { value: 'indoor', label: 'Indoor Plants', emoji: '🏠', description: 'Houseplants in rooms, shelves, and windowsills' },
  { value: 'outdoor', label: 'Outdoor Garden', emoji: '🌳', description: 'Garden beds, yard plants, and outdoor spaces' },
  { value: 'balcony', label: 'Balcony Garden', emoji: '🌿', description: 'Pots and containers on a balcony or patio' },
  { value: 'mixed', label: 'Mixed Garden', emoji: '🌺', description: 'A mix of indoor and outdoor plants' },
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; emoji: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', emoji: '🌱', description: 'New to plant care, learning the basics' },
  { value: 'intermediate', label: 'Intermediate', emoji: '🪴', description: 'Have some experience with houseplants' },
  { value: 'experienced', label: 'Experienced', emoji: '🌳', description: 'Seasoned gardener with multiple plants' },
];

const CARE_TYPES: { value: ActivityType; label: string; emoji: string }[] = [
  { value: 'watering', label: 'Watering', emoji: '💧' },
  { value: 'fertilizing', label: 'Fertilizing', emoji: '🌿' },
  { value: 'misting', label: 'Misting', emoji: '💦' },
  { value: 'pruning', label: 'Pruning', emoji: '✂️' },
  { value: 'repotting', label: 'Repotting', emoji: '🪴' },
  { value: 'health_check', label: 'General Checks', emoji: '🔍' },
];

interface OnboardingData {
  preferredName: string;
  gardenType: GardenType | null;
  experience: ExperienceLevel | null;
  careTypes: ActivityType[];
  enableBrowserNotifications: boolean;
}

export default function OnboardingPage() {
  const { user, updateProfile, updatePreferences, markOnboardingComplete } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>('default');

  const [data, setData] = useState<OnboardingData>({
    preferredName: user?.profile?.full_name?.split(' ')[0] || '',
    gardenType: null,
    experience: null,
    careTypes: ['watering', 'fertilizing'],
    enableBrowserNotifications: false,
  });

  const handleNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleRequestNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser notifications are not supported in your browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        setData((d) => ({ ...d, enableBrowserNotifications: true }));
        toast.success('Browser notifications enabled!');
      } else if (permission === 'denied') {
        toast.error('Notification permission denied. You can enable this later in browser settings.');
      }
    } catch {
      toast.error('Unable to request notification permission.');
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        full_name: data.preferredName || user?.profile?.full_name || '',
      });
      await updatePreferences({
        garden_type: data.gardenType || undefined,
        experience_level: data.experience || undefined,
        notification_preferences: {
          in_app: true,
          browser: data.enableBrowserNotifications,
          email: false,
          push: false,
          care_types: data.careTypes,
          reminder_advance_hours: 2,
        },
        onboarding_completed: true,
      } as any);
      markOnboardingComplete();
      toast.success('Welcome to PlantPal! Your garden is ready. 🌿');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-mint flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-primary">PlantPal</span>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((label, index) => (
              <div
                key={label}
                className={cn(
                  'flex-1 h-1 rounded-full mx-0.5 transition-all duration-300',
                  index <= step ? 'bg-primary' : 'bg-gray-200'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-muted text-center">Step {step + 1} of {STEPS.length}</p>
        </div>

        <div className="card p-8 animate-fade-in">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="text-5xl mb-5">🌱</div>
              <h2 className="text-2xl font-bold text-darkText mb-2">Welcome to PlantPal!</h2>
              <p className="text-muted mb-6">Let's get your garden set up. First, what should we call you?</p>
              <input
                type="text"
                value={data.preferredName}
                onChange={(e) => setData((d) => ({ ...d, preferredName: e.target.value }))}
                placeholder="Enter your name"
                className="input text-center text-lg font-medium mb-2"
                autoFocus
              />
              <p className="text-xs text-muted">This is how we'll greet you on your dashboard.</p>
            </div>
          )}

          {/* Step 1: Garden Type */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-darkText mb-2 text-center">What kind of garden do you have?</h2>
              <p className="text-muted text-sm text-center mb-6">This helps us give you better recommendations.</p>
              <div className="grid grid-cols-2 gap-3">
                {GARDEN_TYPES.map(({ value, label, emoji, description }) => (
                  <button
                    key={value}
                    onClick={() => setData((d) => ({ ...d, gardenType: value }))}
                    className={cn(
                      'p-4 rounded-2xl border-2 text-left transition-all duration-200',
                      data.gardenType === value
                        ? 'border-primary bg-mint'
                        : 'border-gray-200 hover:border-primary-200 hover:bg-mint/50'
                    )}
                  >
                    <div className="text-2xl mb-2">{emoji}</div>
                    <p className="font-semibold text-sm text-darkText">{label}</p>
                    <p className="text-xs text-muted mt-1">{description}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={handleNext}
                className="mt-4 text-sm text-muted hover:text-primary text-center w-full transition-colors"
              >
                Skip this question →
              </button>
            </div>
          )}

          {/* Step 2: Experience */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-darkText mb-2 text-center">Your experience level?</h2>
              <p className="text-muted text-sm text-center mb-6">We'll tailor tips and recommendations accordingly.</p>
              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map(({ value, label, emoji, description }) => (
                  <button
                    key={value}
                    onClick={() => setData((d) => ({ ...d, experience: value }))}
                    className={cn(
                      'w-full p-4 rounded-2xl border-2 flex items-center gap-4 text-left transition-all duration-200',
                      data.experience === value
                        ? 'border-primary bg-mint'
                        : 'border-gray-200 hover:border-primary-200 hover:bg-mint/50'
                    )}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <p className="font-semibold text-darkText">{label}</p>
                      <p className="text-sm text-muted">{description}</p>
                    </div>
                    {data.experience === value && (
                      <Check className="ml-auto w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              <button onClick={handleNext} className="mt-4 text-sm text-muted hover:text-primary text-center w-full transition-colors">
                Skip this question →
              </button>
            </div>
          )}

          {/* Step 3: Care Preferences */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-darkText mb-2 text-center">What care reminders do you want?</h2>
              <p className="text-muted text-sm text-center mb-6">Select all that apply. You can adjust these later.</p>
              <div className="grid grid-cols-2 gap-3">
                {CARE_TYPES.map(({ value, label, emoji }) => {
                  const selected = data.careTypes.includes(value);
                  return (
                    <button
                      key={value}
                      onClick={() => setData((d) => ({
                        ...d,
                        careTypes: selected
                          ? d.careTypes.filter((t) => t !== value)
                          : [...d.careTypes, value],
                      }))}
                      className={cn(
                        'p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200',
                        selected
                          ? 'border-primary bg-mint'
                          : 'border-gray-200 hover:border-primary-200 hover:bg-mint/50'
                      )}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-sm font-medium text-darkText">{label}</span>
                      {selected && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Notification Preferences */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-darkText mb-2 text-center">Stay notified</h2>
              <p className="text-muted text-sm text-center mb-6">Choose how you'd like to receive care reminders.</p>

              <div className="space-y-4">
                {/* In-app (always on) */}
                <div className="p-4 rounded-2xl bg-mint border border-primary-100 flex items-center gap-4">
                  <span className="text-2xl">🔔</span>
                  <div className="flex-1">
                    <p className="font-semibold text-darkText text-sm">In-App Notifications</p>
                    <p className="text-xs text-muted">Always active — reminders inside PlantPal</p>
                  </div>
                  <span className="badge badge-green">Always on</span>
                </div>

                {/* Browser notifications */}
                <div className="p-4 rounded-2xl border-2 border-gray-200">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">💻</span>
                    <div className="flex-1">
                      <p className="font-semibold text-darkText text-sm">Browser Notifications</p>
                      <p className="text-xs text-muted mb-3">Get reminders even when PlantPal is in the background. Requires browser permission.</p>
                      {notifPermission === 'granted' ? (
                        <span className="badge badge-green">✓ Enabled</span>
                      ) : notifPermission === 'denied' ? (
                        <p className="text-xs text-error">Permission denied. Enable in browser settings to use this feature.</p>
                      ) : (
                        <button onClick={handleRequestNotifications} className="btn-outline btn btn-sm">
                          Enable Browser Notifications
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email (future) */}
                <div className="p-4 rounded-2xl border-2 border-gray-200 opacity-60">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">📧</span>
                    <div>
                      <p className="font-semibold text-darkText text-sm">Email Notifications</p>
                      <p className="text-xs text-muted">Requires Resend API configuration. Set up in Settings after launch.</p>
                    </div>
                    <span className="badge badge-gray ml-auto">Requires setup</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Finish */}
          {step === 5 && (
            <div className="text-center">
              <div className="text-6xl mb-5">🎉</div>
              <h2 className="text-2xl font-bold text-darkText mb-3">You're all set!</h2>
              <p className="text-muted mb-6 leading-relaxed">
                Welcome, <strong>{data.preferredName || 'Gardener'}</strong>! Your PlantPal garden is ready. 
                Start by adding your plants and setting up their care schedules.
              </p>
              <div className="space-y-2 text-sm text-left mb-6">
                {[
                  '🌱 Add your plants to get started',
                  '📅 Set up personalized care schedules',
                  '🔔 Receive timely reminders',
                  '📊 Track your garden\'s progress',
                ].map((tip) => (
                  <p key={tip} className="text-muted">{tip}</p>
                ))}
              </div>
              <button
                onClick={handleFinish}
                disabled={isLoading}
                className="btn-primary btn w-full btn-lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up...
                  </span>
                ) : (
                  <>
                    Go to My Garden
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Navigation buttons */}
          {step < STEPS.length - 1 && (
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button onClick={handleBack} className="btn-ghost btn flex-1">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="btn-primary btn flex-1"
              >
                {step === 0 ? 'Get Started' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Skip onboarding entirely */}
        {step < STEPS.length - 1 && (
          <button
            onClick={handleFinish}
            className="mt-4 text-sm text-muted hover:text-primary text-center w-full transition-colors"
          >
            Skip onboarding and go to dashboard →
          </button>
        )}
      </div>
    </div>
  );
}
