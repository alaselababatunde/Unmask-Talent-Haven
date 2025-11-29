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
      <div className="fixed top-0 right-0 p-4 z-50 md:hidden">
        <BellButton />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-matte-black/90 backdrop-blur-lg border-t border-white/10 z-50 pb-safe">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex justify-between items-center py-2">
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
                      ? 'text-deep-purple'
                      : 'text-accent-beige/60 hover:text-accent-beige'
                    }`}
                >
                  {isActive && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-deep-purple rounded-b-full shadow-[0_0_10px_rgba(147,51,234,0.5)]" />
                  )}

                  {isCreate ? (
                    <div className="bg-gradient-to-br from-deep-purple to-[#7B4B27] p-3 rounded-full -mt-8 shadow-lg shadow-deep-purple/30 border-4 border-matte-black transform transition-transform group-hover:scale-110 group-active:scale-95">
                      <Icon size={24} className="text-white" />
                    </div>
                  ) : (
                    <div className={`p-1 transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                      <Icon size={24} className={isActive ? 'drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]' : ''} />
                    </div>
                  )}

                  <span className={`text-[10px] font-medium transition-opacity ${isCreate ? 'mt-1' : ''} ${isActive ? 'opacity-100' : 'opacity-70'}`}>
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

