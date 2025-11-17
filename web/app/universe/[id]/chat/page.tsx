'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UniverseInfo {
  id: string;
  name: string;
  personality: string;
}

interface UniverseTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  gradient: string[];
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [universe, setUniverse] = useState<UniverseInfo | null>(null);
  const [theme, setTheme] = useState<UniverseTheme | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load universe info and theme
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/universes/${params.id}`);
        if (!res.ok) throw new Error('Universe not found');
        const data = await res.json();
        setUniverse({
          id: data.id,
          name: data.name,
          personality: data.personality,
        });

        // Fetch theme
        const themeRes = await fetch(`/api/universes/${params.id}/theme`);
        if (themeRes.ok) {
          const themeData = await themeRes.json();
          setTheme(themeData.theme);
        }
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchData();
  }, [params.id]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universeId: params.id,
          messages: newMessages,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to get response');
      }

      const data = await res.json();

      // Add assistant response
      setMessages([...newMessages, { role: 'assistant', content: data.response }]);

      // Update stats
      setTotalTokens(prev => prev + data.inputTokens + data.outputTokens);
      setTotalCost(prev => prev + data.cost);
    } catch (err: any) {
      setError(err.message);
      // Remove user message if request failed
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (confirm('Clear all messages?')) {
      setMessages([]);
      setTotalTokens(0);
      setTotalCost(0);
    }
  };

  // Apply dynamic theme
  const bgGradient = theme
    ? `linear-gradient(to bottom right, ${theme.gradient[0]}, ${theme.gradient[1]}, ${theme.gradient[2]})`
    : 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)';

  const primaryColor = theme?.primary || '#8b5cf6';
  const accentColor = theme?.accent || '#a78bfa';
  const textColor = theme?.text || '#e9d5ff';

  if (error && !universe) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bgGradient }}>
        <div className="text-center text-white">
          <p className="text-xl mb-4">❌ {error}</p>
          <Link href="/" className="px-6 py-2 rounded-lg transition" style={{ backgroundColor: primaryColor }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: bgGradient }}>
      {/* Header */}
      <div className="border-b bg-black/20 backdrop-blur-sm" style={{ borderColor: `${primaryColor}20` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/universe/${params.id}`}
                className="hover:text-white transition"
                style={{ color: accentColor }}
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  💬 {universe?.name || 'Loading...'}
                </h1>
                {universe && (
                  <p className="text-sm mt-1" style={{ color: accentColor }}>{universe.personality}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm" style={{ color: textColor }}>
                  {totalTokens.toLocaleString()} tokens
                </div>
                <div className="text-xs" style={{ color: accentColor }}>
                  ${totalCost.toFixed(4)}
                </div>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12" style={{ color: accentColor }}>
              <p className="text-xl mb-2">Start a conversation</p>
              <p className="text-sm" style={{ color: textColor }}>
                Type a message below to begin chatting with {universe?.name}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-3xl rounded-xl p-4 border"
                style={msg.role === 'user'
                  ? {
                      backgroundColor: `${primaryColor}30`,
                      borderColor: `${primaryColor}50`,
                      color: '#f3f4f6'
                    }
                  : {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderColor: `${primaryColor}33`,
                      color: textColor
                    }
                }
              >
                <div className="text-xs font-semibold mb-2" style={{ color: accentColor }}>
                  {msg.role === 'user' ? 'You' : universe?.name}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-3xl rounded-xl p-4 bg-white/5 border" style={{ borderColor: `${primaryColor}33` }}>
                <div className="text-xs font-semibold mb-2" style={{ color: accentColor }}>
                  {universe?.name}
                </div>
                <div className="flex items-center gap-2" style={{ color: accentColor }}>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300">
              ❌ {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-black/20 backdrop-blur-sm" style={{ borderColor: `${primaryColor}20` }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="flex-1 bg-white/5 border rounded-xl px-4 py-3 text-white resize-none focus:outline-none placeholder-opacity-50"
              style={{
                borderColor: `${primaryColor}50`,
                color: '#ffffff'
              }}
              rows={2}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="px-8 py-3 text-white rounded-xl transition font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Send
            </button>
          </div>
          <div className="mt-2 text-xs text-center" style={{ color: accentColor }}>
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}
