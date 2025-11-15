import chalk from 'chalk';
import { existsSync, statSync, readdirSync } from 'fs';
import { join } from 'path';
import { loadUniverseConfig } from '../../utils/config.js';
import { loadCorpus } from '../../utils/corpus.js';

export async function showUniverseInfo(universeName: string) {
  // Locate universe
  const templatePath = join(process.cwd(), 'templates', universeName);
  const userUniversePath = join(process.cwd(), 'universes', universeName);

  let universePath: string;
  let isTemplate = false;

  if (existsSync(userUniversePath)) {
    universePath = userUniversePath;
  } else if (existsSync(templatePath)) {
    universePath = templatePath;
    isTemplate = true;
  } else {
    console.error(chalk.red(`\n❌ Universe not found: ${universeName}\n`));
    process.exit(1);
  }

  try {
    const config = loadUniverseConfig(universePath);
    const corpus = loadCorpus(universePath);

    // Calculate stats
    const totalTokens = corpus.reduce((sum, f) => sum + f.tokens, 0);
    const createdDate = statSync(universePath).birthtime.toLocaleDateString();

    console.log(chalk.cyan(`\n🌌 ${config.name}`));
    console.log(chalk.gray('─'.repeat(50)));

    console.log(chalk.white('\nPersonality:'));
    console.log(chalk.gray(`  ${config.personality}`));

    console.log(chalk.white('\nConfiguration:'));
    console.log(chalk.gray(`  Model: ${config.model}`));
    console.log(chalk.gray(`  Tone: ${config.tone}`));
    console.log(chalk.gray(`  Creativity: ${config.creativity}`));
    console.log(chalk.gray(`  Output length: ${config.output_length || 'medium'}`));
    console.log(chalk.gray(`  Collaboration: ${config.collaboration_enabled ? 'enabled' : 'disabled'}`));

    if (config.rules && config.rules.length > 0) {
      console.log(chalk.white('\nCore Rules:'));
      config.rules.forEach(rule => {
        console.log(chalk.gray(`  - ${rule}`));
      });
    }

    if (config.vocabulary && config.vocabulary.length > 0) {
      console.log(chalk.white('\nPreferred Vocabulary:'));
      console.log(chalk.gray(`  ${config.vocabulary.join(', ')}`));
    }

    if (config.forbidden_words && config.forbidden_words.length > 0) {
      console.log(chalk.white('\nForbidden Words:'));
      console.log(chalk.gray(`  ${config.forbidden_words.join(', ')}`));
    }

    console.log(chalk.white('\nCorpus:'));
    if (corpus.length > 0) {
      corpus.forEach(file => {
        console.log(chalk.gray(`  - ${file.path} (${file.tokens.toLocaleString()} tokens)`));
      });
      console.log(chalk.gray(`  Total: ${corpus.length} files, ${totalTokens.toLocaleString()} tokens`));
    } else {
      console.log(chalk.gray(`  No corpus files yet`));
    }

    // Memory stats
    const memoryDir = join(universePath, 'memory');
    if (existsSync(memoryDir)) {
      const memoryFiles = readdirSync(memoryDir).filter(f => f.endsWith('.json'));
      if (memoryFiles.length > 0) {
        console.log(chalk.white('\nMemory:'));
        console.log(chalk.gray(`  ${memoryFiles.length} conversation${memoryFiles.length === 1 ? '' : 's'}`));

        const sortedFiles = memoryFiles.sort().reverse();
        if (sortedFiles.length > 0) {
          const lastChat = sortedFiles[0].replace('.json', '');
          console.log(chalk.gray(`  Last chat: ${lastChat}`));
        }
      }
    }

    console.log(chalk.white('\nMetadata:'));
    console.log(chalk.gray(`  Type: ${isTemplate ? 'Template' : 'User universe'}`));
    console.log(chalk.gray(`  Created: ${createdDate}`));
    console.log(chalk.gray(`  Location: ${universePath}`));

    console.log(chalk.white('\nUsage:'));
    console.log(chalk.cyan(`  npm run chat ${universeName}`));
    console.log(chalk.gray(`  npm run generate ${universeName} --prompt "Your prompt"\n`));

  } catch (error: any) {
    console.error(chalk.red(`\n❌ Error loading universe: ${error.message}\n`));
    process.exit(1);
  }
}
