import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Send, Users as UsersIcon, MessageCircle, Search } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Message { id: string; text: string; username: string; userId: string; createdAt: string; }

interface Conversation {
  id: string;
  userId: string;
  username: string;
  profileImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isLive?: boolean;
}

const Chat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', userId: 'user1', username: 'Creator1', lastMessage: 'Hey! Great content!', lastMessageTime: 'now', unreadCount: 2 },
    { id: '2', userId: 'user2', username: 'Creator2', lastMessage: 'I want to text', lastMessageTime: '5m', unreadCount: 0 },
    { id: '3', userId: 'user3', username: 'Creator3', lastMessage: 'Thanks for the follow!', lastMessageTime: '1h', unreadCount: 1 },
  ]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

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
      if (selectedChat && msg.userId === selectedChat) {
        setMessages((prev) => [...prev, msg]);
        // Update conversation last message
        setConversations(prev => prev.map(conv => 
          conv.id === selectedChat 
            ? { ...conv, lastMessage: msg.text, lastMessageTime: 'now', unreadCount: conv.id === selectedChat ? 0 : conv.unreadCount }
            : { ...conv, unreadCount: conv.id === selectedChat ? conv.unreadCount : conv.unreadCount + 1 }
        ));
      }
    });
    return () => { s.disconnect(); };
  }, [selectedChat]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedChat) return;

    socketRef.current?.emit('message', {
      text: input,
      room: selectedChat,
      userId: user?.id || 'anon',
      username: user?.username || 'anon',
    });
    setInput('');
  };

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  return (
    <div className="min-h-screen bg-matte-black pb-24">
      {!selectedChat ? (
        // Inbox List View
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-accent-beige">Inbox</h1>
            <button className="p-2 rounded-full bg-matte-black border border-deep-purple/30 hover:border-deep-purple text-accent-beige">
              <Search size={20} />
            </button>
          </div>

          {/* Stories/Status Updates */}
          <div className="mb-6">
            <div className="flex gap-3 overflow-x-auto pb-2">
              <button className="flex flex-col items-center gap-2 min-w-[70px]">
                <div className="w-16 h-16 rounded-full bg-deep-purple/20 border-2 border-dashed border-deep-purple/40 flex items-center justify-center">
                  <span className="text-deep-purple text-2xl">+</span>
                </div>
                <span className="text-accent-beige/60 text-xs">Create</span>
              </button>
              {conversations.filter(c => c.isLive).map((conv) => (
                <button key={conv.id} className="flex flex-col items-center gap-2 min-w-[70px]">
                  <div className={`w-16 h-16 rounded-full bg-deep-purple/30 border-2 ${conv.isLive ? 'border-red-500' : 'border-deep-purple/40'}`}>
                    {conv.profileImage ? (
                      <img src={conv.profileImage} alt={conv.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-deep-purple text-xl font-bold flex items-center justify-center h-full">
                        {conv.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-accent-beige/60 text-xs">{conv.username}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Activity/Notifications */}
          <div className="mb-4">
            <button className="w-full flex items-center gap-3 p-3 bg-matte-black border border-deep-purple/20 rounded-2xl hover:bg-deep-purple/5 transition">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <UsersIcon className="text-blue-400" size={20} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-accent-beige font-semibold">New followers</p>
                <p className="text-accent-beige/60 text-sm">itz Amora started following you</p>
              </div>
            </button>
          </div>

          <div className="mb-4">
            <button className="w-full flex items-center gap-3 p-3 bg-matte-black border border-deep-purple/20 rounded-2xl hover:bg-deep-purple/5 transition">
              <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                <MessageCircle className="text-pink-400" size={20} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-accent-beige font-semibold">Activity</p>
                <p className="text-accent-beige/60 text-sm">chimera and Ariott$tar$word lik...</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">2</span>
              </div>
            </button>
          </div>

          {/* Conversations List */}
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className="w-full flex items-center gap-3 p-3 bg-matte-black border border-deep-purple/20 rounded-2xl hover:bg-deep-purple/5 transition"
              >
                <div className={`w-12 h-12 rounded-full bg-deep-purple/30 border-2 ${conv.isLive ? 'border-red-500' : 'border-deep-purple/40'} flex-shrink-0`}>
                  {conv.profileImage ? (
                    <img src={conv.profileImage} alt={conv.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-deep-purple text-lg font-bold flex items-center justify-center h-full">
                      {conv.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-accent-beige font-semibold truncate">{conv.username}</p>
                    <p className="text-accent-beige/40 text-xs ml-2">{conv.lastMessageTime}</p>
                  </div>
                  <p className="text-accent-beige/60 text-sm truncate">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{conv.unreadCount}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Chat View
        <div className="h-screen flex flex-col">
          <div className="flex items-center gap-3 p-4 border-b border-deep-purple/20 bg-matte-black">
            <button onClick={() => setSelectedChat(null)} className="text-accent-beige">
              ←
            </button>
            <div className={`w-10 h-10 rounded-full bg-deep-purple/30 border-2 ${selectedConversation?.isLive ? 'border-red-500' : 'border-deep-purple/40'}`}>
              {selectedConversation?.profileImage ? (
                <img src={selectedConversation.profileImage} alt={selectedConversation.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-deep-purple font-bold flex items-center justify-center h-full">
                  {selectedConversation?.username[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-accent-beige font-semibold">{selectedConversation?.username}</p>
              <p className="text-accent-beige/60 text-xs">Active now</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-matte-black">
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

          <form onSubmit={handleSend} className="p-4 border-t border-deep-purple/20 bg-matte-black">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-4 bg-matte-black border border-deep-purple/30 rounded-2xl text-accent-beige focus:outline-none focus:border-deep-purple"
                placeholder="Type a message..."
              />
              <button
                type="submit"
                className="p-4 bg-deep-purple hover:bg-deep-purple/80 text-accent-beige rounded-2xl transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}

      <Navbar />
    </div>
  );
};

export default Chat;
