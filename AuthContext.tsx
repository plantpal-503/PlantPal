import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AppUser, Profile, UserPreferences } from '@/types';
import { isDemoMode, supabase } from '@/lib/supabase';
import { demoAuth, demoProfileStore, demoPreferencesStore } from '@/lib/demoStore';

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  isDemoMode: boolean;
  isOnboardingRequired: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updatePreferences: (data: Partial<UserPreferences>) => Promise<void>;
  refreshUser: () => Promise<void>;
  markOnboardingComplete: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingRequired, setIsOnboardingRequired] = useState(false);

  const loadUserData = useCallback(async (userId: string, email: string) => {
    if (isDemoMode) {
      const profile = demoProfileStore.get();
      const preferences = demoPreferencesStore.get();
      setUser({
        id: userId,
        email,
        profile,
        preferences,
      });
      setIsOnboardingRequired(!demoAuth.isOnboardingDone());
      return;
    }

    if (!supabase) return;

    try {
      const [profileResult, prefsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
      ]);

      setUser({
        id: userId,
        email,
        profile: profileResult.data as Profile | null,
        preferences: prefsResult.data as UserPreferences | null,
      });
      setIsOnboardingRequired(!(prefsResult.data as UserPreferences | null)?.onboarding_completed);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      const session = demoAuth.getSession();
      if (session?.logged_in) {
        loadUserData(session.user_id, session.email);
      }
      setIsLoading(false);
      return;
    }

    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user.id, session.user.email ?? '');
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserData(session.user.id, session.user.email ?? '');
      } else {
        setUser(null);
        setIsOnboardingRequired(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (isDemoMode) {
      // Demo mode: accept any email/password combination
      const session = demoAuth.login(email, email.split('@')[0]);
      await loadUserData(session.user_id, session.email);
      return { error: null };
    }

    if (!supabase) return { error: 'Supabase is not configured' };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const register = async (email: string, password: string, fullName: string): Promise<{ error: string | null }> => {
    if (isDemoMode) {
      const session = demoAuth.login(email, fullName);
      demoProfileStore.update({ full_name: fullName, email });
      await loadUserData(session.user_id, session.email);
      return { error: null };
    }

    if (!supabase) return { error: 'Supabase is not configured' };

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (!error) {
      // Create profile record
      await supabase.from('profiles').upsert({
        id: (await supabase.auth.getUser()).data.user?.id,
        full_name: fullName,
        email,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    }

    return { error: error?.message ?? null };
  };

  const logout = async () => {
    if (isDemoMode) {
      demoAuth.logout();
      setUser(null);
      setIsOnboardingRequired(false);
      return;
    }

    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const forgotPassword = async (email: string): Promise<{ error: string | null }> => {
    if (isDemoMode) {
      return { error: 'Password reset is not available in demo mode. Configure Supabase to enable this feature.' };
    }

    if (!supabase) return { error: 'Supabase is not configured' };

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;

    if (isDemoMode) {
      const updated = demoProfileStore.update(data);
      setUser((prev) => prev ? { ...prev, profile: updated } : null);
      return;
    }

    if (!supabase) return;

    const { data: updated } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single();

    setUser((prev) => prev ? { ...prev, profile: updated as Profile } : null);
  };

  const updatePreferences = async (data: Partial<UserPreferences>) => {
    if (!user) return;

    if (isDemoMode) {
      const updated = demoPreferencesStore.update(data);
      setUser((prev) => prev ? { ...prev, preferences: updated } : null);
      return;
    }

    if (!supabase) return;

    const { data: updated } = await supabase
      .from('user_preferences')
      .upsert({ ...data, user_id: user.id })
      .select()
      .single();

    setUser((prev) => prev ? { ...prev, preferences: updated as UserPreferences } : null);
  };

  const refreshUser = async () => {
    if (user) {
      await loadUserData(user.id, user.email ?? '');
    }
  };

  const markOnboardingComplete = () => {
    if (isDemoMode) {
      demoAuth.markOnboardingDone();
    }
    setIsOnboardingRequired(false);
    updatePreferences({ onboarding_completed: true } as Partial<UserPreferences>);
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    isDemoMode,
    isOnboardingRequired,
    login,
    register,
    logout,
    forgotPassword,
    updateProfile,
    updatePreferences,
    refreshUser,
    markOnboardingComplete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
