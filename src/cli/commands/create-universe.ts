import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import chalk from 'chalk';
import ora from 'ora';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import type { UniverseConfig } from '../../core/types.js';

interface CreateUniverseOptions {
  template?: string;
  interactive?: boolean;
}

export async function createUniverse(name: string, _options: CreateUniverseOptions = {}) {
  console.log(chalk.cyan('\n🌌 Creating Universe: ') + chalk.bold(name) + '\n');

  // Validate name
  if (!name || name.trim().length === 0) {
    console.error(chalk.red('❌ Universe name cannot be empty\n'));
    process.exit(1);
  }

  // Sanitize name for directory
  const dirName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const universePath = join(process.cwd(), 'universes', dirName);

  // Check if universe already exists
  if (existsSync(universePath)) {
    console.error(chalk.red(`❌ Universe already exists: ${dirName}\n`));
    process.exit(1);
  }

  const rl = createInterface({ input, output });

  try {
    // Interactive prompts
    console.log(chalk.gray('Answer a few questions to configure your universe:\n'));

    const displayName = await rl.question(
      chalk.blue('Display name: ') + chalk.gray(`(${name}) `)
    );

    const personality = await rl.question(
      chalk.blue('Personality (one sentence): ')
    );

    if (!personality || personality.trim().length === 0) {
      console.error(chalk.red('\n❌ Personality is required\n'));
      rl.close();
      process.exit(1);
    }

    const tone = await rl.question(
      chalk.blue('Tone (comma-separated): ') + chalk.gray('(e.g., poetic, technical, warm) ')
    );

    const rulesInput = await rl.question(
      chalk.blue('Core rules (comma-separated): ') + chalk.gray('(e.g., Be concise, Use metaphors) ')
    );

    const creativityInput = await rl.question(
      chalk.blue('Creativity level: ') + chalk.gray('(low/medium/high/very-high) [medium] ')
    );

    const outputLengthInput = await rl.question(
      chalk.blue('Output length: ') + chalk.gray('(short/medium/long) [medium] ')
    );

    rl.close();

    // Build config
    const rules = rulesInput
      ? rulesInput.split(',').map(r => r.trim()).filter(r => r.length > 0)
      : [];

    const creativity = ['low', 'medium', 'high', 'very-high'].includes(creativityInput.trim())
      ? (creativityInput.trim() as 'low' | 'medium' | 'high' | 'very-high')
      : 'medium';

    const outputLength = ['short', 'medium', 'long'].includes(outputLengthInput.trim())
      ? (outputLengthInput.trim() as 'short' | 'medium' | 'long')
      : 'medium';

    const config: UniverseConfig = {
      name: displayName || name,
      personality: personality.trim(),
      model: 'claude-sonnet-4-20250514',
      rules,
      tone: tone || 'conversational',
      creativity,
      output_length: outputLength,
      collaboration_enabled: true,
    };

    // Create directory structure
    const spinner = ora('Creating universe structure...').start();

    mkdirSync(universePath, { recursive: true });
    mkdirSync(join(universePath, 'corpus'), { recursive: true });
    mkdirSync(join(universePath, 'memory'), { recursive: true });
    mkdirSync(join(universePath, 'artifacts'), { recursive: true });

    // Write config
    const configYaml = yaml.dump(config, {
      indent: 2,
      lineWidth: 80,
      noRefs: true,
    });
    writeFileSync(join(universePath, 'config.yml'), configYaml);

    // Create starter corpus file
    const starterCorpus = `# ${config.name} Knowledge Base

This is the knowledge base for ${config.name}.

Add your own knowledge, examples, and context here as markdown files.

## Example Content

You can organize your corpus files by topic:

- \`philosophy.md\` - Core beliefs and principles
- \`style.md\` - Writing style examples
- \`knowledge.md\` - Domain-specific knowledge
- \`examples.md\` - Example conversations or outputs

Each file will be loaded and made available to the universe during conversations.
`;

    writeFileSync(join(universePath, 'corpus', 'starter.md'), starterCorpus);

    // Create README
    const readmeContent = `# ${config.name}

${config.personality}

## Configuration

- **Tone**: ${config.tone}
- **Creativity**: ${config.creativity}
- **Output Length**: ${config.output_length}

## Core Rules

${rules.length > 0 ? rules.map(r => `- ${r}`).join('\n') : '_No specific rules defined_'}

## Corpus

Add your knowledge files to the \`corpus/\` directory as markdown files.

## Usage

\`\`\`bash
# Chat with this universe
npm run chat ${dirName}

# Generate an artifact
npm run generate ${dirName} --prompt "Your prompt here"
\`\`\`

## Customization

Edit \`config.yml\` to adjust:
- Personality description
- Rules and guidelines
- Tone and style
- Creativity level
- Vocabulary preferences

Add markdown files to \`corpus/\` to expand knowledge base.
`;

    writeFileSync(join(universePath, 'README.md'), readmeContent);

    spinner.succeed(chalk.green('Universe created successfully!'));

    // Success message with next steps
    console.log(chalk.cyan(`\n✨ ${config.name} is ready!\n`));
    console.log(chalk.gray('📁 Location: ') + chalk.white(universePath));
    console.log(chalk.gray('📝 Config: ') + chalk.white(join(universePath, 'config.yml')));
    console.log(chalk.gray('📚 Corpus: ') + chalk.white(join(universePath, 'corpus')));

    console.log(chalk.cyan('\n📋 Next steps:\n'));
    console.log(chalk.white('  1. ') + chalk.gray('Add knowledge files to: ') + chalk.white(`${dirName}/corpus/`));
    console.log(chalk.white('  2. ') + chalk.gray('Customize config: ') + chalk.white(`${dirName}/config.yml`));
    console.log(chalk.white('  3. ') + chalk.gray('Start chatting: ') + chalk.cyan(`npm run chat ${dirName}\n`));

  } catch (error: any) {
    console.error(chalk.red(`\n❌ Error creating universe: ${error.message}\n`));
    rl.close();
    process.exit(1);
  }
}
