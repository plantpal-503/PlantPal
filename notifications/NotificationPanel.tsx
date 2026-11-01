import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { demoNotificationsStore } from '@/lib/demoStore';
import type { Notification } from '@/types';
import { formatDistanceToNow, parseISO } from '@/lib/dateUtils';
import { cn } from '@/lib/cn';
import EmptyState from '@/components/common/EmptyState';

interface NotificationPanelProps {
  onClose: () => void;
  onUnreadChange: (count: number) => void;
}

const typeColors: Record<string, string> = {
  care_reminder: 'bg-blue-50 text-blue-600',
  overdue_task: 'bg-red-50 text-error',
  info: 'bg-mint text-primary',
  health_alert: 'bg-amber-50 text-amber-600',
};

const typeIcons: Record<string, string> = {
  care_reminder: '💧',
  overdue_task: '⚠️',
  info: '✅',
  health_alert: '🌿',
};

export default function NotificationPanel({ onClose, onUnreadChange }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(demoNotificationsStore.getAll());

    // Close on outside click
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const refresh = () => {
    const updated = demoNotificationsStore.getAll();
    setNotifications(updated);
    onUnreadChange(demoNotificationsStore.getUnreadCount());
  };

  const handleMarkRead = (id: string) => {
    demoNotificationsStore.markRead(id);
    refresh();
  };

  const handleMarkAllRead = () => {
    demoNotificationsStore.markAllRead();
    refresh();
  };

  const handleDelete = (id: string) => {
    demoNotificationsStore.delete(id);
    refresh();
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-primary-50 z-50 animate-slide-up overflow-hidden"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-primary-50">
        <h2 className="font-semibold text-darkText text-sm">Notifications</h2>
        <div className="flex items-center gap-1">
          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-muted hover:text-primary flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-mint transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-3 h-3" />
              All read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-8 h-8" />}
            title="No notifications"
            description="You're all caught up! Notifications will appear here."
            className="py-8"
          />
        ) : (
          <ul className="divide-y divide-gray-50">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className={cn(
                  'px-4 py-3 hover:bg-gray-50 transition-colors group',
                  !notif.is_read && 'bg-mint/30'
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn('text-lg flex-shrink-0 mt-0.5', typeColors[notif.notification_type])}
                    aria-hidden="true"
                  >
                    {typeIcons[notif.notification_type] || '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-darkText leading-snug">
                      {notif.title}
                      {!notif.is_read && (
                        <span className="inline-block w-2 h-2 bg-primary rounded-full ml-1.5 align-middle" aria-label="Unread" />
                      )}
                    </p>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-muted/70 mt-1">
                      {formatDistanceToNow(parseISO(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="p-1 rounded hover:bg-mint transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-3 h-3 text-primary" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-1 rounded hover:bg-red-50 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3 h-3 text-error" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
