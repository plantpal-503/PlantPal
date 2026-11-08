import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  ClipboardList,
  CalendarDays,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const mobileNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/plants', icon: Sprout, label: 'Plants' },
  { to: '/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/analytics', icon: BarChart3, label: 'Stats' },
];

export default function MobileNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-primary-50 z-30 lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex">
        {mobileNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn('p-1 rounded-lg transition-colors', isActive && 'bg-mint')}>
                  <Icon className="w-5 h-5" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}
