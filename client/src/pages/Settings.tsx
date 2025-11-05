import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Lock, Shield, Share2, Bell, Radio, Music, Clock } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: Lock, label: 'Privacy', onClick: () => {} },
        { icon: Shield, label: 'Security and permissions', onClick: () => {} },
        { icon: Share2, label: 'Share profile', onClick: () => {} },
      ],
    },
    {
      title: 'Content & display',
      items: [
        { icon: Bell, label: 'Notifications', onClick: () => {} },
        { icon: Radio, label: 'LIVE', onClick: () => navigate('/live') },
        { icon: Music, label: 'Music', onClick: () => {} },
        { icon: Clock, label: 'Activity centre', onClick: () => {} },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-matte-black pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/profile')} className="text-accent-beige">
              ←
            </button>
            <h1 className="text-3xl font-bold text-accent-beige">Settings and privacy</h1>
          </div>
        </div>

        {settingsSections.map((section, idx) => (
          <div key={idx} className="mb-8">
            <h2 className="text-accent-beige/60 text-sm font-semibold mb-3 uppercase">{section.title}</h2>
            <div className="bg-matte-black border border-deep-purple/20 rounded-2xl overflow-hidden">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIdx}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between p-4 hover:bg-deep-purple/5 transition border-b border-deep-purple/10 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="text-deep-purple" size={20} />
                      <span className="text-accent-beige">{item.label}</span>
                    </div>
                    <span className="text-accent-beige/40">→</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Navbar />
    </div>
  );
};

export default Settings;
