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

interface UniverseTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  gradient: string[];
}

interface ImageFile {
  filename: string;
  url: string;
  size: number;
}

export default function UniversePage() {
  const params = useParams();
  const router = useRouter();
  const [universe, setUniverse] = useState<UniverseDetails | null>(null);
  const [theme, setTheme] = useState<UniverseTheme | null>(null);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCorpus, setSelectedCorpus] = useState<string | null>(null);
  const [corpusContent, setCorpusContent] = useState<string>('');
  const [editingCorpus, setEditingCorpus] = useState(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch universe details
        const universeRes = await fetch(`/api/universes/${params.id}`);
        if (!universeRes.ok) throw new Error('Universe not found');
        const universeData = await universeRes.json();
        setUniverse(universeData);

        // Fetch theme
        const themeRes = await fetch(`/api/universes/${params.id}/theme`);
        if (themeRes.ok) {
          const themeData = await themeRes.json();
          setTheme(themeData.theme);
        }

        // Fetch images
        const imagesRes = await fetch(`/api/universes/${params.id}/images`);
        if (imagesRes.ok) {
          const imagesData = await imagesRes.json();
          setImages(imagesData.images || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  const openCorpusFile = async (filename: string) => {
    try {
      const res = await fetch(`/api/universes/${params.id}/corpus/${filename}`);
      if (!res.ok) throw new Error('Failed to load corpus file');
      const data = await res.json();
      setCorpusContent(data.content);
      setEditedContent(data.content);
      setSelectedCorpus(filename);
      setEditingCorpus(false);
    } catch (err: any) {
      alert(`Error loading file: ${err.message}`);
    }
  };

  const saveCorpusFile = async () => {
    if (!selectedCorpus) return;

    try {
      const res = await fetch(`/api/universes/${params.id}/corpus/${selectedCorpus}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save');
      }

      setCorpusContent(editedContent);
      setEditingCorpus(false);
      alert('Saved successfully!');
    } catch (err: any) {
      alert(`Error saving: ${err.message}`);
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/universes/${params.id}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to upload');
      }

      // Refresh images
      const imagesRes = await fetch(`/api/universes/${params.id}/images`);
      if (imagesRes.ok) {
        const imagesData = await imagesRes.json();
        setImages(imagesData.images || []);
      }
    } catch (err: any) {
      alert(`Error uploading: ${err.message}`);
    }
  };

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
          <Link href="/" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Apply dynamic theme
  const bgGradient = theme
    ? `linear-gradient(to bottom right, ${theme.gradient[0]}, ${theme.gradient[1]}, ${theme.gradient[2]})`
    : 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)';

  const primaryColor = theme?.primary || '#8b5cf6';
  const accentColor = theme?.accent || '#a78bfa';
  const textColor = theme?.text || '#e9d5ff';

  return (
    <div className="min-h-screen" style={{ background: bgGradient }}>
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-white transition" style={{ color: accentColor }}>
                ← Back
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                  {universe.name}
                  {universe.type === 'template' ? (
                    <span className="px-3 py-1 text-sm font-medium rounded" style={{
                      backgroundColor: `${primaryColor}20`,
                      color: accentColor
                    }}>
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
              className="px-8 py-4 text-white rounded-lg transition font-medium text-lg hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
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
            <div className="bg-white/5 backdrop-blur-sm border rounded-xl p-6" style={{ borderColor: `${primaryColor}33` }}>
              <h2 className="text-2xl font-bold text-white mb-4">Personality</h2>
              <p className="leading-relaxed" style={{ color: textColor }}>
                {universe.personality}
              </p>
            </div>

            {/* Rules */}
            {universe.rules && universe.rules.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border rounded-xl p-6" style={{ borderColor: `${primaryColor}33` }}>
                <h2 className="text-2xl font-bold text-white mb-4">Core Rules</h2>
                <ul className="space-y-2">
                  {universe.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2" style={{ color: textColor }}>
                      <span style={{ color: accentColor }}>•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Images Gallery */}
            {images.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border rounded-xl p-6" style={{ borderColor: `${primaryColor}33` }}>
                <h2 className="text-2xl font-bold text-white mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="relative group cursor-pointer overflow-hidden rounded-lg border"
                      style={{ borderColor: `${primaryColor}33` }}
                      onClick={() => setSelectedImage(img.url)}
                    >
                      <img
                        src={img.url}
                        alt={img.filename}
                        className="w-full h-48 object-cover transition group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="text-white text-sm">View</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Image (User universes only) */}
            {universe.type === 'user' && (
              <div className="bg-white/5 backdrop-blur-sm border rounded-xl p-6" style={{ borderColor: `${primaryColor}33` }}>
                <h2 className="text-xl font-bold text-white mb-4">Add Image</h2>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white hover:file:opacity-90 transition"
                  style={{
                    color: textColor,
                    backgroundColor: `${primaryColor}10`,
                    fileButtonBackgroundColor: primaryColor
                  }}
                />
              </div>
            )}

            {/* Corpus */}
            <div className="bg-white/5 backdrop-blur-sm border rounded-xl p-6" style={{ borderColor: `${primaryColor}33` }}>
              <h2 className="text-2xl font-bold text-white mb-4">Knowledge Base</h2>
              <div className="space-y-2">
                {universe.corpusFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition"
                    onClick={() => openCorpusFile(file.name)}
                  >
                    <span style={{ color: textColor }}>📄 {file.name}</span>
                    <span className="text-sm" style={{ color: accentColor }}>
                      {file.tokens.toLocaleString()} tokens
                    </span>
                  </div>
                ))}
                {universe.corpusFiles.length === 0 && (
                  <p style={{ color: accentColor }}>No corpus files yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Configuration */}
            <div className="bg-white/5 backdrop-blur-sm border rounded-xl p-6" style={{ borderColor: `${primaryColor}33` }}>
              <h2 className="text-xl font-bold text-white mb-4">Configuration</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm" style={{ color: accentColor }}>Model</div>
                  <div className="text-white">{universe.model}</div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: accentColor }}>Tone</div>
                  <div className="text-white">{universe.tone}</div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: accentColor }}>Creativity</div>
                  <div className="text-white capitalize">{universe.creativity}</div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: accentColor }}>Corpus Files</div>
                  <div className="text-white">{universe.corpusCount}</div>
                </div>
                {universe.lastChat && (
                  <div>
                    <div className="text-sm" style={{ color: accentColor }}>Last Chat</div>
                    <div className="text-white">
                      {new Date(universe.lastChat).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vocabulary */}
            {universe.vocabulary && universe.vocabulary.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border rounded-xl p-6" style={{ borderColor: `${primaryColor}33` }}>
                <h2 className="text-xl font-bold text-white mb-4">Vocabulary</h2>
                <div className="flex flex-wrap gap-2">
                  {universe.vocabulary.map((word, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-sm rounded-full"
                      style={{
                        backgroundColor: `${primaryColor}33`,
                        color: accentColor
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Forbidden Words */}
            {universe.forbidden_words && universe.forbidden_words.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border rounded-xl p-6" style={{ borderColor: `${primaryColor}33` }}>
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

      {/* Corpus Viewer Modal */}
      {selectedCorpus && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedCorpus(null)}>
          <div
            className="bg-white/10 backdrop-blur-xl rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col border"
            style={{ borderColor: `${primaryColor}66` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: `${primaryColor}33` }}>
              <h3 className="text-2xl font-bold text-white">{selectedCorpus}</h3>
              <div className="flex gap-3">
                {universe.type === 'user' && (
                  <>
                    {editingCorpus ? (
                      <>
                        <button
                          onClick={saveCorpusFile}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditedContent(corpusContent);
                            setEditingCorpus(false);
                          }}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingCorpus(true)}
                        className="px-4 py-2 text-white rounded-lg transition"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Edit
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => setSelectedCorpus(null)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {editingCorpus ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-full min-h-[400px] bg-black/30 border rounded-lg p-4 text-white font-mono text-sm focus:outline-none"
                  style={{ borderColor: `${primaryColor}33`, color: textColor }}
                />
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed" style={{ color: textColor }}>
                  {corpusContent}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50" onClick={() => setSelectedImage(null)}>
          <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Full size" className="w-full h-auto rounded-xl border-2" style={{ borderColor: primaryColor }} />
            <button
              onClick={() => setSelectedImage(null)}
              className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition mx-auto block"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
