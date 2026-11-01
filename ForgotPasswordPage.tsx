import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Leaf, Mail, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validation';

export default function ForgotPasswordPage() {
  const { forgotPassword, isDemoMode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await forgotPassword(data.email);
      if (error) {
        toast.error(error);
      } else {
        setSent(true);
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-primary">PlantPal</span>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-mint rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-darkText mb-2">Check your email</h2>
              <p className="text-muted text-sm mb-6">
                We sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </p>
              <Link to="/login" className="btn-primary btn w-full justify-center">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-darkText mb-1">Reset your password</h2>
                <p className="text-muted text-sm">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {isDemoMode && (
                <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  Password reset is not available in demo mode. Configure Supabase to enable this feature.
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <div>
                  <label htmlFor="email" className="label">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && <p className="error-text">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  className="btn-primary btn w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link to="/login" className="text-sm text-muted hover:text-primary inline-flex items-center gap-1 transition-colors">
                  <ArrowLeft className="w-3 h-3" />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
