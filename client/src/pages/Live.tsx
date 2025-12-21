import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Radio, Video, VideoOff, Mic, MicOff, Users, ArrowLeft, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Live = () => {
  const navigate = useNavigate();
  const { user, socket } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState<{ user: string, text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (socket && isLive && user?.id) {
      socket.emit('join_live', { streamId: user.id });

      socket.on('viewer_count', ({ count }) => {
        setViewers(count);
      });

      socket.on('message', (msg) => {
        if (msg.room === `live:${user.id}`) {
          setChatMessages(prev => [...prev, { user: msg.username, text: msg.text }]);
        }
      });

      return () => {
        socket.emit('leave_live', { streamId: user.id });
        socket.off('viewer_count');
        socket.off('message');
      };
    }
  }, [socket, isLive, user?.id]);

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
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-neon-purple/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-neon-blue/10 rounded-full blur-[120px] animate-pulse" />

          <div className="w-full max-w-md glass-panel p-12 rounded-[3.5rem] border-white/5 relative z-10 text-center animate-scale-in">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-8 top-8 p-3 glass-button rounded-full text-white/40 hover:text-white transition-all active:scale-90"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="w-28 h-28 mx-auto bg-obsidian rounded-[2.5rem] flex items-center justify-center mb-10 border border-white/5 relative group">
              <div className="absolute inset-0 bg-neon-purple/20 rounded-[2.5rem] blur-2xl group-hover:bg-neon-purple/30 transition-all duration-500" />
              <Radio className="text-neon-purple relative z-10 animate-pulse" size={56} />
            </div>

            <h1 className="text-4xl font-bold font-display mb-4 tracking-tight">Go Live</h1>
            <p className="text-white/40 text-lg mb-12 leading-relaxed">Unmask your talent to the world in real-time</p>

            {error && (
              <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm animate-shake flex items-center gap-3">
                <X size={18} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={startStream}
              className="w-full py-6 bg-red-500 text-white rounded-[2.5rem] font-bold text-xl shadow-[0_0_30px_rgba(239,68,68,0.3)] active:scale-95 transition-all hover:bg-red-600"
            >
              Start Streaming
            </button>

            <div className="flex items-center justify-center gap-2 mt-10 text-white/20">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Camera & Mic Access Required
              </p>
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full w-full bg-black relative">
          {/* Main video area */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover"
          />

          {/* Immersive Overlays */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/80 via-transparent to-black/90" />

          {/* Top Bar */}
          <div className="absolute top-14 left-6 right-6 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-5 py-2.5 bg-red-500 rounded-full shadow-lg border border-white/10">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-[10px] font-black tracking-widest uppercase">Live</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 glass-panel border-white/10 rounded-full">
                <Users size={14} className="text-neon-blue" />
                <span className="text-white text-xs font-bold">{viewers}</span>
              </div>
            </div>

            <button
              onClick={stopStream}
              className="p-3.5 glass-button rounded-full text-white/60 hover:text-white transition-all active:scale-90"
            >
              <X size={22} />
            </button>
          </div>

          {/* Chat Overlay (Bottom Left) */}
          <div className="absolute bottom-44 left-6 right-20 z-20 pointer-events-none">
            <div className="max-h-72 overflow-y-auto no-scrollbar space-y-3 flex flex-col justify-end">
              {chatMessages.slice(-6).map((msg, i) => (
                <div key={i} className="flex items-start gap-2 animate-slide-up">
                  <div className="px-4 py-2 bg-black/40 backdrop-blur-xl rounded-[1.25rem] border border-white/5 shadow-xl">
                    <span className="text-[10px] font-black text-neon-purple mr-2 uppercase tracking-widest">{msg.user}</span>
                    <span className="text-xs text-white/90 leading-relaxed">{msg.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Controls - Integrated Thumb Zone */}
          <div className="absolute bottom-12 left-6 right-6 flex flex-col gap-6 z-20">
            <div className="flex items-center gap-4">
              {/* Chat Input */}
              <div className="flex-1">
                <div className="glass-panel p-1.5 rounded-full border border-white/10 flex items-center gap-2 bg-black/20 backdrop-blur-xl">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && chatInput.trim() && socket && user) {
                        socket.emit('message', {
                          text: chatInput,
                          userId: user.id,
                          username: user.username,
                          room: `live:${user.id}`
                        });
                        setChatInput('');
                      }
                    }}
                    placeholder="Say something..."
                    className="flex-1 bg-transparent px-6 py-3.5 text-sm text-white focus:outline-none placeholder:text-white/20"
                  />
                  <button
                    onClick={() => {
                      if (chatInput.trim() && socket && user) {
                        socket.emit('message', {
                          text: chatInput,
                          userId: user.id,
                          username: user.username,
                          room: `live:${user.id}`
                        });
                        setChatInput('');
                      }
                    }}
                    className="p-4 bg-neon-purple text-black rounded-full shadow-[0_0_20px_rgba(176,38,255,0.3)] active:scale-90 transition-all"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>

              {/* Quick Action Stack */}
              <div className="flex gap-3">
                <button
                  onClick={toggleMute}
                  className={`p-5 rounded-full transition-all shadow-xl backdrop-blur-xl border ${isMuted ? 'bg-red-500 border-red-400 text-white' : 'bg-white/10 border-white/10 text-white'}`}
                >
                  {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-5 rounded-full transition-all shadow-xl backdrop-blur-xl border ${isVideoOff ? 'bg-red-500 border-red-400 text-white' : 'bg-white/10 border-white/10 text-white'}`}
                >
                  {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Only show Navbar on setup screen, hide during live */}
      {!isLive && (
        <div className="md:hidden">
          <Navbar />
        </div>
      )}
    </div>
  );
};

export default Live;

