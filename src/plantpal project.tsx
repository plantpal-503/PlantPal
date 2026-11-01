import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Suspense, lazy } from 'react';

// Eagerly loaded pages (critical path)
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import LoadingScreen from '@/components/common/LoadingScreen';

// Lazily loaded pages
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const PlantsPage = lazy(() => import('@/pages/PlantsPage'));
const PlantDetailsPage = lazy(() => import('@/pages/PlantDetailsPage'));
const PlantLibraryPage = lazy(() => import('@/pages/PlantLibraryPage'));
const CareTasksPage = lazy(() => import('@/pages/CareTasksPage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));
const HealthPage = lazy(() => import('@/pages/HealthPage'));
const JournalPage = lazy(() => import('@/pages/JournalPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
});

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isOnboardingRequired } = useAuth();

    if (isLoading) return <LoadingScreen />;
    if (!user) return <Navigate to="/login" replace />;
    if (isOnboardingRequired) return <Navigate to="/onboarding" replace />;

    return <>{children}</>;
}

// Onboarding route — only accessible when authenticated but onboarding not complete
function OnboardingRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();

    if (isLoading) return <LoadingScreen />;
    if (!user) return <Navigate to="/login" replace />;

    return <>{children}</>;
}

// Public route — redirect authenticated users to dashboard
function PublicRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isOnboardingRequired } = useAuth();

    if (isLoading) return <LoadingScreen />;
    if (user) {
        return <Navigate to={isOnboardingRequired ? '/onboarding' : '/dashboard'} replace />;
    }

    return <>{children}</>;
}

function AppRoutes() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Onboarding */}
                <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />

                {/* Protected app routes */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/plants" element={<ProtectedRoute><PlantsPage /></ProtectedRoute>} />
                <Route path="/plants/:id" element={<ProtectedRoute><PlantDetailsPage /></ProtectedRoute>} />
                <Route path="/library" element={<ProtectedRoute><PlantLibraryPage /></ProtectedRoute>} />
                <Route path="/tasks" element={<ProtectedRoute><CareTasksPage /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                <Route path="/health" element={<ProtectedRoute><HealthPage /></ProtectedRoute>} />
                <Route path="/journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <AppRoutes />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: '#fff',
                                border: '1px solid #E6F3E9',
                                color: '#24352B',
                                fontFamily: 'Inter, sans-serif',
                            },
                        }}
                        richColors
                    />
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
