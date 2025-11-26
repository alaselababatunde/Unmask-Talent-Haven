import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Send, ArrowLeft, MoreHorizontal, Phone, Video as VideoIcon, Info, Heart, Smile } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

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
  const [conversations, setConversations] = useState<Conversation[]>([
    { 
      id: '1', 
      userId: 'user1', 
      username: 'Creator1', 
      lastMessage: 'Hey! Great content!', 
      lastMessageTime: 'now', 
      unreadCount: 2,
      isOnline: true 
    },
    { 
      id: '2', 
      userId: 'user2', 
      username: 'Creator2', 
      lastMessage: 'I want to text', 
      lastMessageTime: '5m', 
      unreadCount: 0,
      isOnline: true 
    },
    { 
      id: '3', 
      userId: 'user3', 
      username: 'Creator3', 
      lastMessage: 'Thanks for the follow!', 
      lastMessageTime: '1h', 
      unreadCount: 1,
      isOnline: false 
    },
    { 
      id: '4', 
      userId: 'user4', 
      username: 'TalentStar', 
      lastMessage: 'Amazing video!', 
      lastMessageTime: '2h', 
      unreadCount: 0,
      isLive: true,
      isOnline: true 
    },
  ]);
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
    const s = io(SOCKET_BASE, { transports: ['websocket'] });
    socketRef.current = s;
    s.on('connect', () => {
      // Socket connected to chat server
    });
    s.on('message', (msg: Message) => {
      if (selectedChat && msg.userId === selectedChat) {
        setMessages((prev) => [...prev, msg]);
        // Mark as read
        setConversations(prev => prev.map(conv => 
          conv.id === selectedChat 
            ? { ...conv, lastMessage: msg.text, lastMessageTime: 'now', unreadCount: 0 }
            : conv
        ));
      } else {
        // Update conversation and increment unread
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
    
    // Update conversation
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
    // INBOX VIEW - TikTok Style
    return (
      <div className="min-h-screen bg-matte-black pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-matte-black/95 backdrop-blur-sm border-b border-deep-purple/20">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-accent-beige">Messages</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Live/Active Status Bar */}
          <div className="px-4 py-3 overflow-x-auto">
            <div className="flex gap-4">
              {conversations
                .filter(c => c.isLive || c.isOnline)
                .map((conv) => (
                  <button 
                    key={conv.id}
                    onClick={() => setSelectedChat(conv.id)}
                    className="flex flex-col items-center gap-2 min-w-[70px]"
                  >
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-full ${
                        conv.isLive 
                          ? 'bg-gradient-to-tr from-deep-purple via-rich-brown to-accent-beige p-[3px]' 
                          : 'bg-deep-purple/30 p-[2px]'
                      }`}>
                        <div className="w-full h-full rounded-full bg-matte-black flex items-center justify-center overflow-hidden">
                          {conv.profileImage ? (
                            <img src={conv.profileImage} alt={conv.username} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-accent-beige text-xl font-bold">
                              {conv.username[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      {conv.isOnline && !conv.isLive && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-rich-brown border-2 border-matte-black rounded-full" />
                      )}
                    </div>
                    <span className="text-accent-beige text-xs max-w-[70px] truncate">
                      {conv.username}
                    </span>
                    {conv.isLive && (
                      <span className="text-[10px] bg-deep-purple text-accent-beige px-2 py-0.5 rounded-full font-semibold">
                        LIVE
                      </span>
                    )}
                  </button>
                ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="divide-y divide-white/5">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-deep-purple/5 transition-colors active:bg-deep-purple/10"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-deep-purple/30 overflow-hidden flex items-center justify-center">
                    {conv.profileImage ? (
                      <img src={conv.profileImage} alt={conv.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-accent-beige text-lg font-bold">
                        {conv.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  {conv.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-rich-brown border-2 border-matte-black rounded-full" />
                  )}
                </div>

                {/* Message Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-accent-beige font-semibold truncate">
                      {conv.username}
                    </h3>
                    <span className="text-accent-beige/60 text-xs ml-2 flex-shrink-0">
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-accent-beige/70 text-sm truncate">
                      {conv.lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <div className="ml-2 min-w-[20px] h-5 px-2 bg-deep-purple rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-accent-beige text-xs font-bold">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Navbar />
      </div>
    );
  }

  // CHAT VIEW - TikTok Style
  return (
    <div className="h-screen bg-matte-black flex flex-col">
      {/* Chat Header */}
      <div className="bg-matte-black/95 backdrop-blur-sm border-b border-deep-purple/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <button 
            onClick={handleBackToInbox}
            className="p-2 hover:bg-deep-purple/20 rounded-full transition-colors"
          >
            <ArrowLeft className="text-accent-beige" size={24} />
          </button>
          
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-deep-purple/30 overflow-hidden flex items-center justify-center">
                {selectedConversation?.profileImage ? (
                  <img 
                    src={selectedConversation.profileImage} 
                    alt={selectedConversation.username} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-accent-beige font-bold">
                    {selectedConversation?.username[0].toUpperCase()}
                  </span>
                )}
              </div>
              {selectedConversation?.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-rich-brown border-2 border-matte-black rounded-full" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-accent-beige font-semibold truncate">
                {selectedConversation?.username}
              </h2>
              <p className="text-accent-beige/60 text-xs">
                {selectedConversation?.isOnline ? 'Active now' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-deep-purple/20 rounded-full transition-colors">
            <Phone className="text-accent-beige" size={20} />
          </button>
          <button className="p-2 hover:bg-deep-purple/20 rounded-full transition-colors">
            <VideoIcon className="text-accent-beige" size={20} />
          </button>
          <button className="p-2 hover:bg-deep-purple/20 rounded-full transition-colors">
            <Info className="text-accent-beige" size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 rounded-full bg-deep-purple/20 flex items-center justify-center mb-4">
                <span className="text-3xl">👋</span>
              </div>
              <p className="text-accent-beige font-semibold mb-1">Say hi to {selectedConversation?.username}</p>
              <p className="text-accent-beige/60 text-sm">Start a conversation now</p>
            </div>
          ) : (
            messages.map((message) => {
              const isMe = message.userId === (user?.id || 'me');
              return (
                <div
                  key={message.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-3xl px-4 py-2.5 ${
                        isMe
                          ? 'bg-deep-purple text-accent-beige'
                          : 'bg-deep-purple/20 text-accent-beige'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">
                        {message.text}
                      </p>
                    </div>
                    <p className={`text-[10px] text-accent-beige/50 mt-1 px-2 ${isMe ? 'text-right' : 'text-left'}`}>
                      {new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-matte-black border-t border-deep-purple/20 px-4 py-3">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 hover:bg-deep-purple/20 rounded-full transition-colors flex-shrink-0"
          >
            <MoreHorizontal className="text-accent-beige/60" size={24} />
          </button>
          
          <div className="flex-1 flex items-center gap-2 bg-deep-purple/10 rounded-full px-4 py-2.5 border border-deep-purple/20">
            <button
              type="button"
              className="flex-shrink-0"
            >
              <Smile className="text-accent-beige/60" size={20} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent text-accent-beige text-sm placeholder-accent-beige/40 focus:outline-none"
              placeholder="Send a message..."
            />
          </div>

          <button
            type="button"
            className="p-2 hover:bg-deep-purple/20 rounded-full transition-colors flex-shrink-0"
          >
            <Heart className="text-accent-beige/60" size={24} />
          </button>

          <button
            type="submit"
            disabled={!input.trim()}
            className={`p-2.5 rounded-full transition-all flex-shrink-0 ${
              input.trim()
                ? 'bg-deep-purple hover:bg-deep-purple/80 text-accent-beige'
                : 'bg-deep-purple/20 text-accent-beige/40'
            }`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
