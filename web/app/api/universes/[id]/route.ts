import { NextResponse } from 'next/server';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const PROJECT_ROOT = process.cwd();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try template first, then user universe
    const templatePath = join(PROJECT_ROOT, 'templates', id);
    const userPath = join(PROJECT_ROOT, 'universes', id);

    let universePath: string;
    let type: 'template' | 'user';

    if (existsSync(userPath)) {
      universePath = userPath;
      type = 'user';
    } else if (existsSync(templatePath)) {
      universePath = templatePath;
      type = 'template';
    } else {
      return NextResponse.json(
        { error: 'Universe not found' },
        { status: 404 }
      );
    }

    // Load config
    const configPath = join(universePath, 'config.yml');
    if (!existsSync(configPath)) {
      return NextResponse.json(
        { error: 'Universe configuration not found' },
        { status: 404 }
      );
    }

    const config: any = yaml.load(readFileSync(configPath, 'utf-8'));

    // Load corpus files
    const corpusDir = join(universePath, 'corpus');
    const corpusFiles: Array<{ name: string; tokens: number }> = [];

    if (existsSync(corpusDir)) {
      const files = readdirSync(corpusDir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const content = readFileSync(join(corpusDir, file), 'utf-8');
        const tokens = Math.ceil(content.length / 4); // Rough estimate
        corpusFiles.push({ name: file, tokens });
      }
    }

    // Check for last chat
    let lastChat: string | undefined;
    const memoryDir = join(universePath, 'memory');
    if (existsSync(memoryDir)) {
      const memoryFiles = readdirSync(memoryDir)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse();
      if (memoryFiles.length > 0) {
        const lastFile = memoryFiles[0];
        const content = readFileSync(join(memoryDir, lastFile), 'utf-8');
        const memory = JSON.parse(content);
        lastChat = memory.timestamp;
      }
    }

    const response = {
      id,
      name: config.name || id,
      personality: config.personality || '',
      model: config.model || 'claude-sonnet-4',
      tone: config.tone || 'conversational',
      creativity: config.creativity || 'medium',
      rules: config.rules || [],
      vocabulary: config.vocabulary || [],
      forbidden_words: config.forbidden_words || [],
      corpusCount: corpusFiles.length,
      corpusFiles,
      type,
      lastChat,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching universe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch universe', message: error.message },
      { status: 500 }
    );
  }
}
