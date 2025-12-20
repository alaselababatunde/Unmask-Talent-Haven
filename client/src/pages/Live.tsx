import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Radio, Video, VideoOff, Mic, MicOff, Users, Heart, MessageCircle, Share2, Settings, ArrowLeft, Send } from 'lucide-react';
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

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
    <div className="h-[100dvh] w-full bg-primary relative overflow-hidden">
      {!isLive ? (
        <div className="h-full flex items-center justify-center p-6 relative">
          {/* Background Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/20 rounded-full blur-[120px] animate-pulse" />

          <div className="w-full max-w-md glass-panel p-10 rounded-[3rem] border-white/5 relative z-10 text-center animate-scale-in">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-8 top-8 p-3 glass-button rounded-full text-white/40 hover:text-white transition-all"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="w-24 h-24 mx-auto bg-obsidian rounded-full flex items-center justify-center mb-8 border border-white/5 relative">
              <div className="absolute inset-0 bg-neon-purple/20 rounded-full blur-xl animate-pulse" />
              <Radio className="text-neon-purple relative z-10" size={48} />
            </div>

            <h1 className="text-4xl font-bold font-display mb-4 tracking-tight">Go Live</h1>
            <p className="text-white/40 text-lg mb-10 leading-relaxed">Share your talent in real-time with your community</p>

            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm animate-shake">
                {error}
              </div>
            )}

            <button
              onClick={startStream}
              className="w-full py-5 bg-red-500 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-red-500/20 active:scale-95 transition-all"
            >
              Start Streaming
            </button>

            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mt-8">
              Camera & Microphone access required
            </p>
          </div>
        </div>
      ) : (
        <div className="h-full w-full flex flex-col md:flex-row">
          {/* Main video area */}
          <div className="flex-1 relative bg-black overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
            />

            {/* Overlays */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/60" />

            {/* Top Bar */}
            <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-20 pointer-events-auto">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500 rounded-full shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-xs font-black tracking-widest">LIVE</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 glass-panel border-white/10 rounded-full">
                  <Users size={14} className="text-neon-blue" />
                  <span className="text-white text-xs font-bold">{viewers}</span>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 glass-button rounded-full text-white/60 hover:text-white transition-all"
              >
                <Settings size={20} />
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-10 left-8 right-8 flex items-center justify-between z-20 pointer-events-auto">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'glass-button text-white/60'}`}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'glass-button text-white/60'}`}
                >
                  {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>
              </div>

              <button
                onClick={stopStream}
                className="px-8 py-4 bg-red-500 text-white rounded-full font-black text-xs tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all"
              >
                END STREAM
              </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="absolute top-24 right-8 w-64 glass-panel p-6 rounded-3xl border-white/10 z-30 animate-scale-in">
                <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-neon-purple">Stream Settings</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40 font-bold">Quality</span>
                    <span className="text-xs font-bold">1080p</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40 font-bold">Bitrate</span>
                    <span className="text-xs font-bold">4.5 Mbps</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40 font-bold">Latency</span>
                    <span className="text-xs font-bold text-neon-blue">Ultra Low</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel (Chat & Info) */}
          <div className="w-full md:w-96 bg-obsidian border-l border-white/5 flex flex-col relative z-20">
            {/* Creator Info */}
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-primary overflow-hidden border border-white/10 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-obsidian text-neon-purple font-bold text-xl">
                        {user?.username?.[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{user?.username}</h3>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Streaming Now</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button className="flex flex-col items-center gap-2 p-3 glass-button rounded-2xl group">
                  <Heart size={18} className="text-white/40 group-hover:text-red-500 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Like</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Stream link copied!');
                  }}
                  className="flex flex-col items-center gap-2 p-3 glass-button rounded-2xl group"
                >
                  <Share2 size={18} className="text-white/40 group-hover:text-neon-blue transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Share</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 glass-button rounded-2xl group">
                  <MessageCircle size={18} className="text-white/40 group-hover:text-neon-purple transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Chat</span>
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-6 py-4 border-b border-white/5">
                <h4 className="text-xs font-black uppercase tracking-widest text-white/20">Live Chat</h4>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <MessageCircle size={40} className="mb-4" />
                    <p className="text-sm font-bold">No messages yet</p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={i} className="animate-slide-up">
                      <span className="text-xs font-black text-neon-purple mr-2 uppercase tracking-tighter">{msg.user}</span>
                      <span className="text-sm text-white/70 leading-relaxed">{msg.text}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 pb-10">
                <div className="glass-panel p-2 rounded-[2rem] border-white/5 flex items-center gap-2">
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
                    placeholder="Say something..."
                    className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-white/10"
                  />
                  <button
                    onClick={() => {
                      if (chatInput.trim()) {
                        setChatMessages([...chatMessages, { user: user?.username || 'Me', text: chatInput }]);
                        setChatInput('');
                      }
                    }}
                    className="p-3 bg-neon-purple text-black rounded-full shadow-lg shadow-neon-purple/20 active:scale-90 transition-all"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden">
        <Navbar />
      </div>
    </div>
  );
};

export default Live;

