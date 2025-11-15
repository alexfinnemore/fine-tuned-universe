import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import type { Message, ConversationMemory } from '../core/types.js';

/**
 * Save conversation to memory directory
 */
export function saveConversation(
  universePath: string,
  messages: Message[],
  totalInputTokens: number,
  totalOutputTokens: number,
  totalCost: number
): void {
  const memoryDir = join(universePath, 'memory');

  // Ensure memory directory exists
  if (!existsSync(memoryDir)) {
    mkdirSync(memoryDir, { recursive: true });
  }

  // Create filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `conversation-${timestamp}.json`;
  const filepath = join(memoryDir, filename);

  const memory: ConversationMemory & { timestamp: string; messageCount: number } = {
    messages,
    tokenCount: totalInputTokens + totalOutputTokens,
    cost: totalCost,
    timestamp: new Date().toISOString(),
    messageCount: messages.length,
  };

  writeFileSync(filepath, JSON.stringify(memory, null, 2));
}

/**
 * Load the most recent conversation from memory
 */
export function loadRecentConversation(universePath: string): ConversationMemory | null {
  const memoryDir = join(universePath, 'memory');

  if (!existsSync(memoryDir)) {
    return null;
  }

  const files = readdirSync(memoryDir)
    .filter(f => f.startsWith('conversation-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    return null;
  }

  const latestFile = join(memoryDir, files[0]);
  const content = readFileSync(latestFile, 'utf-8');
  return JSON.parse(content) as ConversationMemory;
}

/**
 * Get summary of recent conversations for context
 */
export function getConversationSummary(universePath: string, limit: number = 5): string {
  const memoryDir = join(universePath, 'memory');

  if (!existsSync(memoryDir)) {
    return 'No previous conversations.';
  }

  const files = readdirSync(memoryDir)
    .filter(f => f.startsWith('conversation-') && f.endsWith('.json'))
    .sort()
    .reverse()
    .slice(0, limit);

  if (files.length === 0) {
    return 'No previous conversations.';
  }

  const summaries: string[] = [];

  for (const file of files) {
    try {
      const filepath = join(memoryDir, file);
      const content = readFileSync(filepath, 'utf-8');
      const memory = JSON.parse(content) as any;

      const date = new Date(memory.timestamp).toLocaleString();
      const msgCount = memory.messageCount || memory.messages.length;

      summaries.push(`- ${date}: ${msgCount} messages, ${memory.tokenCount} tokens`);
    } catch (error) {
      // Skip invalid files
    }
  }

  return summaries.length > 0
    ? `Recent conversations:\n${summaries.join('\n')}`
    : 'No previous conversations.';
}

/**
 * Load context from recent conversations (last N messages)
 */
export function loadRecentContext(
  universePath: string,
  maxMessages: number = 10
): Message[] {
  const recent = loadRecentConversation(universePath);

  if (!recent || !recent.messages || recent.messages.length === 0) {
    return [];
  }

  // Return last N messages
  return recent.messages.slice(-maxMessages);
}
