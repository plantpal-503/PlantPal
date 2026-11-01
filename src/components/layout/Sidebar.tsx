import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/cn';
import {
  Leaf,
  LayoutDashboard,
  Sprout,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Heart,
  BookMarked,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/plants', icon: Sprout, label: 'My Plants' },
  { to: '/tasks', icon: ClipboardList, label: 'Care Tasks' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/library', icon: BookOpen, label: 'Plant Library' },
  { to: '/health', icon: Heart, label: 'Plant Health' },
  { to: '/journal', icon: BookMarked, label: 'Growth Journal' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export default function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-white border-r border-primary-50 z-40 flex flex-col transition-all duration-300',
          'shadow-card',
          isCollapsed ? 'w-16' : 'w-64',
          // Mobile: slide in/out
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-primary-50',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-2" onClick={onClose}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-primary text-lg">PlantPal</span>
            </Link>
          )}
          {isCollapsed && (
            <Link to="/dashboard" onClick={onClose}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
            </Link>
          )}

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4 text-muted" />
          </button>

          {/* Desktop collapse */}
          <button
            onClick={onToggleCollapse}
            className={cn('hidden lg:flex p-1 rounded-lg hover:bg-gray-100', isCollapsed && 'hidden')}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className="w-4 h-4 text-muted" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={cn(
                  'nav-item group',
                  isActive ? 'nav-item-active' : 'nav-item-inactive',
                  isCollapsed && 'justify-center px-2'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={isCollapsed ? label : undefined}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-primary' : 'text-muted group-hover:text-primary')} />
                {!isCollapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-primary-50 space-y-1">
          <Link
            to="/settings"
            onClick={onClose}
            className={cn(
              'nav-item group',
              location.pathname === '/settings' ? 'nav-item-active' : 'nav-item-inactive',
              isCollapsed && 'justify-center px-2'
            )}
            title={isCollapsed ? 'Settings' : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0 text-muted group-hover:text-primary" />
            {!isCollapsed && <span>Settings</span>}
          </Link>

          {!isCollapsed && (
            <div className="px-3 py-2 bg-mint rounded-xl">
              <p className="text-xs font-medium text-primary truncate">
                {user?.profile?.full_name || user?.email || 'User'}
              </p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              'nav-item w-full text-error hover:bg-red-50 group',
              isCollapsed && 'justify-center px-2'
            )}
            title={isCollapsed ? 'Sign out' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle (bottom) */}
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center h-10 border-t border-primary-50 hover:bg-mint transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4 text-muted" />
          </button>
        )}
      </aside>
    </>
  );
}
