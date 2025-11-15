import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import chalk from 'chalk';
import ora from 'ora';
import { join } from 'path';
import { existsSync } from 'fs';
import { loadUniverseConfig } from '../../utils/config.js';
import { loadCorpus } from '../../utils/corpus.js';
import { buildSystemPrompt } from '../../core/prompt.js';
import { ClaudeClient } from '../../core/claude.js';
import type { Message } from '../../core/types.js';

export async function chat(universeName: string) {
  // Locate universe (check both templates and universes directories)
  const templatePath = join(process.cwd(), 'templates', universeName);
  const userUniversePath = join(process.cwd(), 'universes', universeName);

  let universePath: string;

  if (existsSync(userUniversePath)) {
    universePath = userUniversePath;
  } else if (existsSync(templatePath)) {
    universePath = templatePath;
  } else {
    console.error(chalk.red(`❌ Universe not found: ${universeName}`));
    console.error(chalk.gray(`   Looked in:`));
    console.error(chalk.gray(`   - ${userUniversePath}`));
    console.error(chalk.gray(`   - ${templatePath}\n`));
    process.exit(1);
  }

  // Load universe
  const spinner = ora('Loading universe...').start();

  try {
    const config = loadUniverseConfig(universePath);
    const corpus = loadCorpus(universePath);
    const systemPrompt = buildSystemPrompt(config, corpus);

    spinner.succeed(`Loaded ${chalk.cyan(config.name)}`);

    console.log(chalk.gray(`   Corpus: ${corpus.length} files`));
    console.log(chalk.gray(`   Model: ${config.model}`));
    console.log(chalk.gray(`   Type '/exit' to quit, '/info' for details\n`));

    // Initialize Claude client
    const claude = new ClaudeClient(config.model);

    // Chat loop
    const rl = createInterface({ input, output });
    const messages: Message[] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const userInput = await rl.question(chalk.green('You: '));

      // Handle commands
      if (userInput.trim() === '/exit') {
        console.log(chalk.gray('\n✓ Conversation ended'));
        console.log(chalk.gray(`  Total tokens: ${totalInputTokens + totalOutputTokens}`));
        console.log(chalk.gray(`  Total cost: ${claude.formatCost(totalCost)}\n`));
        rl.close();
        break;
      }

      if (userInput.trim() === '/info') {
        console.log(chalk.cyan(`\n🌌 ${config.name}`));
        console.log(chalk.gray(`   Personality: ${config.personality}`));
        console.log(chalk.gray(`   Corpus: ${corpus.length} files`));
        console.log(chalk.gray(`   Messages: ${messages.length / 2}`));
        console.log(chalk.gray(`   Tokens: ${totalInputTokens + totalOutputTokens}`));
        console.log(chalk.gray(`   Cost: ${claude.formatCost(totalCost)}\n`));
        continue;
      }

      if (userInput.trim() === '/clear') {
        messages.length = 0;
        totalInputTokens = 0;
        totalOutputTokens = 0;
        totalCost = 0;
        console.log(chalk.gray('✓ Conversation cleared\n'));
        continue;
      }

      if (!userInput.trim()) {
        continue;
      }

      // Add user message
      messages.push({ role: 'user', content: userInput });

      // Get response from Claude
      const thinkingSpinner = ora('Thinking...').start();

      try {
        const result = await claude.chat(systemPrompt, messages);

        thinkingSpinner.stop();

        // Add assistant message
        messages.push({ role: 'assistant', content: result.response });

        // Update stats
        totalInputTokens += result.inputTokens;
        totalOutputTokens += result.outputTokens;
        totalCost += result.cost;

        // Display response
        console.log(chalk.blue(`\n${config.name}: `) + result.response);
        console.log(
          chalk.gray(
            `\n[Tokens: ${result.inputTokens + result.outputTokens} | Total: ${totalInputTokens + totalOutputTokens} | Cost: ${claude.formatCost(result.cost)} | Total cost: ${claude.formatCost(totalCost)}]\n`
          )
        );
      } catch (error: any) {
        thinkingSpinner.fail('Error');
        console.error(chalk.red(`❌ ${error.message}\n`));
      }
    }
  } catch (error: any) {
    spinner.fail('Failed to load universe');
    console.error(chalk.red(`❌ ${error.message}\n`));
    process.exit(1);
  }
}
