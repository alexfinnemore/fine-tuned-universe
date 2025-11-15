import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { CorpusFile } from '../core/types.js';

/**
 * Load all corpus files from a universe's corpus directory
 */
export function loadCorpus(universePath: string): CorpusFile[] {
  const corpusPath = join(universePath, 'corpus');

  if (!existsSync(corpusPath)) {
    return [];
  }

  const files = readdirSync(corpusPath).filter(f => f.endsWith('.md'));
  const corpus: CorpusFile[] = [];

  for (const file of files) {
    const filePath = join(corpusPath, file);
    const content = readFileSync(filePath, 'utf-8');

    corpus.push({
      path: file,
      content,
      tokens: estimateTokens(content),
    });
  }

  return corpus;
}

/**
 * Get a summary of the corpus for system prompt
 */
export function getCorpusSummary(corpus: CorpusFile[]): string {
  if (corpus.length === 0) {
    return 'No corpus files loaded.';
  }

  const summary = corpus.map(f => `- ${f.path.replace('.md', '')}`).join('\n');
  return `${corpus.length} knowledge files:\n${summary}`;
}

/**
 * Get full corpus content concatenated
 */
export function getCorpusContent(corpus: CorpusFile[]): string {
  return corpus.map(f => `## ${f.path}\n\n${f.content}`).join('\n\n---\n\n');
}

/**
 * Rough token estimation (1 token ≈ 4 characters)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
