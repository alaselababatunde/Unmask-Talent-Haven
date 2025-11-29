import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Radio, Video, VideoOff, Mic, MicOff, Users, Heart, MessageCircle, Share2, Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Live = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState<{ user: string, text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isLive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isLive]);

  // Removed fake viewer simulation

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      streamRef.current = stream;
      setIsLive(true);
      setViewers(Math.floor(Math.random() * 10) + 1);
      setError('');
      if (user?.id) {
        await api.put(`/user/${user.id}/live`, { isLive: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to access camera/microphone');
    }
  };

  const stopStream = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLive(false);
    setViewers(0);
    if (user?.id) {
      try {
        await api.put(`/user/${user.id}/live`, { isLive: false });
      } catch (e) {
        console.error('Failed to update live status', e);
      }
    }
    navigate('/profile');
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="min-h-screen bg-matte-black pb-24">
      {!isLive ? (
        <div className="h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-8 relative">
              <button
                onClick={() => navigate(-1)}
                className="absolute left-0 top-0 -ml-4 p-2 text-accent-beige/60 hover:text-white transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="w-24 h-24 mx-auto bg-deep-purple/20 rounded-full flex items-center justify-center mb-4">
                <Radio className="text-deep-purple" size={56} />
              </div>
              <h1 className="text-4xl font-bold text-accent-beige mb-2">Go Live</h1>
              <p className="text-accent-beige/70 mb-8">Share your talent in real-time with your community</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/60 text-red-300 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <button
              onClick={startStream}
              className="w-full px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all transform hover:scale-105"
            >
              Start Streaming
            </button>

            <p className="text-accent-beige/50 text-xs mt-6">
              Make sure your camera and microphone permissions are enabled
            </p>
          </div>
        </div>
      ) : (
        <div className="flex h-screen">
          {/* Main video area */}
          <div className="flex-1 relative bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
              style={{ display: 'block' }}
            />

            {/* Live badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full z-10">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-sm font-bold">LIVE</span>
            </div>

            {/* Viewer count badge */}
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-deep-purple/60 backdrop-blur border border-deep-purple/40 rounded-full z-10">
              <Users size={16} className="text-accent-beige" />
              <span className="text-accent-beige text-sm font-semibold">{viewers}</span>
            </div>

            {/* Stream controls */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full transition-all transform hover:scale-110 ${isMuted
                  ? 'bg-red-500/80 text-white'
                  : 'bg-deep-purple/60 text-accent-beige hover:bg-deep-purple/80'
                  }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-all transform hover:scale-110 ${isVideoOff
                  ? 'bg-red-500/80 text-white'
                  : 'bg-deep-purple/60 text-accent-beige hover:bg-deep-purple/80'
                  }`}
                title={isVideoOff ? 'Turn video on' : 'Turn video off'}
              >
                {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 rounded-full bg-deep-purple/60 text-accent-beige hover:bg-deep-purple/80 transition-all transform hover:scale-110"
                title="Settings"
              >
                <Settings size={24} />
              </button>

              <button
                onClick={stopStream}
                className="px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-all transform hover:scale-105 shadow-lg shadow-red-500/20"
                title="Stop streaming"
              >
                End Live
              </button>
            </div>

            {/* Settings panel */}
            {showSettings && (
              <div className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-matte-black border border-deep-purple/30 rounded-2xl p-4 z-20 w-64">
                <h3 className="text-accent-beige font-bold mb-3">Stream Settings</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-accent-beige/70">
                    <span>Resolution:</span>
                    <span>Auto</span>
                  </div>
                  <div className="flex justify-between text-accent-beige/70">
                    <span>Bitrate:</span>
                    <span>2.5 Mbps</span>
                  </div>
                  <div className="flex justify-between text-accent-beige/70">
                    <span>Framerate:</span>
                    <span>30 fps</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar - Stream info & chat placeholder */}
          <div className="w-80 bg-matte-black border-l border-deep-purple/20 flex flex-col">
            {/* Stream info */}
            <div className="p-4 border-b border-deep-purple/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-deep-purple/30 flex items-center justify-center overflow-hidden border border-deep-purple/40">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-deep-purple font-bold text-lg">{user?.username?.[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-accent-beige font-semibold">{user?.username}</h3>
                  <p className="text-accent-beige/60 text-xs">{viewers} viewers</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button className="p-2 rounded-lg bg-deep-purple/10 hover:bg-deep-purple/20 text-accent-beige flex flex-col items-center gap-1 transition-colors">
                  <Heart size={18} />
                  <span className="text-xs">Like</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Stream link copied!');
                  }}
                  className="p-2 rounded-lg bg-deep-purple/10 hover:bg-deep-purple/20 text-accent-beige flex flex-col items-center gap-1 transition-colors"
                >
                  <Share2 size={18} />
                  <span className="text-xs">Share</span>
                </button>
                <button className="p-2 rounded-lg bg-deep-purple/10 hover:bg-deep-purple/20 text-accent-beige flex flex-col items-center gap-1 transition-colors">
                  <MessageCircle size={18} />
                  <span className="text-xs">Chat</span>
                </button>
              </div>
            </div>

            {/* Chat placeholder */}
            <div className="flex-1 p-4 overflow-y-auto">
              <h4 className="text-accent-beige font-semibold mb-4">Live Chat</h4>
              <div className="space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-accent-beige/40 text-sm py-4">
                    Waiting for viewers to join...
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-bold text-deep-purple mr-2">{msg.user}:</span>
                      <span className="text-accent-beige">{msg.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat input */}
            <div className="p-4 border-t border-deep-purple/20">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    setChatMessages([...chatMessages, { user: user?.username || 'Me', text: chatInput }]);
                    setChatInput('');
                  }
                }}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 bg-matte-black border border-deep-purple/30 rounded-lg text-accent-beige text-sm focus:outline-none focus:border-deep-purple"
              />
            </div>
          </div>
        </div>
      )}

      <Navbar />
    </div>
  );
};

export default Live;

