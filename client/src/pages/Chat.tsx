import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Send, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Welcome to UTH! I'm here to motivate and support you. What talent would you like to share today? 🌟",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const motivationalMessages = [
    "Keep shining 🌟 Your talent inspires others!",
    "You're doing amazing! Every step forward counts.",
    "Your creativity is a gift to the world. Keep sharing it!",
    "Believe in yourself! You have something special to offer.",
    "Don't be afraid to be unique. That's what makes you stand out!",
    "Your passion is contagious. Keep pursuing your dreams!",
    "Every expert was once a beginner. Keep practicing!",
    "You're making a difference. Keep going!",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-matte-black pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-deep-purple/20 rounded-full glow-purple">
            <Sparkles className="text-deep-purple" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-accent-beige">AI Assistant</h1>
            <p className="text-accent-beige/60 text-sm">Your motivational companion</p>
          </div>
        </div>

        <div className="bg-matte-black border border-deep-purple/30 rounded-2xl h-[calc(100vh-280px)] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-deep-purple/20 text-accent-beige'
                      : 'bg-rich-brown/30 text-accent-beige border border-rich-brown/20'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className="text-xs opacity-60 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
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

