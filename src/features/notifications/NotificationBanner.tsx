import React from 'react';
import { X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

export interface Notification {
  _id: string;
  userId: string;
  type: 'rejection' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: 'booking-request' | 'room' | 'booking';
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}

interface NotificationBannerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'rejection':
        return <AlertCircle className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'rejection':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'rejection':
        return 'text-red-500';
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className="space-y-3 mb-6">
      {notifications.map((notification) => (
        <div
          key={notification._id}
          className={`${getStyles(notification.type)} border-l-4 rounded-lg p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300`}
        >
          <div className="flex items-start gap-3">
            <div className={`${getIconColor(notification.type)} mt-0.5`}>
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm mb-1">{notification.title}</h3>
              <p className="text-sm opacity-90">{notification.message}</p>
              {notification.createdAt && (
                <p className="text-xs opacity-60 mt-2">
                  {new Date(notification.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </p>
              )}
            </div>
            <button
              onClick={() => onDismiss(notification._id)}
              className="p-1 rounded-lg hover:bg-black/10 transition-colors flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
