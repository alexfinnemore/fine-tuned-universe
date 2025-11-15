import { NextResponse } from 'next/server';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const PROJECT_ROOT = join(process.cwd(), '..');

interface UniverseTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  gradient: string[];
}

// Predefined themes based on common aesthetics
const AESTHETIC_THEMES: Record<string, UniverseTheme> = {
  default: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a78bfa',
    background: '#1e1b4b',
    text: '#e9d5ff',
    gradient: ['#0f172a', '#581c87', '#0f172a'],
  },
  kafka: {
    primary: '#6b7280',
    secondary: '#4b5563',
    accent: '#9ca3af',
    background: '#1f2937',
    text: '#d1d5db',
    gradient: ['#111827', '#374151', '#1f2937'],
  },
  mycelial: {
    primary: '#059669',
    secondary: '#047857',
    accent: '#34d399',
    background: '#064e3b',
    text: '#d1fae5',
    gradient: ['#022c22', '#065f46', '#064e3b'],
  },
  quantum: {
    primary: '#3b82f6',
    secondary: '#2563eb',
    accent: '#60a5fa',
    background: '#1e3a8a',
    text: '#dbeafe',
    gradient: ['#1e1b4b', '#1e40af', '#312e81'],
  },
  poetic: {
    primary: '#ec4899',
    secondary: '#db2777',
    accent: '#f472b6',
    background: '#831843',
    text: '#fce7f3',
    gradient: ['#4c0519', '#831843', '#500724'],
  },
  industrial: {
    primary: '#ef4444',
    secondary: '#dc2626',
    accent: '#f87171',
    background: '#7f1d1d',
    text: '#fee2e2',
    gradient: ['#450a0a', '#7f1d1d', '#450a0a'],
  },
  cybernetic: {
    primary: '#06b6d4',
    secondary: '#0891b2',
    accent: '#22d3ee',
    background: '#164e63',
    text: '#cffafe',
    gradient: ['#083344', '#155e75', '#0e7490'],
  },
};

function analyzeUniverseAesthetic(
  config: any,
  corpusFiles: string[]
): string {
  const text = `${config.name} ${config.personality} ${config.tone} ${corpusFiles.join(' ')}`.toLowerCase();

  // Check for keyword matches
  if (text.includes('mycelium') || text.includes('fungal') || text.includes('spore')) {
    return 'mycelial';
  }
  if (text.includes('quantum') || text.includes('encryption') || text.includes('cryptograph')) {
    return 'quantum';
  }
  if (text.includes('kafka') || text.includes('prague') || text.includes('labyrinth')) {
    return 'kafka';
  }
  if (text.includes('poetic') || text.includes('philosopher') || text.includes('luminous')) {
    return 'poetic';
  }
  if (text.includes('industrial') || text.includes('noise') || text.includes('spk')) {
    return 'industrial';
  }
  if (text.includes('cybernetic') || text.includes('architect') || text.includes('dvа')) {
    return 'cybernetic';
  }

  return 'default';
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Locate universe
    const templatePath = join(PROJECT_ROOT, 'templates', id);
    const userPath = join(PROJECT_ROOT, 'universes', id);

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

    // Load config
    const configPath = join(universePath, 'config.yml');
    if (!existsSync(configPath)) {
      return NextResponse.json(
        { error: 'Universe configuration not found' },
        { status: 404 }
      );
    }

    const config: any = yaml.load(readFileSync(configPath, 'utf-8'));

    // Load corpus file names
    const corpusDir = join(universePath, 'corpus');
    const corpusFiles: string[] = [];
    if (existsSync(corpusDir)) {
      corpusFiles.push(
        ...readdirSync(corpusDir)
          .filter(f => f.endsWith('.md'))
          .map(f => f.replace('.md', ''))
      );
    }

    // Analyze aesthetic
    const aesthetic = analyzeUniverseAesthetic(config, corpusFiles);
    const theme = AESTHETIC_THEMES[aesthetic] || AESTHETIC_THEMES.default;

    return NextResponse.json({
      aesthetic,
      theme,
      config: {
        name: config.name,
        personality: config.personality,
        tone: config.tone,
      },
    });
  } catch (error: any) {
    console.error('Error generating theme:', error);
    return NextResponse.json(
      { error: 'Failed to generate theme', message: error.message },
      { status: 500 }
    );
  }
}
