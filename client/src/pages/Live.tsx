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
        <div className="h-full w-full bg-black relative">
          {/* Main video area */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover"
          />

          {/* Overlays */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/60 via-transparent to-black/80" />

          {/* Top Bar */}
          <div className="absolute top-12 left-6 right-6 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500 rounded-full shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-[10px] font-black tracking-widest">LIVE</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 glass-panel border-white/10 rounded-full">
                <Users size={14} className="text-neon-blue" />
                <span className="text-white text-xs font-bold">{viewers}</span>
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="p-3 glass-button rounded-full text-white/60 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Overlay (Bottom Left) */}
          <div className="absolute bottom-40 left-6 right-20 z-20 pointer-events-none">
            <div className="max-h-64 overflow-y-auto no-scrollbar space-y-3 flex flex-col justify-end">
              {chatMessages.slice(-5).map((msg, i) => (
                <div key={i} className="flex items-start gap-2 animate-slide-up">
                  <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black text-neon-purple mr-2 uppercase tracking-widest">{msg.user}</span>
                    <span className="text-xs text-white/90 leading-relaxed">{msg.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Controls - Thumb Zone Optimized */}
          <div className="absolute bottom-12 left-6 right-6 flex items-end justify-between z-20">
            {/* Chat Input */}
            <div className="flex-1 mr-4">
              <div className="glass-panel p-1 rounded-full border border-white/10 flex items-center gap-2">
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
                  className="flex-1 bg-transparent px-5 py-3 text-sm focus:outline-none placeholder:text-white/20"
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
                  className="p-3 bg-neon-purple text-black rounded-full shadow-lg shadow-neon-purple/20 active:scale-90 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <button
                onClick={toggleMute}
                className={`p-5 rounded-full transition-all shadow-lg ${isMuted ? 'bg-red-500 text-white' : 'glass-button text-white'}`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-5 rounded-full transition-all shadow-lg ${isVideoOff ? 'bg-red-500 text-white' : 'glass-button text-white'}`}
              >
                {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
              </button>
              <button
                onClick={stopStream}
                className="p-5 bg-red-500 text-white rounded-full shadow-2xl shadow-red-500/40 active:scale-90 transition-all border-2 border-white/20"
              >
                <Radio size={24} />
              </button>
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

