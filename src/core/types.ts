/**
 * Core type definitions for Fine-Tuned Universe
 */

export interface UniverseConfig {
  name: string;
  personality: string;
  model: string;
  rules: string[];
  tone: string;
  vocabulary?: string[];
  forbidden_words?: string[];
  creativity: 'low' | 'medium' | 'high' | 'very-high';
  collaboration_enabled?: boolean;
  output_length?: 'short' | 'medium' | 'long';
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConversationMemory {
  messages: Message[];
  tokenCount: number;
  cost: number;
}

export interface CorpusFile {
  path: string;
  content: string;
  tokens: number;
}

export interface Universe {
  name: string;
  path: string;
  config: UniverseConfig;
  corpus: CorpusFile[];
  systemPrompt: string;
}
