import { useState, useEffect } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getGreeting, format } from '@/lib/dateUtils';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import { demoNotificationsStore } from '@/lib/demoStore';
import { isDemoMode } from '@/lib/supabase';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      if (isDemoMode) {
        setUnreadCount(demoNotificationsStore.getUnreadCount());
      }
    };

    updateCount();
    const interval = setInterval(updateCount, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Refresh count when panel closes
  const handlePanelClose = () => {
    setNotifOpen(false);
    if (isDemoMode) {
      setUnreadCount(demoNotificationsStore.getUnreadCount());
    }
  };

  const firstName = user?.profile?.full_name?.split(' ')[0] || 'Gardener';

  return (
    <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-primary-50 flex items-center px-4 gap-3 sticky top-0 z-20">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-mint transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5 text-primary" />
      </button>

      {/* Greeting */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-darkText truncate">
          {getGreeting()}, {firstName}! 🌿
        </h1>
        <p className="text-xs text-muted">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl hover:bg-mint transition-colors"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <Bell className="w-5 h-5 text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error text-white text-xs rounded-full flex items-center justify-center font-medium leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotificationPanel
              onClose={handlePanelClose}
              onUnreadChange={setUnreadCount}
            />
          )}
        </div>
      </div>
    </header>
  );
}
