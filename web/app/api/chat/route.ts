import { NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';

// Import from CLI source
const PROJECT_ROOT = join(process.cwd(), '..');

// Dynamic imports to handle ES modules
async function loadChatDependencies() {
  const configModule = await import(join(PROJECT_ROOT, 'dist/utils/config.js'));
  const corpusModule = await import(join(PROJECT_ROOT, 'dist/utils/corpus.js'));
  const promptModule = await import(join(PROJECT_ROOT, 'dist/core/prompt.js'));
  const claudeModule = await import(join(PROJECT_ROOT, 'dist/core/claude.js'));

  return {
    loadUniverseConfig: configModule.loadUniverseConfig,
    loadCorpus: corpusModule.loadCorpus,
    buildSystemPrompt: promptModule.buildSystemPrompt,
    ClaudeClient: claudeModule.ClaudeClient,
  };
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  universeId: string;
  messages: Message[];
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

    // Load dependencies
    const {
      loadUniverseConfig,
      loadCorpus,
      buildSystemPrompt,
      ClaudeClient,
    } = await loadChatDependencies();

    // Load universe
    const config = loadUniverseConfig(universePath);
    const corpus = loadCorpus(universePath);
    const systemPrompt = buildSystemPrompt(config, corpus);

    // Initialize Claude client
    const claude = new ClaudeClient(config.model);

    // Get response
    const result = await claude.chat(systemPrompt, messages);

    return NextResponse.json({
      response: result.response,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      cost: result.cost,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat', message: error.message },
      { status: 500 }
    );
  }
}
