import yaml from 'js-yaml';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { UniverseConfig } from '../core/types.js';

export function loadUniverseConfig(universePath: string): UniverseConfig {
  const configPath = join(universePath, 'config.yml');

  if (!existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  const configFile = readFileSync(configPath, 'utf-8');
  const config = yaml.load(configFile) as UniverseConfig;

  // Validate required fields
  if (!config.name) throw new Error('Config missing required field: name');
  if (!config.personality) throw new Error('Config missing required field: personality');
  if (!config.model) config.model = 'claude-sonnet-4'; // Default model
  if (!config.rules) config.rules = [];
  if (!config.tone) config.tone = 'conversational';
  if (!config.creativity) config.creativity = 'medium';

  return config;
}
