'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Universe {
  id: string;
  name: string;
  personality: string;
  corpusCount: number;
  model: string;
  type: 'template' | 'user';
  lastChat?: string;
  creativity: string;
}

export default function Home() {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUniverses() {
      try {
        const res = await fetch('/api/universes');
        if (!res.ok) {
          throw new Error('Failed to fetch universes');
        }
        const data = await res.json();
        setUniverses(data.universes);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUniverses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading universes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">❌ Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const templates = universes.filter(u => u.type === 'template');
  const userUniverses = universes.filter(u => u.type === 'user');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🌌 Fine-Tuned Universe
              </h1>
              <p className="text-purple-300">
                Select a universe to begin your journey
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/how-it-works"
                className="px-6 py-3 bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 hover:text-white rounded-lg transition font-medium border border-purple-700/50"
              >
                📖 How It Works
              </Link>
              <Link
                href="/create"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium"
              >
                + Create Universe
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Templates Section */}
        {templates.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-purple-400 mr-2">📚</span>
              Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((universe) => (
                <UniverseCard key={universe.id} universe={universe} />
              ))}
            </div>
          </div>
        )}

        {/* User Universes Section */}
        {userUniverses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-green-400 mr-2">🌟</span>
              Your Universes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userUniverses.map((universe) => (
                <UniverseCard key={universe.id} universe={universe} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {universes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-purple-300 text-xl mb-6">
              No universes found. Create your first universe to get started!
            </p>
            <Link
              href="/create"
              className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium text-lg"
            >
              Create Your First Universe
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function UniverseCard({ universe }: { universe: Universe }) {
  const isTemplate = universe.type === 'template';

  return (
    <Link href={`/universe/${universe.id}`}>
      <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:bg-white/10 hover:border-purple-500/40 transition-all cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition">
            {universe.name}
          </h3>
          {isTemplate ? (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded">
              Template
            </span>
          ) : (
            <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded">
              Yours
            </span>
          )}
        </div>

        {/* Personality */}
        <p className="text-purple-200 text-sm mb-4 line-clamp-2">
          {universe.personality}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-purple-300">
          <div className="flex items-center gap-1">
            <span>📁</span>
            <span>{universe.corpusCount} files</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🎨</span>
            <span className="capitalize">{universe.creativity}</span>
          </div>
        </div>

        {/* Last Chat */}
        {universe.lastChat && (
          <div className="mt-4 pt-4 border-t border-purple-500/20">
            <p className="text-xs text-purple-400">
              Last chat: {new Date(universe.lastChat).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
