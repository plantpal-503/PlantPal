import { useState, useEffect, useCallback } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const iconColor = variant === 'danger' ? 'text-error' : variant === 'warning' ? 'text-warning' : 'text-primary';
  const iconBg = variant === 'danger' ? 'bg-red-50' : variant === 'warning' ? 'bg-amber-50' : 'bg-mint';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4 text-muted" />
        </button>

        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', iconBg)}>
          {variant === 'danger' ? (
            <Trash2 className={cn('w-6 h-6', iconColor)} />
          ) : (
            <AlertTriangle className={cn('w-6 h-6', iconColor)} />
          )}
        </div>

        <h2 id="dialog-title" className="text-lg font-semibold text-darkText mb-2">
          {title}
        </h2>
        <p className="text-sm text-muted mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-outline flex-1"
            disabled={loading || isLoading}
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={cn('flex-1 btn', variant === 'danger' ? 'btn-danger' : 'btn-primary')}
            disabled={loading || isLoading}
          >
            {(loading || isLoading) ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
