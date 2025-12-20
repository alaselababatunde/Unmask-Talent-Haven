import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Lock, Shield, Share2, Bell, Radio, Music, Clock, LogOut, ArrowLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/profile');
  };

  const handleShareProfile = () => {
    if (user?.id) {
      const profileUrl = `${window.location.origin}/profile/${user.id}`;
      if (navigator.share) {
        navigator.share({
          title: `${user.username}'s Profile`,
          text: `Check out ${user.username}'s profile on Unmask Talent Haven`,
          url: profileUrl,
        }).catch(() => {
          navigator.clipboard.writeText(profileUrl);
          alert('Profile link copied to clipboard!');
        });
      } else {
        navigator.clipboard.writeText(profileUrl);
        alert('Profile link copied to clipboard!');
      }
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: Lock, label: 'Privacy', onClick: () => navigate('/settings/privacy'), color: 'text-neon-purple' },
        { icon: Shield, label: 'Security & Permissions', onClick: () => navigate('/settings/security'), color: 'text-neon-blue' },
        { icon: Share2, label: 'Share Profile', onClick: handleShareProfile, color: 'text-white/40' },
      ],
    },
    {
      title: 'Content & Display',
      items: [
        { icon: Bell, label: 'Notifications', onClick: () => navigate('/settings/notifications'), color: 'text-neon-purple' },
        { icon: Radio, label: 'Go Live', onClick: () => navigate('/live'), color: 'text-red-500' },
      ],
    },
  ];

  return (
    <div className="h-[100dvh] w-full bg-primary flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/profile')} className="p-3 glass-button rounded-full text-white/40 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold font-display tracking-tight">Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar relative z-10">
        {settingsSections.map((section, idx) => (
          <div key={idx} className="mb-10">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4 mb-4">{section.title}</h2>
            <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIdx}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between p-6 hover:bg-white/5 active:bg-white/10 transition-all border-b border-white/5 last:border-b-0 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={item.color} size={20} />
                      </div>
                      <span className="text-sm font-bold text-white/80">{item.label}</span>
                    </div>
                    <ChevronRight className="text-white/10 group-hover:text-white/40 transition-colors" size={18} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout Section */}
        <div className="mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4 mb-4">Account Actions</h2>
          <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-6 hover:bg-red-500/10 active:bg-red-500/15 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LogOut className="text-red-500" size={20} />
                </div>
                <span className="text-sm font-bold text-red-500">Logout</span>
              </div>
              <ChevronRight className="text-red-500/20 group-hover:text-red-500/40 transition-colors" size={18} />
            </button>
          </div>
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default Settings;
