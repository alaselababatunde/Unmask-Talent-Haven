import { useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NotificationsPanel = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { notifications, fetchNotifications, markNotificationRead } = useAuth();

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="absolute right-4 bottom-16 w-80 bg-matte-black border border-deep-purple/30 rounded-2xl shadow-xl z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-deep-purple/10">
        <div className="flex items-center gap-2">
          <Bell className="text-accent-beige" />
          <span className="text-accent-beige font-semibold">Notifications</span>
        </div>
        <button onClick={onClose} className="p-1 text-accent-beige/60">
          <X />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-accent-beige/60">No notifications</div>
        ) : (
          notifications.map((n: any) => (
            <div key={n._id} className={`p-3 px-4 border-b border-deep-purple/10 ${n.read ? 'bg-matte-black' : 'bg-deep-purple/5'}`}>
              <div className="text-sm text-accent-beige">{n.message}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-accent-beige/60">{new Date(n.createdAt).toLocaleString()}</div>
                {!n.read && (
                  <button
                    onClick={() => markNotificationRead(n._id)}
                    className="text-xs px-2 py-1 bg-deep-purple text-accent-beige rounded-full"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
