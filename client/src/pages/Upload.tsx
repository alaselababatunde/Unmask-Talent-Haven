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
      const serverMessage = err.response?.data?.message;
      const serverDetails = err.response?.data?.details;
      const errorMsg = serverMessage || err.message || 'Upload failed';
      
      // Provide specific error messages
      if (errorMsg.includes('Cloudinary') || errorMsg.includes('cloud')) {
        setError('⚠️ Video storage not configured. Please set up Cloudinary credentials in server/.env file.');
      } else if (errorMsg.includes('size') || errorMsg.includes('large')) {
        setError('File is too large. Please upload a smaller file (max 100MB for video, 50MB for audio).');
      } else if (errorMsg.includes('format') || errorMsg.includes('type')) {
        setError('Invalid file format. Please upload a valid video or audio file.');
      } else if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        // Attach any server-provided details to the displayed message for easier debugging
        setError(serverDetails ? `${errorMsg} (${serverDetails})` : errorMsg);
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
      const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/mp4', 'audio/ogg'];
      const validTypes = mediaType === 'video' || mediaType === 'sign-language' ? validVideoTypes : validAudioTypes;
      
      if (!validTypes.includes(selectedFile.type)) {
        const expected = mediaType === 'video' || mediaType === 'sign-language' 
          ? 'MP4, WEBM, MOV' 
          : 'MP3, WAV, AAC';
        setError(`Invalid file format. Please upload a ${expected} file.`);
        return;
      }
      
      // Validate file size
      const maxSize = mediaType === 'video' || mediaType === 'sign-language' ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        return;
      }
      
      setFile(selectedFile);
      setError('');
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
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('mediaType', mediaType);
      formData.append('caption', caption);
      formData.append('tags', tags);
      formData.append('category', category);

      if (mediaType === 'text') {
        if (!textContent.trim()) {
          throw new Error('Please enter your text content');
        }
        formData.append('mediaUrl', textContent);
        formData.append('caption', textContent);
      } else {
        if (!file) {
          throw new Error('Please select a file to upload');
        }
        formData.append('media', file);
      }

      await uploadMutation.mutateAsync(formData);
    } catch (err: any) {
      if (!uploadMutation.isError) {
        setError(err.message || 'Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-matte-black pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-accent-beige mb-8">Upload Your Talent</h1>

        {!user && (
          <div className="mb-6 p-4 border border-yellow-500/50 rounded-2xl bg-yellow-500/10 text-yellow-200 flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold mb-1">Sign in required</p>
              <p className="text-sm">You need to be signed in to upload content.</p>
              <button
                onClick={() => navigate('/profile')}
                className="mt-2 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl text-sm font-semibold transition"
              >
                Go to Profile
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Upload Error</p>
                <p className="text-sm">{error}</p>
                {error.includes('Cloudinary') && (
                  <div className="mt-3 p-3 bg-red-500/10 rounded-xl text-xs">
                    <p className="font-semibold mb-1">For developers:</p>
                    <p>1. Sign up at cloudinary.com</p>
                    <p>2. Get your credentials from the dashboard</p>
                    <p>3. Update server/.env with your actual credentials</p>
                  </div>
                )}
              </div>
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
                    setError('');
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
              <p className="text-accent-beige/40 text-xs mt-2">
                {textContent.length} / 1000 characters
              </p>
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
                      ? 'video/mp4,video/webm,video/quicktime'
                      : 'audio/mpeg,audio/wav,audio/mp3'
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
                  <div className="mt-4 p-4 bg-deep-purple/10 border border-deep-purple/30 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-accent-beige text-sm font-medium">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <p className="text-accent-beige/60 text-xs">
                      Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
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
              <p className="text-accent-beige/40 text-xs mt-2">
                {caption.length} / 1000 characters
              </p>
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

          {/* Upload Progress */}
          {uploading && uploadProgress > 0 && (
            <div className="bg-deep-purple/10 border border-deep-purple/30 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-accent-beige text-sm">Uploading...</span>
                <span className="text-deep-purple font-semibold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-matte-black rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-deep-purple h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !user || (!file && mediaType !== 'text') || (mediaType === 'text' && !textContent.trim())}
            className="w-full py-4 bg-deep-purple hover:bg-deep-purple/80 text-accent-beige rounded-2xl font-semibold transition-all glow-purple disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-accent-beige/30 border-t-accent-beige rounded-full animate-spin" />
                Uploading... {uploadProgress}%
              </>
            ) : (
              <>
                <UploadIcon size={20} />
                Upload
              </>
            )}
          </button>
        </form>
      </div>

      <Navbar />
    </div>
  );
};

export default Upload;
