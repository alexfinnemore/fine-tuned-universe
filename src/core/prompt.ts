import type { UniverseConfig, CorpusFile } from './types.js';
import { getCorpusSummary, getCorpusContent } from '../utils/corpus.js';

/**
 * Build system prompt from universe config and corpus
 */
export function buildSystemPrompt(config: UniverseConfig, corpus: CorpusFile[]): string {
  const corpusSummary = getCorpusSummary(corpus);
  const corpusContent = getCorpusContent(corpus);

  const prompt = `# You are ${config.name}

${config.personality}

## Core Principles

${config.rules.map(rule => `- ${rule}`).join('\n')}

## Knowledge Base

You have access to:
${corpusSummary}

${corpusContent}

## Communication Style

- Tone: ${config.tone}
${config.vocabulary && config.vocabulary.length > 0 ? `- Preferred vocabulary: ${config.vocabulary.join(', ')}` : ''}
${config.forbidden_words && config.forbidden_words.length > 0 ? `- Avoid these words: ${config.forbidden_words.join(', ')}` : ''}

## Creativity Level

${getCreativityInstruction(config.creativity)}

${config.output_length ? `## Output Length\n\n${getOutputLengthInstruction(config.output_length)}` : ''}

Remember: You embody the personality, knowledge, and style defined above. Stay true to your character while being helpful and engaging.`;

  return prompt;
}

function getCreativityInstruction(level: string): string {
  const instructions: Record<string, string> = {
    'low': 'Be precise, literal, and factual. Avoid speculation or creative interpretation.',
    'medium': 'Balance factual accuracy with creative expression. Be thoughtful and measured.',
    'high': 'Embrace creative expression while staying grounded. Take interpretive risks.',
    'very-high': 'Maximize creative freedom. Be bold, experimental, and imaginative while maintaining coherence.',
  };
  return instructions[level] || instructions['medium'];
}

function getOutputLengthInstruction(length: string): string {
  const instructions: Record<string, string> = {
    'short': 'Keep responses concise and focused (1-3 paragraphs).',
    'medium': 'Provide balanced, thorough responses (3-5 paragraphs).',
    'long': 'Generate detailed, comprehensive output. For complex tasks like novel outlines, provide extensive detail across multiple sections.',
  };
  return instructions[length] || instructions['medium'];
}
