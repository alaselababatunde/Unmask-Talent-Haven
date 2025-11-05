import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Upload as UploadIcon, Video, Music, FileText, Languages, X } from 'lucide-react';

const Upload = () => {
  const { user } = useAuth();
  const [mediaType, setMediaType] = useState<'video' | 'audio' | 'text' | 'sign-language'>('video');
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('Other');
  const [textContent, setTextContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/feed', formData);
      return response.data;
    },
    onSuccess: () => {
      navigate('/feed');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Upload failed. Please try again.');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to upload');
      navigate('/profile');
      return;
    }
    setError('');
    setUploading(true);

    try {
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
      } else {
        throw new Error('Please select a file or enter text content');
      }

      await uploadMutation.mutateAsync(formData);
    } catch (err: any) {
      // Error is handled by mutation onError
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-matte-black pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-accent-beige mb-8">Upload Your Talent</h1>

        {!user && (
          <div className="mb-6 p-4 border border-deep-purple/30 rounded-2xl bg-deep-purple/10 text-accent-beige">
            You need to be signed in to upload. Use the Profile page to login or sign up.
            <button
              onClick={() => navigate('/profile')}
              className="ml-3 px-3 py-1 bg-deep-purple hover:bg-deep-purple/80 rounded-xl text-xs"
            >
              Go to Profile
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 rounded-2xl p-4">
              {error}
            </div>
          )}
          
          {!user && (
            <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-2xl p-4">
              Please sign in to upload. Go to Profile to login or sign up.
            </div>
          )}

          {/* Media Type Selection */}
          <div>
            <label className="block text-accent-beige/80 mb-3 text-sm font-semibold">Media Type</label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { type: 'video' as const, icon: Video, label: 'Video' },
                { type: 'audio' as const, icon: Music, label: 'Audio' },
                { type: 'text' as const, icon: FileText, label: 'Poetry' },
                { type: 'sign-language' as const, icon: Languages, label: 'Sign' },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setMediaType(type);
                    setFile(null);
                    setTextContent('');
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    mediaType === type
                      ? 'border-deep-purple bg-deep-purple/10 glow-purple text-deep-purple'
                      : 'border-deep-purple/30 bg-matte-black text-accent-beige/60 hover:border-deep-purple/50'
                  }`}
                >
                  <Icon className="mx-auto mb-2" size={24} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload or Text Input */}
          {mediaType === 'text' ? (
            <div>
              <label className="block text-accent-beige/80 mb-2 text-sm font-semibold">Your Poetry/Text</label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full h-48 p-4 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple focus:glow-purple resize-none"
                placeholder="Share your creative writing, poetry, or thoughts..."
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-accent-beige/80 mb-2 text-sm font-semibold">
                Upload {mediaType === 'video' ? 'Video' : mediaType === 'audio' ? 'Audio' : 'Sign Language Video'}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept={
                    mediaType === 'video' || mediaType === 'sign-language'
                      ? 'video/*'
                      : mediaType === 'audio'
                      ? 'audio/*'
                      : '*'
                  }
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-deep-purple/30 rounded-2xl cursor-pointer hover:border-deep-purple hover:bg-deep-purple/5 transition-all"
                >
                  <UploadIcon className="mb-4 text-deep-purple" size={48} />
                  <p className="text-accent-beige/80 mb-2">Click to upload or drag and drop</p>
                  <p className="text-accent-beige/60 text-xs">
                    {mediaType === 'video' || mediaType === 'sign-language'
                      ? 'MP4, WEBM (max 100MB)'
                      : 'MP3, WAV (max 50MB)'}
                  </p>
                </label>
                {file && (
                  <div className="mt-4 p-4 bg-deep-purple/10 border border-deep-purple/30 rounded-2xl flex items-center justify-between">
                    <span className="text-accent-beige text-sm">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Caption */}
          {mediaType !== 'text' && (
            <div>
              <label className="block text-accent-beige/80 mb-2 text-sm font-semibold">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full h-24 p-4 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple focus:glow-purple resize-none"
                placeholder="Write a caption for your talent..."
                maxLength={1000}
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-accent-beige/80 mb-2 text-sm font-semibold">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-4 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple focus:glow-purple"
              placeholder="dance, music, talent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-accent-beige/80 mb-2 text-sm font-semibold">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-4 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple focus:glow-purple"
            >
              <option value="Dance">Dance</option>
              <option value="Music">Music</option>
              <option value="Art">Art</option>
              <option value="Acting">Acting</option>
              <option value="Poetry">Poetry</option>
              <option value="Comedy">Comedy</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || (!file && mediaType !== 'text') || (mediaType === 'text' && !textContent)}
            className="w-full py-4 bg-deep-purple hover:bg-deep-purple/80 text-accent-beige rounded-2xl font-semibold transition-all glow-purple disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      <Navbar />
    </div>
  );
};

export default Upload;

