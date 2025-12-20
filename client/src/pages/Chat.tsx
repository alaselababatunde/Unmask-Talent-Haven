import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Send, ArrowLeft, MoreHorizontal, Phone, Video as VideoIcon, Info, Heart, Smile } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../api';

interface Message {
  id: string;
  text: string;
  username: string;
  userId: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  userId: string;
  username: string;
  profileImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isLive?: boolean;
  isOnline?: boolean;
}

const Chat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
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
    const fetchConversations = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const res = await api.get(`/user/${user.id}`);
        const following = res.data.user.following || [];

        const convs = following.map((u: any) => ({
          id: u._id,
          userId: u._id,
          username: u.username,
          profileImage: u.profileImage,
          lastMessage: 'Start a conversation',
          lastMessageTime: '',
          unreadCount: 0,
          isLive: u.isLive,
          isOnline: false
        }));
        setConversations(convs);
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user?.id]);

  useEffect(() => {
    const s = io(SOCKET_BASE, { transports: ['websocket'] });
    socketRef.current = s;
    s.on('message', (msg: Message) => {
      if (selectedChat && msg.userId === selectedChat) {
        setMessages((prev) => [...prev, msg]);
        setConversations(prev => prev.map(conv =>
          conv.id === selectedChat
            ? { ...conv, lastMessage: msg.text, lastMessageTime: 'now', unreadCount: 0 }
            : conv
        ));
      } else {
        setConversations(prev => prev.map(conv =>
          conv.id === msg.userId
            ? { ...conv, lastMessage: msg.text, lastMessageTime: 'now', unreadCount: conv.unreadCount + 1 }
            : conv
        ));
      }
    });
    return () => { s.disconnect(); };
  }, [selectedChat]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      text: input,
      username: user?.username || 'You',
      userId: user?.id || 'me',
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
    socketRef.current?.emit('message', {
      text: input,
      room: selectedChat,
      userId: user?.id || 'anon',
      username: user?.username || 'anon',
    });

    setConversations(prev => prev.map(conv =>
      conv.id === selectedChat
        ? { ...conv, lastMessage: input, lastMessageTime: 'now' }
        : conv
    ));

    setInput('');
  };

  const handleBackToInbox = () => {
    setSelectedChat(null);
    setMessages([]);
  };

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  if (!selectedChat) {
    return (
      <div className="h-[100dvh] w-full bg-primary flex flex-col relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Header */}
        <div className="px-6 py-8 flex items-center justify-between relative z-10">
          <h1 className="text-4xl font-bold font-display tracking-tight">Messages</h1>
          <button className="p-3 glass-button rounded-full">
            <Smile size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar relative z-10">
          {/* Active Status Bar */}
          <div className="flex gap-6 mb-10 overflow-x-auto no-scrollbar py-2">
            {conversations
              .filter(c => c.isLive || c.isOnline)
              .map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv.id)}
                  className="flex flex-col items-center gap-3 min-w-[80px] group"
                >
                  <div className="relative">
                    <div className={`w-20 h-20 rounded-full p-1 ${conv.isLive ? 'bg-gradient-to-tr from-neon-purple to-neon-blue' : 'bg-white/5'} transition-transform group-active:scale-90`}>
                      <div className="w-full h-full rounded-full bg-obsidian overflow-hidden flex items-center justify-center">
                        {conv.profileImage ? (
                          <img src={conv.profileImage} alt={conv.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-neon-purple text-2xl font-bold">{conv.username[0].toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                    {conv.isLive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-red-500 text-[8px] font-black rounded-full shadow-lg border-2 border-primary">LIVE</div>
                    )}
                  </div>
                  <span className="text-white/60 text-xs font-bold truncate w-full text-center">{conv.username}</span>
                </button>
              ))}
          </div>

          {/* Conversations List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20 text-white/20 font-bold">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-20 glass-panel rounded-[2rem] border-white/5">
                <p className="text-white/40">No messages yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv.id)}
                  className="w-full glass-panel p-5 rounded-[2rem] border-white/5 flex items-center gap-5 hover:bg-white/5 transition-all active:scale-[0.98]"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-obsidian overflow-hidden flex items-center justify-center border border-white/5">
                      {conv.profileImage ? (
                        <img src={conv.profileImage} alt={conv.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-neon-purple text-xl font-bold">{conv.username[0].toUpperCase()}</span>
                      )}
                    </div>
                    {conv.isOnline && (
                      <div className="absolute bottom-1 right-1 w-4 h-4 bg-neon-blue rounded-full border-4 border-obsidian" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-bold truncate">{conv.username}</h3>
                      <span className="text-white/20 text-[10px] font-bold uppercase">{conv.lastMessageTime}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-white/40 text-sm truncate">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <div className="w-6 h-6 bg-neon-purple rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-black text-[10px] font-black">{conv.unreadCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
        <Navbar />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-primary flex flex-col relative overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-6 glass-panel border-b border-white/5 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-4">
          <button onClick={handleBackToInbox} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-obsidian overflow-hidden border border-white/5">
              {selectedConversation?.profileImage ? (
                <img src={selectedConversation.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neon-purple font-bold">
                  {selectedConversation?.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="font-bold">{selectedConversation?.username}</h2>
              <p className="text-[10px] text-neon-blue font-black uppercase tracking-widest">
                {selectedConversation?.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-3 glass-button rounded-full"><Phone size={20} /></button>
          <button className="p-3 glass-button rounded-full"><VideoIcon size={20} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 no-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Send size={40} />
            </div>
            <p className="text-xl font-bold">Start the conversation</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.userId === (user?.id || 'me');
            return (
              <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-scale-in`}>
                <div className={`max-w-[80%] ${isMe ? 'bg-neon-purple text-black' : 'bg-white/5 text-white'} px-6 py-4 rounded-[2rem] ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'} shadow-xl`}>
                  <p className="text-sm leading-relaxed font-medium">{message.text}</p>
                  <p className={`text-[8px] font-black uppercase mt-2 opacity-40 ${isMe ? 'text-black' : 'text-white'}`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 pb-10 relative z-20">
        <form onSubmit={handleSend} className="glass-panel p-2 rounded-[2.5rem] border-white/5 flex items-center gap-2">
          <button type="button" className="p-4 text-white/20 hover:text-white transition-colors">
            <MoreHorizontal size={24} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent px-2 py-4 text-sm focus:outline-none placeholder:text-white/10"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className={`p-4 rounded-full transition-all ${input.trim() ? 'bg-neon-purple text-black shadow-lg shadow-neon-purple/20' : 'bg-white/5 text-white/20'}`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
