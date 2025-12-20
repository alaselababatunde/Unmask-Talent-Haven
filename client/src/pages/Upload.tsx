import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

import { useAuth } from '../context/AuthContext';
import { Upload as UploadIcon, Video, Music, FileText, Languages, X, AlertCircle } from 'lucide-react';

const Upload = () => {
  const { user } = useAuth();
  const [mediaType, setMediaType] = useState<'video' | 'audio' | 'text' | 'sign-language'>('video');
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('Other');
  const [textContent, setTextContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/feed', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });
      return response.data;
    },
    onSuccess: () => {
      navigate('/feed');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Upload failed');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate('/profile');

    setUploading(true);
    const formData = new FormData();
    formData.append('mediaType', mediaType);
    formData.append('caption', caption);
    formData.append('tags', tags);
    formData.append('category', category);

    if (mediaType === 'text') {
      formData.append('mediaUrl', textContent);
      formData.append('caption', textContent);
    } else if (file) {
      formData.append('media', file);
    }

    uploadMutation.mutate(formData);
  };

  return (
    <div className="h-[100dvh] w-full bg-primary overflow-hidden relative flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-between z-20">
        <button onClick={() => navigate(-1)} className="p-2 glass-button rounded-full">
          <X size={24} />
        </button>
        <h1 className="text-xl font-bold font-display">Create</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-lg mx-auto">
          {/* Media Type Tabs */}
          <div className="flex bg-obsidian/50 p-1.5 rounded-2xl border border-white/5">
            {(['video', 'audio', 'text', 'sign-language'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMediaType(type)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mediaType === type ? 'bg-neon-purple text-black shadow-lg shadow-neon-purple/20' : 'text-white/40'
                  }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Upload Area */}
          <div className="relative group">
            {mediaType === 'text' ? (
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Write your masterpiece..."
                className="w-full h-64 bg-obsidian/40 border border-white/10 rounded-[2.5rem] p-8 text-xl focus:outline-none focus:border-neon-purple transition-all resize-none"
              />
            ) : (
              <label className="block w-full h-80 bg-obsidian/40 border-2 border-dashed border-white/10 rounded-[2.5rem] relative cursor-pointer hover:border-neon-purple/50 transition-all overflow-hidden">
                <input type="file" className="hidden" onChange={handleFileChange} />
                {file ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6">
                    <div className="w-20 h-20 bg-neon-purple/20 rounded-full flex items-center justify-center mb-4">
                      <UploadIcon className="text-neon-purple" size={32} />
                    </div>
                    <p className="text-lg font-bold truncate max-w-full px-4">{file.name}</p>
                    <p className="text-white/40 text-sm mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                      <UploadIcon className="text-white/40" size={32} />
                    </div>
                    <p className="text-lg font-bold">Tap to upload</p>
                    <p className="text-white/40 text-sm mt-2">MP4, WebM or MP3</p>
                  </div>
                )}
              </label>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-white/40 uppercase tracking-widest mb-3">Caption</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-obsidian/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-neon-purple transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-white/40 uppercase tracking-widest mb-3">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-obsidian/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-neon-purple transition-all appearance-none"
                >
                  {['Dance', 'Music', 'Art', 'Acting', 'Poetry', 'Comedy', 'Other'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-white/40 uppercase tracking-widest mb-3">Tags</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="#talent"
                  className="w-full bg-obsidian/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-neon-purple transition-all"
                />
              </div>
            </div>
          </div>

          {/* Progress */}
          {uploading && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-neon-purple">Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neon-purple transition-all duration-300 shadow-[0_0_15px_rgba(176,38,255,0.5)]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading || (!file && mediaType !== 'text')}
            className="w-full py-5 bg-neon-purple text-black rounded-[2rem] font-bold text-lg shadow-xl shadow-neon-purple/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            {uploading ? 'Processing...' : 'Post Now'}
          </button>
        </form>
      </div>

      <Navbar />
    </div>
  );
};

export default Upload;
