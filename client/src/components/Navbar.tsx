import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, MessageCircle, User, Search, Bell } from 'lucide-react';
import { useState } from 'react';
import NotificationsPanel from './NotificationsPanel';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/feed' },
    { icon: Search, label: 'Discover', path: '/search' },
    { icon: Plus, label: 'Create', path: '/upload' },
    { icon: MessageCircle, label: 'Inbox', path: '/chat' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <>
      {/* Top Bar for Notifications - Mobile Only */}
      <div className="fixed top-6 right-6 z-50 md:hidden">
        <BellButton />
      </div>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-panel rounded-[2.5rem] z-50 px-2 py-2">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path === '/profile' && location.pathname.startsWith('/profile'));
            const isCreate = item.label === 'Create';

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center transition-all duration-300 relative group ${isCreate ? 'w-14 h-14' : 'w-12 h-12'
                  }`}
              >
                {isCreate ? (
                  <div className="w-full h-full bg-gradient-to-br from-neon-purple to-neon-blue rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(176,38,255,0.4)] transform transition-transform group-hover:scale-110 group-active:scale-90">
                    <Icon size={24} className="text-black" />
                  </div>
                ) : (
                  <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
                    }`}>
                    <Icon size={22} className={isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''} />
                    {isActive && (
                      <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]" />
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

const BellButton = () => {
  const { notifications } = useAuth();
  const [open, setOpen] = useState(false);

  const unread = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-3 rounded-full bg-black/40 backdrop-blur border border-white/10 hover:bg-deep-purple/20 transition-all shadow-lg"
      >
        <Bell className="text-accent-beige" size={20} />
        {unread > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-deep-purple opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-deep-purple text-[10px] text-white items-center justify-center font-bold">
              {unread > 9 ? '9+' : unread}
            </span>
          </span>
        )}
      </button>
      <NotificationsPanel open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default Navbar;

