#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load environment variables
dotenv.config();

// Get package.json for version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('ftu')
  .description('Fine-Tuned Universe - Create personalized AI companions')
  .version(packageJson.version);

// Chat command
program
  .command('chat')
  .description('Chat with a universe')
  .argument('[universe-name]', 'Name of the universe to chat with', 'universe-k')
  .action(async (universeName: string) => {
    console.log(chalk.blue(`\n🌌 Starting chat with ${universeName}...\n`));

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error(chalk.red('❌ Error: ANTHROPIC_API_KEY not found'));
      console.error(chalk.yellow('\n💡 Create a .env file with your API key:'));
      console.error(chalk.gray('   ANTHROPIC_API_KEY=sk-ant-your-key-here\n'));
      console.error(chalk.gray('   Get your API key at: https://console.anthropic.com/settings/keys\n'));
      process.exit(1);
    }

    // Dynamic import to avoid loading chat module if API key is missing
    const { chat } = await import('./commands/chat.js');
    await chat(universeName);
  });

// Create universe command
program
  .command('create-universe')
  .description('Create a new universe')
  .argument('<name>', 'Name of the universe')
  .option('-t, --template <template>', 'Template to use (coming soon)', 'blank')
  .action(async (name: string, options: { template: string }) => {
    const { createUniverse } = await import('./commands/create-universe.js');
    await createUniverse(name, { template: options.template });
  });

// List universes command
program
  .command('list')
  .description('List all universes')
  .action(async () => {
    const { listUniverses } = await import('./commands/list.js');
    await listUniverses();
  });

// Info command
program
  .command('info')
  .description('Show universe information')
  .argument('<universe-name>', 'Name of the universe')
  .action(async (name: string) => {
    const { showUniverseInfo } = await import('./commands/info.js');
    await showUniverseInfo(name);
  });

// Generate command (placeholder)
program
  .command('generate')
  .description('Generate an artifact')
  .argument('<universe-name>', 'Name of the universe')
  .option('-p, --prompt <prompt>', 'Generation prompt')
  .option('-o, --output <file>', 'Output file path')
  .action((name: string, _options: { prompt?: string; output?: string }) => {
    console.log(chalk.yellow('\n🚧 Coming soon: Artifact generation'));
    console.log(chalk.gray(`   Universe: ${name}\n`));
  });

program.parse();
