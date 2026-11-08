import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft, Home, BookOpen } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full flex flex-col items-center animate-fade-in">
        {/* Visual Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-mint flex items-center justify-center shadow-soft">
            <Leaf className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <span className="absolute -top-2 -right-2 px-2.5 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-sm">
            404
          </span>
        </div>

        {/* Text Details */}
        <h1 className="text-3xl font-extrabold text-darkText mb-2">
          Page Lost in the Foliage
        </h1>
        <p className="text-muted text-sm leading-relaxed mb-8">
          We couldn't find the page you're looking for. It might have been repotted,
          pruned away, or the link might be misspelled.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Link to="/dashboard" className="btn-primary btn">
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link to="/library" className="btn-outline btn">
            <BookOpen className="w-4 h-4" />
            Explore Library
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200/60 w-full text-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go back to previous page
          </button>
        </div>
      </div>
    </div>
  );
}

