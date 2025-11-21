'use client';

import { useState } from 'react';

interface DiffSuggestion {
    id: string;
    type: 'diff';
    content: string;
    priority: 'low' | 'medium' | 'high';
    diff: {
        filePath: string;
        operation: 'append' | 'insert' | 'replace';
        afterContent: string;
        preview: string;
    };
}

interface DiffSuggestionProps {
    suggestion: DiffSuggestion;
    onAccept: () => void;
    onReject: () => void;
    theme: {
        primary: string;
        accent: string;
        text: string;
    };
}

export function DiffSuggestionComponent({
    suggestion,
    onAccept,
    onReject,
    theme
}: DiffSuggestionProps) {
    const [expanded, setExpanded] = useState(true);
    const [applying, setApplying] = useState(false);

    const handleAccept = async () => {
        setApplying(true);
        try {
            await onAccept();
        } finally {
            setApplying(false);
        }
    };

    return (
        <div
            className="border rounded-lg overflow-hidden"
            style={{ borderColor: `${theme.primary}50` }}
        >
            {/* Header */}
            <div
                className="p-3 flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(!expanded)}
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">📝</span>
                    <span className="text-sm font-medium text-white">
                        {suggestion.content}
                    </span>
                </div>
                <span className="text-xs ml-2" style={{ color: theme.text }}>
                    {expanded ? '▼' : '▶'}
                </span>
            </div>

            {/* Diff Preview */}
            {expanded && (
                <div className="border-t" style={{ borderColor: `${theme.primary}30` }}>
                    {/* File path */}
                    <div
                        className="px-3 py-2 text-xs font-mono flex items-center gap-2"
                        style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: theme.accent }}
                    >
                        <span>📄</span>
                        <span>{suggestion.diff.filePath}</span>
                        <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}
                        >
                            {suggestion.diff.operation}
                        </span>
                    </div>

                    {/* Diff content */}
                    <div
                        className="p-3 overflow-x-auto"
                        style={{ backgroundColor: 'rgba(0,0,0,0.2)', maxHeight: '300px', overflowY: 'auto' }}
                    >
                        <pre className="text-xs font-mono">
                            {suggestion.diff.preview.split('\n').map((line, i) => (
                                <div
                                    key={i}
                                    className="leading-relaxed"
                                    style={{
                                        color: line.startsWith('+') ? '#22c55e' :
                                            line.startsWith('-') ? '#ef4444' :
                                                theme.text,
                                        backgroundColor: line.startsWith('+') ? 'rgba(34, 197, 94, 0.1)' :
                                            line.startsWith('-') ? 'rgba(239, 68, 68, 0.1)' :
                                                'transparent'
                                    }}
                                >
                                    {line}
                                </div>
                            ))}
                        </pre>
                    </div>

                    {/* Actions */}
                    <div
                        className="p-3 flex gap-2 border-t"
                        style={{ borderColor: `${theme.primary}30` }}
                    >
                        <button
                            onClick={handleAccept}
                            disabled={applying}
                            className="flex-1 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                            style={{
                                backgroundColor: '#22c55e',
                                color: '#fff'
                            }}
                        >
                            {applying ? '⏳ Applying...' : '✓ Accept'}
                        </button>
                        <button
                            onClick={onReject}
                            disabled={applying}
                            className="flex-1 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                            style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)'
                            }}
                        >
                            ✗ Reject
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
