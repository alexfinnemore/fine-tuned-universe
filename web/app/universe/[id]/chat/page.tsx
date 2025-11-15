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

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [universe, setUniverse] = useState<UniverseInfo | null>(null);
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

  // Load universe info
  useEffect(() => {
    async function fetchUniverse() {
      try {
        const res = await fetch(`/api/universes/${params.id}`);
        if (!res.ok) throw new Error('Universe not found');
        const data = await res.json();
        setUniverse({
          id: data.id,
          name: data.name,
          personality: data.personality,
        });
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchUniverse();
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

  if (error && !universe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">❌ {error}</p>
          <Link href="/" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/universe/${params.id}`}
                className="text-purple-300 hover:text-white transition"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  💬 {universe?.name || 'Loading...'}
                </h1>
                {universe && (
                  <p className="text-purple-300 text-sm mt-1">{universe.personality}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-purple-200 text-sm">
                  {totalTokens.toLocaleString()} tokens
                </div>
                <div className="text-purple-400 text-xs">
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
            <div className="text-center text-purple-300 py-12">
              <p className="text-xl mb-2">Start a conversation</p>
              <p className="text-sm text-purple-400">
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
                className={`max-w-3xl rounded-xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-purple-600/30 border border-purple-500/30 text-purple-50'
                    : 'bg-white/5 border border-purple-500/20 text-purple-100'
                }`}
              >
                <div className="text-xs font-semibold mb-2 text-purple-300">
                  {msg.role === 'user' ? 'You' : universe?.name}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-3xl rounded-xl p-4 bg-white/5 border border-purple-500/20">
                <div className="text-xs font-semibold mb-2 text-purple-300">
                  {universe?.name}
                </div>
                <div className="flex items-center gap-2 text-purple-300">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-400"></div>
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
      <div className="border-t border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="flex-1 bg-white/5 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-500 resize-none"
              rows={2}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/30 disabled:cursor-not-allowed text-white rounded-xl transition font-medium"
            >
              Send
            </button>
          </div>
          <div className="mt-2 text-purple-400 text-xs text-center">
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}
