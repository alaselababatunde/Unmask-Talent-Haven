import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Navbar from '../components/Navbar';
import { User as UserIcon, Image as ImageIcon, Save } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/profile');
      return;
    }
    // Preload current profile
    (async () => {
      try {
        const res = await api.get(`/user/${user.id}`);
        setUsername(res.data.user.username || '');
        setBio(res.data.user.bio || '');
      } catch (e: any) {
        // ignore
      }
    })();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const form = new FormData();
      form.append('username', username);
      form.append('bio', bio);
      if (avatarFile) form.append('profileImage', avatarFile);

      await api.put(`/user/${user.id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Profile updated');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-matte-black pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-accent-beige">Settings</h1>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-matte-black border border-deep-purple/30 hover:border-deep-purple text-accent-beige rounded-2xl text-sm"
          >
            Back to Profile
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-500/20 border border-red-500 text-red-300 rounded-2xl p-3">{error}</div>}
          {success && <div className="bg-green-500/20 border border-green-500 text-green-200 rounded-2xl p-3">{success}</div>}

          <div>
            <label className="block text-accent-beige/80 mb-2 text-sm">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-deep-purple" size={20} />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple"
                placeholder="username"
                minLength={3}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-accent-beige/80 mb-2 text-sm">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full h-28 p-3 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple resize-none"
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-accent-beige/80 mb-2 text-sm">Profile Image</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 border border-deep-purple/30 rounded-2xl text-accent-beige cursor-pointer hover:border-deep-purple">
                <ImageIcon size={18} className="text-deep-purple" />
                <span>Choose file</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setAvatarFile(e.target.files[0]);
                  }}
                />
              </label>
              {avatarFile && <span className="text-accent-beige/70 text-sm">{avatarFile.name}</span>}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-3 bg-deep-purple hover:bg-deep-purple/80 text-accent-beige rounded-2xl font-semibold disabled:opacity-50"
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <Navbar />
    </div>
  );
};

export default Settings;


