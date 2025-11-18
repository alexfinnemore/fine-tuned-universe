'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type DocType = 'user' | 'technical';

export default function HowItWorksPage() {
  const [selectedDoc, setSelectedDoc] = useState<DocType>('user');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoc() {
      setLoading(true);
      try {
        const res = await fetch(`/api/documentation/${selectedDoc}`);
        const data = await res.json();
        setContent(data.content);
      } catch (error) {
        console.error('Error fetching documentation:', error);
        setContent('Failed to load documentation.');
      } finally {
        setLoading(false);
      }
    }

    fetchDoc();
  }, [selectedDoc]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-purple-400 hover:text-purple-300 transition text-sm mb-2 block">
                ← Back to Home
              </Link>
              <h1 className="text-4xl font-bold text-white mb-2">
                📖 How It Works
              </h1>
              <p className="text-purple-300">
                Understanding Fine-Tuned Universe
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Toggle between User and Technical docs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedDoc('user')}
            className={`px-6 py-3 rounded-lg transition font-medium ${
              selectedDoc === 'user'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'
            }`}
          >
            👤 For Users
          </button>
          <button
            onClick={() => setSelectedDoc('technical')}
            className={`px-6 py-3 rounded-lg transition font-medium ${
              selectedDoc === 'technical'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'
            }`}
          >
            ⚙️ Technical Details
          </button>
        </div>

        {/* Documentation content */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-800/30 rounded-xl p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-purple-300">Loading documentation...</p>
            </div>
          ) : (
            <div className="prose prose-invert prose-purple max-w-none">
              <MarkdownContent content={content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple markdown renderer component
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.JSX.Element[] = [];
  let currentIndex = 0;

  // Helper function to format inline markdown (bold, inline code, links)
  const formatInline = (text: string) => {
    const parts: (string | React.JSX.Element)[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Inline code `code`
      const codeMatch = remaining.match(/`([^`]+)`/);
      if (codeMatch && codeMatch.index !== undefined) {
        if (codeMatch.index > 0) {
          parts.push(remaining.substring(0, codeMatch.index));
        }
        parts.push(
          <code key={key++} className="bg-slate-900 text-purple-300 px-2 py-1 rounded text-sm border border-purple-800/50">
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.substring(codeMatch.index + codeMatch[0].length);
        continue;
      }

      // Bold **text**
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(remaining.substring(0, boldMatch.index));
        }
        parts.push(
          <strong key={key++} className="font-bold text-white">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
        continue;
      }

      // Links [text](url)
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch && linkMatch.index !== undefined) {
        if (linkMatch.index > 0) {
          parts.push(remaining.substring(0, linkMatch.index));
        }
        parts.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.substring(linkMatch.index + linkMatch[0].length);
        continue;
      }

      // No more matches, add remaining text
      parts.push(remaining);
      break;
    }

    return <>{parts}</>;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headers
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-4xl font-bold text-white mb-6 mt-8 border-b border-purple-800/30 pb-3">
          {formatInline(line.substring(2))}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-3xl font-bold text-purple-300 mb-4 mt-8">
          {formatInline(line.substring(3))}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-2xl font-bold text-purple-400 mb-3 mt-6">
          {formatInline(line.substring(4))}
        </h3>
      );
    } else if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={i} className="text-xl font-bold text-purple-400 mb-2 mt-4">
          {formatInline(line.substring(5))}
        </h4>
      );
    }
    // Code blocks
    else if (line.startsWith('```')) {
      const language = line.substring(3).trim();
      const codeLines: string[] = [];
      i++; // Skip opening ```
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={currentIndex++} className="my-4">
          {language && (
            <div className="bg-slate-950 text-purple-400 text-xs px-3 py-1 rounded-t-lg border border-b-0 border-purple-800/30">
              {language}
            </div>
          )}
          <pre className={`bg-slate-900 text-purple-200 p-4 ${language ? 'rounded-b-lg' : 'rounded-lg'} overflow-x-auto border border-purple-800/30 text-sm`}>
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
    }
    // Blockquotes
    else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-purple-500 pl-4 italic text-purple-300 my-4 bg-purple-900/20 py-2 rounded-r">
          {formatInline(line.substring(2))}
        </blockquote>
      );
    }
    // Unordered lists
    else if (line.match(/^[-*]\s/)) {
      const listItems: string[] = [line];
      while (i + 1 < lines.length && lines[i + 1].match(/^[-*]\s/)) {
        i++;
        listItems.push(lines[i]);
      }
      elements.push(
        <ul key={currentIndex++} className="list-disc list-inside text-purple-200 space-y-2 my-4 ml-4">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {formatInline(item.substring(2))}
            </li>
          ))}
        </ul>
      );
    }
    // Horizontal rules
    else if (line === '---' || line === '***') {
      elements.push(
        <hr key={i} className="border-purple-800/30 my-8" />
      );
    }
    // Regular paragraphs
    else if (line.trim() !== '') {
      elements.push(
        <p key={i} className="text-purple-200 leading-relaxed my-3">
          {formatInline(line)}
        </p>
      );
    }
    // Empty lines
    else {
      elements.push(<div key={i} className="h-2" />);
    }
  }

  return <div className="documentation-content">{elements}</div>;
}
