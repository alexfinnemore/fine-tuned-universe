'use client';

import { useState } from 'react';

interface SenseiSuggestion {
    id: string;
    type: 'question' | 'corpus_addition' | 'inconsistency' | 'expansion' | 'clarification';
    content: string;
    priority: 'low' | 'medium' | 'high';
}

interface SenseiMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface SenseiPanelProps {
    universeId: string;
    universeName: string;
    suggestions: SenseiSuggestion[];
    onDismissSuggestion: (id: string) => void;
    theme: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
    };
}

export function SenseiPanel({
    universeId,
    universeName,
    suggestions,
    onDismissSuggestion,
    theme,
}: SenseiPanelProps) {
    const [messages, setMessages] = useState<SenseiMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: SenseiMessage = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/sensei/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    universeId,
                    message: input,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to get sensei response');
            }

            // Handle streaming response
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let senseiMessage = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === 'token') {
                                senseiMessage += data.token;
                                setMessages([...newMessages, { role: 'assistant', content: senseiMessage }]);
                            } else if (data.type === 'error') {
                                throw new Error(data.message);
                            }
                        }
                    }
                }
            }
        } catch (err: any) {
            console.error('Sensei chat error:', err);
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

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return theme.accent;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'question': return '❓';
            case 'corpus_addition': return '📝';
            case 'inconsistency': return '⚠️';
            case 'expansion': return '✨';
            case 'clarification': return '💡';
            default: return '💬';
        }
    };

    return (
        <div
            className="flex flex-col h-full border-l"
            style={{ borderColor: `${theme.primary}30`, backgroundColor: 'rgba(0,0,0,0.2)' }}
        >
            {/* Header */}
            <div
                className="p-4 border-b"
                style={{ borderColor: `${theme.primary}30` }}
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        💡 Creative Sensei
                    </h3>
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className="text-xs px-3 py-1 rounded-lg transition"
                        style={{
                            backgroundColor: `${theme.primary}30`,
                            color: theme.accent
                        }}
                    >
                        {showChat ? 'Suggestions' : 'Chat'}
                    </button>
                </div>
                <p className="text-xs mt-1" style={{ color: theme.text }}>
                    Guiding you to build {universeName}
                </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {!showChat ? (
                    // Suggestions view
                    <div className="space-y-3">
                        {suggestions.length === 0 ? (
                            <div className="text-center py-8" style={{ color: theme.text }}>
                                <p className="text-sm">No suggestions yet</p>
                                <p className="text-xs mt-2 opacity-70">
                                    Chat with your universe to get guidance
                                </p>
                            </div>
                        ) : (
                            suggestions.map((suggestion) => (
                                <div
                                    key={suggestion.id}
                                    className="p-3 rounded-lg border"
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        borderColor: `${getPriorityColor(suggestion.priority)}50`,
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                                                <span
                                                    className="text-xs font-semibold uppercase"
                                                    style={{ color: getPriorityColor(suggestion.priority) }}
                                                >
                                                    {suggestion.priority}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white leading-relaxed">
                                                {suggestion.content}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onDismissSuggestion(suggestion.id)}
                                            className="text-xs opacity-50 hover:opacity-100 transition"
                                            style={{ color: theme.text }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    // Chat view
                    <div className="space-y-3">
                        {messages.length === 0 ? (
                            <div className="text-center py-8" style={{ color: theme.text }}>
                                <p className="text-sm">Ask your sensei anything</p>
                                <p className="text-xs mt-2 opacity-70">
                                    Get guidance on building your universe
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`p-3 rounded-lg ${msg.role === 'user' ? 'ml-4' : 'mr-4'}`}
                                    style={{
                                        backgroundColor: msg.role === 'user'
                                            ? `${theme.primary}30`
                                            : 'rgba(255,255,255,0.05)',
                                        borderLeft: msg.role === 'assistant'
                                            ? `3px solid ${theme.accent}`
                                            : 'none',
                                    }}
                                >
                                    <div className="text-xs font-semibold mb-1" style={{ color: theme.accent }}>
                                        {msg.role === 'user' ? 'You' : 'Sensei'}
                                    </div>
                                    <div className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}
                        {loading && (
                            <div className="flex items-center gap-2 text-sm" style={{ color: theme.accent }}>
                                <div
                                    className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2"
                                    style={{ borderColor: theme.primary }}
                                />
                                <span>Sensei is thinking...</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input (only in chat mode) */}
            {showChat && (
                <div
                    className="p-3 border-t"
                    style={{ borderColor: `${theme.primary}30` }}
                >
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask sensei..."
                            className="flex-1 bg-white/5 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                            style={{ borderColor: `${theme.primary}50` }}
                            disabled={loading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            className="px-4 py-2 text-white rounded-lg transition text-sm font-medium disabled:opacity-30"
                            style={{ backgroundColor: theme.primary }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
