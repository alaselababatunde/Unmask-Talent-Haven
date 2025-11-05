import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Radio, X, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsLive(true);
        setError('');
        if (user?.id) {
          await api.put(`/user/${user.id}/live`, { isLive: true });
        }
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
    if (user?.id) {
      await api.put(`/user/${user.id}/live`, { isLive: false });
    }
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
    <div className="min-h-screen bg-black pb-24">
      <div className="relative h-screen">
        {!isLive ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="mb-6">
                <Radio className="mx-auto text-deep-purple" size={64} />
              </div>
              <h2 className="text-2xl font-bold text-accent-beige mb-4">Go Live</h2>
              <p className="text-accent-beige/60 mb-8">Share your talent in real-time</p>
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-xl text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={startStream}
                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold transition"
              >
                Start Streaming
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
            />
            
            {/* Live overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-sm font-semibold">LIVE</span>
              <span className="text-white/80 text-xs">{viewers} viewers</span>
            </div>

            {/* Controls */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full ${isMuted ? 'bg-red-500/80' : 'bg-black/60'} text-white`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <button
                onClick={stopStream}
                className="p-3 rounded-full bg-red-500 text-white"
              >
                <X size={24} />
              </button>
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500/80' : 'bg-black/60'} text-white`}
              >
                {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
              </button>
            </div>
          </>
        )}
      </div>

      <Navbar />
    </div>
  );
};

export default Live;
