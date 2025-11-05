import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, MessageCircle, User, Users } from 'lucide-react';

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
    </nav>
  );
};

export default Navbar;

