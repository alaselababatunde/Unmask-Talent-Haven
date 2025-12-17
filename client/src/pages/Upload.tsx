import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import GenerateImage from '../components/GenerateImage';
import { useAuth } from '../context/AuthContext';
import { Upload as UploadIcon, Video, Music, FileText, Languages, X, AlertCircle, Sparkles } from 'lucide-react';

const Upload = () => {
  const { user } = useAuth();
  const [mediaType, setMediaType] = useState<'video' | 'audio' | 'text' | 'sign-language' | 'ai-art'>('video');
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
      if (errorMsg.includes('Cloudinary') || errorMsg.includes('cloud') || (serverDetails && JSON.stringify(serverDetails).includes('Cloudinary'))) {
        setError('⚠️ Video storage not configured. Please set up Cloudinary credentials in server/.env file.');
      } else if (errorMsg.includes('size') || errorMsg.includes('large')) {
        setError('File is too large. Please upload a smaller file (max 100MB for video, 50MB for audio).');
      } else if (errorMsg.includes('format') || errorMsg.includes('type')) {
        setError('Invalid file format. Please upload a valid video or audio file.');
      } else if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        // Attach any server-provided details to the displayed message for easier debugging
        setError(serverDetails ? `${errorMsg} (${typeof serverDetails === 'object' ? JSON.stringify(serverDetails) : serverDetails})` : errorMsg);
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
    <div className="min-h-screen bg-matte-black pb-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-deep-purple/20 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-deep-purple/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 py-12 relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-beige to-white mb-3">
            Share Your Talent
          </h1>
          <p className="text-accent-beige/60 text-lg">
            Upload your masterpiece and let the world see what you can do.
          </p>
        </div>

        {!user && (
          <div className="mb-8 p-6 border border-yellow-500/30 rounded-2xl bg-yellow-500/5 backdrop-blur-sm text-yellow-200 flex items-start gap-4 animate-slide-up">
            <div className="p-2 bg-yellow-500/20 rounded-xl">
              <AlertCircle size={24} className="text-yellow-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Sign in required</h3>
              <p className="text-yellow-200/80 mb-4">You need to be signed in to upload content and share your talent with the community.</p>
              <button
                onClick={() => navigate('/profile')}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold transition-all transform hover:scale-105"
              >
                Go to Profile
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 glass-panel p-8 rounded-3xl shadow-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-red-500" />
              <div className="flex-1">
                <p className="font-semibold mb-1">Upload Error</p>
                <p className="text-sm opacity-90">{error}</p>
                {error.includes('Cloudinary') && (
                  <div className="mt-3 p-3 bg-black/30 rounded-xl text-xs font-mono border border-white/5">
                    <p className="font-bold text-red-400 mb-1">Dev Note:</p>
                    <p>1. Check server/.env for CLOUDINARY_* credentials</p>
                    <p>2. Ensure Cloudinary account is active</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Media Type Selection */}
          <div>
            <label className="block text-accent-beige/90 mb-4 text-lg font-bold">What are you uploading?</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: 'video' as const, icon: Video, label: 'Video', desc: 'MP4, WebM' },
                { type: 'audio' as const, icon: Music, label: 'Audio', desc: 'MP3, WAV' },
                { type: 'text' as const, icon: FileText, label: 'Poetry', desc: 'Written Art' },
                { type: 'sign-language' as const, icon: Languages, label: 'Sign', desc: 'Visual Lang' },
                { type: 'ai-art' as const, icon: Sparkles, label: 'AI Art', desc: 'Generate' },
              ].map(({ type, icon: Icon, label, desc }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setMediaType(type);
                    setFile(null);
                    setTextContent('');
                    setError('');
                  }}
                  className={`relative group p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${mediaType === type
                    ? 'border-deep-purple bg-deep-purple/20 shadow-[0_0_30px_rgba(90,42,131,0.3)]'
                    : 'border-white/10 bg-white/5 hover:border-deep-purple/50 hover:bg-white/10'
                    }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-deep-purple/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity ${mediaType === type ? 'opacity-100' : ''}`} />
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className={`p-3 rounded-xl mb-3 transition-colors ${mediaType === type ? 'bg-deep-purple text-white' : 'bg-white/10 text-accent-beige/70 group-hover:text-accent-beige'}`}>
                      <Icon size={24} />
                    </div>
                    <span className={`font-bold mb-1 ${mediaType === type ? 'text-white' : 'text-accent-beige/80'}`}>{label}</span>
                    <span className="text-[10px] text-accent-beige/40 uppercase tracking-wider">{desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>



          {/* AI Generation Interface */}
          {mediaType === 'ai-art' ? (
            <GenerateImage />
          ) : (
            <>
              {/* File Upload or Text Input */}
              <div className="animate-fade-in">
                {mediaType === 'text' ? (
                  <div>
                    <label className="block text-accent-beige/90 mb-2 text-lg font-bold">Your Masterpiece</label>
                    <div className="relative">
                      <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        className="w-full h-64 p-6 bg-black/40 border border-white/10 rounded-2xl text-accent-beige placeholder:text-accent-beige/20 focus:outline-none focus:border-deep-purple focus:ring-1 focus:ring-deep-purple/50 transition-all resize-none text-lg leading-relaxed"
                        placeholder="Pour your heart out here..."
                        required
                      />
                      <div className="absolute bottom-4 right-4 text-xs text-accent-beige/40 bg-black/60 px-2 py-1 rounded-lg backdrop-blur-sm">
                        {textContent.length} / 1000
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-accent-beige/90 mb-2 text-lg font-bold">
                      Upload File
                    </label>
                    <div className="relative group">
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
                        required={!file}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`flex flex-col items-center justify-center w-full min-h-[16rem] border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 overflow-hidden relative ${file
                          ? 'border-green-500/50 bg-black/40'
                          : 'border-white/10 hover:border-deep-purple hover:bg-deep-purple/5'
                          }`}
                      >
                        {file ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4">
                            {/* Preview Section */}
                            <div className="w-full max-h-[400px] mb-4 rounded-xl overflow-hidden bg-black/50 shadow-2xl border border-white/5">
                              {(mediaType === 'video' || mediaType === 'sign-language') ? (
                                <video
                                  src={URL.createObjectURL(file)}
                                  controls
                                  className="w-full h-full object-contain max-h-[400px]"
                                />
                              ) : (
                                <div className="p-8 flex flex-col items-center justify-center bg-gradient-to-br from-deep-purple/20 to-transparent w-full">
                                  <div className="w-20 h-20 bg-deep-purple/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                    <Music size={40} className="text-deep-purple" />
                                  </div>
                                  <audio
                                    src={URL.createObjectURL(file)}
                                    controls
                                    className="w-full max-w-md"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="text-center animate-fade-in">
                              <div className="flex items-center justify-center gap-2 text-green-400 mb-1">
                                <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                                  <UploadIcon size={12} />
                                </div>
                                <p className="font-bold text-lg">Ready to Upload</p>
                              </div>
                              <p className="text-accent-beige/80 text-sm font-medium">{file.name}</p>
                              <p className="text-accent-beige/40 text-xs mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center group-hover:scale-105 transition-transform duration-300 p-8">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-deep-purple/10 to-transparent border border-white/5 text-deep-purple rounded-full flex items-center justify-center mb-6 group-hover:bg-deep-purple group-hover:text-white group-hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all duration-500">
                              <UploadIcon size={40} />
                            </div>
                            <p className="text-accent-beige font-bold text-2xl mb-2">Drop your file here</p>
                            <p className="text-accent-beige/50 text-base mb-6">or click to browse your files</p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-xs text-accent-beige/40 border border-white/5 font-mono">
                              {mediaType === 'video' || mediaType === 'sign-language'
                                ? (
                                  <>
                                    <Video size={12} />
                                    <span>Max 100MB • MP4, WEBM</span>
                                  </>
                                )
                                : (
                                  <>
                                    <Music size={12} />
                                    <span>Max 50MB • MP3, WAV</span>
                                  </>
                                )}
                            </div>
                          </div>
                        )}
                      </label>
                      {file && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setFile(null);
                          }}
                          className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-500/80 text-white/80 hover:text-white rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10 z-10"
                          title="Remove file"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Caption */}
                {mediaType !== 'text' && (
                  <div>
                    <label className="block text-accent-beige/90 mb-2 text-sm font-bold uppercase tracking-wider">Caption</label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full h-32 p-4 bg-black/40 border border-white/10 rounded-2xl text-accent-beige placeholder:text-accent-beige/20 focus:outline-none focus:border-deep-purple focus:ring-1 focus:ring-deep-purple/50 transition-all resize-none"
                      placeholder="Tell us about this..."
                      maxLength={1000}
                    />
                  </div>
                )}

                <div className="space-y-6">
                  {/* Tags */}
                  <div>
                    <label className="block text-accent-beige/90 mb-2 text-sm font-bold uppercase tracking-wider">Tags</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-accent-beige placeholder:text-accent-beige/20 focus:outline-none focus:border-deep-purple focus:ring-1 focus:ring-deep-purple/50 transition-all"
                      placeholder="#talent #art #creative"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-accent-beige/90 mb-2 text-sm font-bold uppercase tracking-wider">Category</label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple focus:ring-1 focus:ring-deep-purple/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="Dance">Dance</option>
                        <option value="Music">Music</option>
                        <option value="Art">Art</option>
                        <option value="Acting">Acting</option>
                        <option value="Poetry">Poetry</option>
                        <option value="Comedy">Comedy</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-accent-beige/50">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && uploadProgress > 0 && (
                <div className="bg-deep-purple/10 border border-deep-purple/30 rounded-2xl p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-bold">Uploading your talent...</span>
                    <span className="text-deep-purple font-mono font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="bg-gradient-to-r from-deep-purple to-purple-400 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(147,51,234,0.5)]"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-accent-beige/40 mt-2">Please don't close this window</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading || !user || (!file && mediaType !== 'text') || (mediaType === 'text' && !textContent.trim())}
                className="w-full py-5 bg-gradient-to-r from-deep-purple to-[#7B4B27] hover:brightness-110 text-white rounded-2xl font-bold text-lg shadow-lg shadow-deep-purple/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {uploading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UploadIcon size={24} />
                    Share with the World
                  </>
                )}
              </button>
            </>
          )}
        </form>
      </div >

      <Navbar />
    </div >
  );
};

export default Upload;
