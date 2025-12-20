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
    <>
      {/* Top Bar for Notifications - Mobile Only */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <BellButton />
      </div>

      <nav className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl glass-panel rounded-3xl z-50 pb-safe">
        <div className="px-2">
          <div className="flex justify-between items-center py-3 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path === '/profile' && location.pathname.startsWith('/profile'));
              const isCreate = item.label === 'Create';

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 relative group ${isActive
                    ? 'text-neon-purple'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {isActive && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-neon-purple rounded-b-full shadow-[0_0_15px_#B026FF]" />
                  )}

                  {isCreate ? (
                    <div className="bg-gradient-to-br from-neon-purple to-neon-blue p-3 rounded-full -mt-10 shadow-[0_0_20px_rgba(176,38,255,0.4)] border-4 border-matte-black transform transition-transform group-hover:scale-110 group-active:scale-95">
                      <Icon size={24} className="text-black" />
                    </div>
                  ) : (
                    <div className={`p-1 transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                      <Icon size={24} className={isActive ? 'drop-shadow-[0_0_10px_rgba(176,38,255,0.6)]' : ''} />
                    </div>
                  )}

                  <span className={`text-[10px] font-medium transition-opacity ${isCreate ? 'mt-1' : ''} ${isActive ? 'opacity-100 text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue' : 'opacity-70'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
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

