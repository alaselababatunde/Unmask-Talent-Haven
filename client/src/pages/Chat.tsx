import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Send, Users as UsersIcon } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

interface Message { id: string; text: string; username: string; userId: string; createdAt: string; }

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  const SOCKET_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/?api\/?$/i, '');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    const s = io(SOCKET_BASE, { transports: ['websocket'] });
    socketRef.current = s;
    s.on('connect', () => {
      // connected
    });
    s.on('message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => { s.disconnect(); };
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    socketRef.current?.emit('message', {
      text: input,
      room: 'creators',
      userId: user?.id || 'anon',
      username: user?.username || 'anon',
    });
    setInput('');
  };

  return (
    <div className="min-h-screen bg-matte-black pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-deep-purple/20 rounded-full glow-purple">
            <UsersIcon className="text-deep-purple" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-accent-beige">Creators Chat</h1>
            <p className="text-accent-beige/60 text-sm">Real-time room for creators</p>
          </div>
        </div>

        <div className="bg-matte-black border border-deep-purple/30 rounded-2xl h-[calc(100vh-280px)] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.userId === (user?.id || '') ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${message.userId === (user?.id || '') ? 'bg-deep-purple/20 text-accent-beige' : 'bg-rich-brown/30 text-accent-beige border border-rich-brown/20'}`}
                >
                  <p className="text-xs opacity-70 mb-1">{message.username}</p>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className="text-xs opacity-60 mt-2">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-deep-purple/30">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-4 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple focus:glow-purple"
                placeholder="Ask me anything or share your thoughts..."
              />
              <button
                type="submit"
                className="p-4 bg-deep-purple hover:bg-deep-purple/80 text-accent-beige rounded-2xl transition-all glow-purple-strong flex items-center justify-center"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default Chat;

