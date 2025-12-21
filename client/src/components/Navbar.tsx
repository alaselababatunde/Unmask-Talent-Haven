import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, MessageCircle, User, Search } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/feed' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Plus, label: 'Create', path: '/upload' },
    { icon: MessageCircle, label: 'Chat', path: '/chat' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <>
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-lg glass-panel rounded-[2.5rem] z-50 px-2 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path === '/profile' && location.pathname.startsWith('/profile'));
            const isCreate = item.label === 'Create';

            return (
              <Link
                key={item.path}
                to={item.path || '#'}
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

export default Navbar;

