import chalk from 'chalk';
import { readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { loadUniverseConfig } from '../../utils/config.js';
import { loadCorpus } from '../../utils/corpus.js';

export async function listUniverses() {
  console.log(chalk.cyan('\n📚 Your Universes:\n'));

  const templatesDir = join(process.cwd(), 'templates');
  const universesDir = join(process.cwd(), 'universes');

  let found = 0;

  // List template universes
  if (existsSync(templatesDir)) {
    const templates = readdirSync(templatesDir).filter(f => {
      const path = join(templatesDir, f);
      return statSync(path).isDirectory();
    });

    if (templates.length > 0) {
      console.log(chalk.gray('Templates:'));
      for (const template of templates) {
        try {
          const path = join(templatesDir, template);
          const config = loadUniverseConfig(path);
          const corpus = loadCorpus(path);

          console.log(chalk.blue(`  🌌 ${template}`) + chalk.gray(` (${config.personality.slice(0, 60)}...)`));
          console.log(chalk.gray(`     Corpus: ${corpus.length} files | Model: ${config.model}`));
          found++;
        } catch (error) {
          console.log(chalk.yellow(`  ⚠️  ${template}`) + chalk.gray(' (invalid config)'));
        }
      }
      console.log();
    }
  }

  // List user universes
  if (existsSync(universesDir)) {
    const universes = readdirSync(universesDir).filter(f => {
      const path = join(universesDir, f);
      return statSync(path).isDirectory();
    });

    if (universes.length > 0) {
      console.log(chalk.gray('Your Universes:'));
      for (const universe of universes) {
        try {
          const path = join(universesDir, universe);
          const config = loadUniverseConfig(path);
          const corpus = loadCorpus(path);

          // Check memory directory for last chat
          const memoryDir = join(path, 'memory');
          let lastChat = 'Never';
          if (existsSync(memoryDir)) {
            const memoryFiles = readdirSync(memoryDir)
              .filter(f => f.endsWith('.json'))
              .sort()
              .reverse();
            if (memoryFiles.length > 0) {
              const lastFile = memoryFiles[0];
              const date = lastFile.replace('.json', '');
              lastChat = date;
            }
          }

          console.log(chalk.green(`  🌟 ${universe}`) + chalk.gray(` (${config.personality.slice(0, 60)}...)`));
          console.log(chalk.gray(`     Corpus: ${corpus.length} files | Last chat: ${lastChat}`));
          found++;
        } catch (error) {
          console.log(chalk.yellow(`  ⚠️  ${universe}`) + chalk.gray(' (invalid config)'));
        }
      }
      console.log();
    }
  }

  if (found === 0) {
    console.log(chalk.gray('No universes found.'));
    console.log(chalk.gray('\nCreate your first universe:'));
    console.log(chalk.cyan('  npm run create-universe my-universe\n'));
  } else {
    console.log(chalk.gray(`Total: ${found} universe${found === 1 ? '' : 's'}\n`));
  }
}
