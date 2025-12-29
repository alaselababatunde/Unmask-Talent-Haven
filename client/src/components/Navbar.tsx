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
    <nav className="w-full h-16 flex items-center justify-around bg-black text-white relative">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path ||
          (item.path === '/profile' && location.pathname.startsWith('/profile'));
        const isCreate = item.label === 'Create';

        return (
          <Link
            key={item.path}
            to={item.path || '#'}
            className={`flex flex-col items-center justify-center transition-all duration-300 relative group ${isCreate ? '-mt-6' : ''}`}
          >
            {isCreate ? (
              <div className="w-14 h-14 bg-gradient-to-br from-neon-purple to-neon-blue rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(176,38,255,0.4)] transform transition-transform group-hover:scale-110 group-active:scale-90 border-4 border-black">
                <Icon size={24} className="text-black" />
              </div>
            ) : (
              <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
                <Icon size={24} className={isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navbar;

