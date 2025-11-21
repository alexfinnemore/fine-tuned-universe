import { NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';
import { loadUniverseConfig } from '../../../dist/utils/config.js';
import { loadCorpus } from '../../../dist/utils/corpus.js';
import { buildSystemPrompt } from '../../../dist/core/prompt.js';
import { ClaudeClient } from '../../../dist/core/claude.js';

const PROJECT_ROOT = process.cwd();

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  universeId: string;
  messages: Message[];
}

// Cache for universe data (config + system prompt)
interface UniverseCache {
  config: any;
  systemPrompt: string;
  lastAccess: number;
}

const universeCache = new Map<string, UniverseCache>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Clean up stale cache entries
function cleanCache() {
  const now = Date.now();
  for (const [key, value] of universeCache.entries()) {
    if (now - value.lastAccess > CACHE_TTL) {
      universeCache.delete(key);
    }
  }
}

// Get or load universe data
function getUniverseData(universeId: string, universePath: string): UniverseCache {
  const cached = universeCache.get(universeId);
  const now = Date.now();

  if (cached && now - cached.lastAccess < CACHE_TTL) {
    cached.lastAccess = now;
    return cached;
  }

  // Load fresh data
  const config = loadUniverseConfig(universePath);
  const corpus = loadCorpus(universePath);
  const systemPrompt = buildSystemPrompt(config, corpus);

  const cacheEntry: UniverseCache = {
    config,
    systemPrompt,
    lastAccess: now,
  };

  universeCache.set(universeId, cacheEntry);
  cleanCache(); // Clean up old entries

  return cacheEntry;
}

export async function POST(request: Request) {
  try {
    const { universeId, messages }: ChatRequest = await request.json();

    if (!universeId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: universeId and messages required' },
        { status: 400 }
      );
    }

    // Locate universe
    const templatePath = join(PROJECT_ROOT, 'templates', universeId);
    const userPath = join(PROJECT_ROOT, 'universes', universeId);

    let universePath: string;
    if (existsSync(userPath)) {
      universePath = userPath;
    } else if (existsSync(templatePath)) {
      universePath = templatePath;
    } else {
      return NextResponse.json(
        { error: 'Universe not found' },
        { status: 404 }
      );
    }

    // Get cached universe data
    const { config, systemPrompt } = getUniverseData(universeId, universePath);

    // Initialize Claude client
    const claude = new ClaudeClient(config.model);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let inputTokens = 0;
          let outputTokens = 0;
          let cost = 0;

          // Stream tokens from Claude
          for await (const chunk of claude.chatStream(systemPrompt, messages)) {
            if (chunk.token) {
              // Send token as SSE
              const data = JSON.stringify({ type: 'token', token: chunk.token });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }

            if (chunk.done) {
              inputTokens = chunk.inputTokens || 0;
              outputTokens = chunk.outputTokens || 0;
              cost = chunk.cost || 0;

              // Send final stats
              const data = JSON.stringify({
                type: 'done',
                inputTokens,
                outputTokens,
                cost,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          controller.close();
        } catch (error: any) {
          const errorData = JSON.stringify({
            type: 'error',
            message: error.message,
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat', message: error.message },
      { status: 500 }
    );
  }
}
