import { Info, ExternalLink } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-sm text-amber-800">
      <Info className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">
        <strong>Demo Mode:</strong> Data is stored locally in your browser. To use the full app with a real database,{' '}
        <a
          href="https://supabase.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline inline-flex items-center gap-0.5 hover:text-amber-900"
        >
          configure Supabase
          <ExternalLink className="w-3 h-3" />
        </a>
        .
      </span>
    </div>
  );
}
