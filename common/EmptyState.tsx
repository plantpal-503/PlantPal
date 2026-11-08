import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="w-20 h-20 bg-mint rounded-3xl flex items-center justify-center mb-5 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-darkText mb-2">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
