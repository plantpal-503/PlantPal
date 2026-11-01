import { Leaf } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-glow animate-pulse">
            <Leaf className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-lg font-bold text-primary">PlantPal</p>
          <p className="text-sm text-muted">Loading your garden...</p>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
