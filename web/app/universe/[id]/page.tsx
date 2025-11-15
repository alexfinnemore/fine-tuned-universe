'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface UniverseDetails {
  id: string;
  name: string;
  personality: string;
  model: string;
  tone: string;
  creativity: string;
  rules: string[];
  vocabulary?: string[];
  forbidden_words?: string[];
  corpusCount: number;
  corpusFiles: Array<{ name: string; tokens: number }>;
  type: 'template' | 'user';
  lastChat?: string;
}

export default function UniversePage() {
  const params = useParams();
  const router = useRouter();
  const [universe, setUniverse] = useState<UniverseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUniverse() {
      try {
        const res = await fetch(`/api/universes/${params.id}`);
        if (!res.ok) {
          throw new Error('Universe not found');
        }
        const data = await res.json();
        setUniverse(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUniverse();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading universe...</p>
        </div>
      </div>
    );
  }

  if (error || !universe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">❌ {error || 'Universe not found'}</p>
          <Link
            href="/"
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-purple-300 hover:text-white transition"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                  {universe.name}
                  {universe.type === 'template' ? (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded">
                      Template
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm font-medium rounded">
                      Your Universe
                    </span>
                  )}
                </h1>
              </div>
            </div>
            <button
              onClick={() => router.push(`/universe/${params.id}/chat`)}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium text-lg"
            >
              💬 Start Chat
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personality */}
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Personality</h2>
              <p className="text-purple-200 leading-relaxed">
                {universe.personality}
              </p>
            </div>

            {/* Rules */}
            {universe.rules && universe.rules.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Core Rules</h2>
                <ul className="space-y-2">
                  {universe.rules.map((rule, i) => (
                    <li key={i} className="text-purple-200 flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Corpus */}
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Knowledge Base</h2>
              <div className="space-y-2">
                {universe.corpusFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <span className="text-purple-200">📄 {file.name}</span>
                    <span className="text-purple-400 text-sm">
                      {file.tokens.toLocaleString()} tokens
                    </span>
                  </div>
                ))}
                {universe.corpusFiles.length === 0 && (
                  <p className="text-purple-400">No corpus files yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Configuration */}
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Configuration</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-purple-400 text-sm">Model</div>
                  <div className="text-white">{universe.model}</div>
                </div>
                <div>
                  <div className="text-purple-400 text-sm">Tone</div>
                  <div className="text-white">{universe.tone}</div>
                </div>
                <div>
                  <div className="text-purple-400 text-sm">Creativity</div>
                  <div className="text-white capitalize">{universe.creativity}</div>
                </div>
                <div>
                  <div className="text-purple-400 text-sm">Corpus Files</div>
                  <div className="text-white">{universe.corpusCount}</div>
                </div>
                {universe.lastChat && (
                  <div>
                    <div className="text-purple-400 text-sm">Last Chat</div>
                    <div className="text-white">
                      {new Date(universe.lastChat).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vocabulary */}
            {universe.vocabulary && universe.vocabulary.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Vocabulary</h2>
                <div className="flex flex-wrap gap-2">
                  {universe.vocabulary.map((word, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Forbidden Words */}
            {universe.forbidden_words && universe.forbidden_words.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Forbidden Words</h2>
                <div className="flex flex-wrap gap-2">
                  {universe.forbidden_words.map((word, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded-full line-through"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
