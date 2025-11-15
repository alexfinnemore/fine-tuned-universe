import { NextResponse } from 'next/server';
import { readdirSync, existsSync, statSync, readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const PROJECT_ROOT = join(process.cwd(), '..');

interface UniverseInfo {
  id: string;
  name: string;
  personality: string;
  corpusCount: number;
  model: string;
  type: 'template' | 'user';
  lastChat?: string;
  creativity: string;
}

export async function GET() {
  try {
    const universes: UniverseInfo[] = [];

    // Load templates
    const templatesDir = join(PROJECT_ROOT, 'templates');
    if (existsSync(templatesDir)) {
      const templates = readdirSync(templatesDir).filter(f => {
        const path = join(templatesDir, f);
        return statSync(path).isDirectory();
      });

      for (const template of templates) {
        try {
          const configPath = join(templatesDir, template, 'config.yml');
          if (existsSync(configPath)) {
            const config: any = yaml.load(readFileSync(configPath, 'utf-8'));
            const corpusDir = join(templatesDir, template, 'corpus');
            const corpusCount = existsSync(corpusDir)
              ? readdirSync(corpusDir).filter(f => f.endsWith('.md')).length
              : 0;

            universes.push({
              id: template,
              name: config.name || template,
              personality: config.personality || '',
              corpusCount,
              model: config.model || 'claude-sonnet-4',
              type: 'template',
              creativity: config.creativity || 'medium',
            });
          }
        } catch (error) {
          console.error(`Error loading template ${template}:`, error);
        }
      }
    }

    // Load user universes
    const universesDir = join(PROJECT_ROOT, 'universes');
    if (existsSync(universesDir)) {
      const userUniverses = readdirSync(universesDir).filter(f => {
        const path = join(universesDir, f);
        return statSync(path).isDirectory();
      });

      for (const universe of userUniverses) {
        try {
          const configPath = join(universesDir, universe, 'config.yml');
          if (existsSync(configPath)) {
            const config: any = yaml.load(readFileSync(configPath, 'utf-8'));
            const corpusDir = join(universesDir, universe, 'corpus');
            const corpusCount = existsSync(corpusDir)
              ? readdirSync(corpusDir).filter(f => f.endsWith('.md')).length
              : 0;

            // Check for last chat
            const memoryDir = join(universesDir, universe, 'memory');
            let lastChat: string | undefined;
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

            universes.push({
              id: universe,
              name: config.name || universe,
              personality: config.personality || '',
              corpusCount,
              model: config.model || 'claude-sonnet-4',
              type: 'user',
              lastChat,
              creativity: config.creativity || 'medium',
            });
          }
        } catch (error) {
          console.error(`Error loading universe ${universe}:`, error);
        }
      }
    }

    return NextResponse.json({ universes });
  } catch (error: any) {
    console.error('Error fetching universes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch universes', message: error.message },
      { status: 500 }
    );
  }
}
