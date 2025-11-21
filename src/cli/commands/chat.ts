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
import { saveConversation, loadRecentContext } from '../../utils/memory.js';
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

    // Load recent context
    const recentContext = loadRecentContext(universePath, 10);
    if (recentContext.length > 0) {
      console.log(chalk.gray(`   Loaded ${recentContext.length} messages from previous conversation`));
    }

    console.log(chalk.gray(`   Commands: /exit, /info, /clear, /save\n`));

    // Initialize Claude client
    const claude = new ClaudeClient(config.model);

    // Chat loop
    const rl = createInterface({ input, output });
    const messages: Message[] = [...recentContext];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const userInput = await rl.question(chalk.green('\nYou: '));

        // Handle commands
        if (userInput.trim() === '/exit') {
          // Save conversation
          if (messages.length > 0) {
            try {
              saveConversation(universePath, messages, totalInputTokens, totalOutputTokens, totalCost);
              console.log(chalk.gray('\n✓ Conversation saved'));
            } catch (error: any) {
              console.log(chalk.yellow(`\n⚠️  Could not save conversation: ${error.message}`));
            }
          }
          console.log(chalk.gray('✓ Conversation ended'));
          console.log(chalk.gray(`  Total tokens: ${totalInputTokens + totalOutputTokens}`));
          console.log(chalk.gray(`  Total cost: ${claude.formatCost(totalCost)}\n`));
          rl.close();
          break;
        }

        if (userInput.trim() === '/save') {
          if (messages.length === 0) {
            console.log(chalk.yellow('\n⚠️  No messages to save\n'));
            continue;
          }
          try {
            saveConversation(universePath, messages, totalInputTokens, totalOutputTokens, totalCost);
            console.log(chalk.green('\n✓ Conversation saved to memory\n'));
          } catch (error: any) {
            console.error(chalk.red(`\n❌ Failed to save: ${error.message}\n`));
          }
          continue;
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

        // Get response from Claude with streaming
        const thinkingSpinner = ora('Thinking...').start();

        try {
          let fullResponse = '';
          let inputTokens = 0;
          let outputTokens = 0;
          let cost = 0;

          // Stream the response
          for await (const chunk of claude.chatStream(systemPrompt, messages)) {
            if (chunk.token) {
              // First token - stop spinner and show universe name
              if (fullResponse === '') {
                thinkingSpinner.stop();
                process.stdout.write(chalk.blue(`\n${config.name}: `));
              }
              // Write token to stdout
              process.stdout.write(chunk.token);
              fullResponse += chunk.token;
            }

            if (chunk.done) {
              inputTokens = chunk.inputTokens || 0;
              outputTokens = chunk.outputTokens || 0;
              cost = chunk.cost || 0;
            }
          }

          // Add assistant message
          messages.push({ role: 'assistant', content: fullResponse });

          // Update stats
          totalInputTokens += inputTokens;
          totalOutputTokens += outputTokens;
          totalCost += cost;

          // Display stats
          console.log(
            chalk.gray(
              `\n\n[Tokens: ${inputTokens + outputTokens} | Total: ${totalInputTokens + totalOutputTokens} | Cost: ${claude.formatCost(cost)} | Total cost: ${claude.formatCost(totalCost)}]`
            )
          );
        } catch (error: any) {
          thinkingSpinner.fail('Error');
          console.error(chalk.red(`❌ ${error.message}\n`));
        }
      } catch (error: any) {
        // Catch any errors in the loop to prevent exit
        console.error(chalk.red(`\n❌ Error: ${error.message}`));
        console.log(chalk.gray('Continuing chat session...\n'));
      }
    }
  } catch (error: any) {
    spinner.fail('Failed to load universe');
    console.error(chalk.red(`❌ ${error.message}\n`));
    process.exit(1);
  }
}
