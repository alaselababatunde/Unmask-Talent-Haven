import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, MessageCircle, User, Users, Bell } from 'lucide-react';
import { useState } from 'react';
import NotificationsPanel from './NotificationsPanel';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/feed' },
    { icon: Users, label: 'Supporters', path: '/supporters' },
    { icon: Plus, label: 'Create', path: '/upload' },
    { icon: MessageCircle, label: 'Chat', path: '/chat' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-matte-black border-t border-deep-purple/30 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center py-3">
          <div className="absolute left-4 top-2 z-50">
            {/* placeholder for left-side items if needed */}
          </div>
          <div className="absolute right-4 top-2 z-50">
            <BellButton />
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === '/profile' && location.pathname.startsWith('/profile'));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${
                  isActive
                    ? 'text-deep-purple glow-purple bg-deep-purple/10'
                    : 'text-accent-beige/60 hover:text-accent-beige hover:bg-deep-purple/5'
                }`}
              >
                <Icon size={item.label === 'Create' ? 28 : 20} />
                <span className="text-xs font-medium">{item.label === 'Create' ? '' : item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <NotificationsPanelWrapper />
    </nav>
  );
};

const NotificationsPanelWrapper = () => {
  const { notifications } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="absolute right-6 -top-10">
        {/* panel is rendered via NotificationsPanel component when open */}
      </div>
      <NotificationsPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
};

const BellButton = () => {
  const { notifications } = useAuth();
  const [open, setOpen] = useState(false);

  const unread = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="p-2 rounded-full hover:bg-deep-purple/10 transition">
        <Bell className="text-accent-beige" size={20} />
      </button>
      {unread > 0 && (
        <div className="absolute -top-1 -right-1 bg-deep-purple text-accent-beige rounded-full w-5 h-5 text-xs flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </div>
      )}
      <NotificationsPanel open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default Navbar;

