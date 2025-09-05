#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import { glob } from 'glob';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';

async function loadExampleMetadata(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Extract description from the comment block at the top
    const commentMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n\s*\*\s*(.*?)\s*\n\s*\*\//s);
    
    if (commentMatch) {
      const title = commentMatch[1];
      const description = commentMatch[2].replace(/\s*\*\s*/g, ' ').trim();
      return { title, description };
    }
    
    // Fallback: use filename
    const fileName = path.basename(filePath, '.ts');
    return { 
      title: fileName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      description: `Run the ${fileName} example`
    };
  } catch (error) {
    const fileName = path.basename(filePath, '.ts');
    return { 
      title: fileName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      description: `Run the ${fileName} example`
    };
  }
}

async function discoverExamples() {
  // Find all .ts files in subdirectories
  const exampleFiles = await glob('*/*.ts', { cwd: process.cwd() });
  
  const examples = {};
  
  for (const filePath of exampleFiles) {
    const [category, fileName] = filePath.split('/');
    const metadata = await loadExampleMetadata(filePath);
    
    // Create category if it doesn't exist
    if (!examples[category]) {
      examples[category] = {
        name: category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        items: []
      };
    }
    
    examples[category].items.push({
      name: metadata.title,
      description: metadata.description,
      file: filePath,
      script: `tsx ${filePath}`
    });
  }
  
  return examples;
}

function displayHeader() {
  console.clear();
  console.log(chalk.cyan.bold('🚀 WordPress Playground Step Library'));
  console.log(chalk.gray('───────────────────────────────────────────────'));
  console.log(chalk.yellow('Interactive Example Chooser'));
  console.log('');
}

async function createMenu(examples) {
  const choices = [];
  
  Object.entries(examples).forEach(([categoryKey, category]) => {
    // Add category header
    choices.push(new inquirer.Separator(chalk.blue.bold(`📁 ${category.name}`)));
    
    // Add category items
    category.items.forEach(item => {
      choices.push({
        name: `${chalk.green('▶')} ${item.name}${chalk.gray(' - ' + item.description)}`,
        value: item,
        short: item.name
      });
    });
    
    choices.push(new inquirer.Separator()); // Empty line between categories
  });
  
  // Add quit option
  choices.push(new inquirer.Separator());
  choices.push({
    name: chalk.red('❌ Quit'),
    value: 'quit',
    short: 'Quit'
  });
  
  return choices;
}

function runExample(example) {
  return new Promise((resolve) => {
    console.clear();
    console.log(chalk.cyan.bold(`🏃 Running: ${example.name}`));
    console.log(chalk.gray(`📝 ${example.description}`));
    console.log(chalk.gray(`🔧 Command: ${example.script}`));
    console.log('');
    console.log(chalk.yellow('─'.repeat(60)));
    console.log('');
    
    const [command, ...args] = example.script.split(' ');
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      console.log('');
      console.log(chalk.yellow('─'.repeat(60)));
      if (code === 0) {
        console.log(chalk.green(`✅ Example completed successfully`));
      } else {
        console.log(chalk.red(`❌ Example finished with code ${code}`));
      }
      console.log('');
      console.log(chalk.gray('Press any key to return to menu...'));
      
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.once('data', () => {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve();
      });
    });
    
    child.on('error', (error) => {
      console.log('');
      console.log(chalk.red(`❌ Error running example: ${error.message}`));
      setTimeout(resolve, 2000);
    });
  });
}

async function main() {
  try {
    displayHeader();
    console.log(chalk.gray('🔍 Discovering examples...'));
    
    const examples = await discoverExamples();
    const exampleCount = Object.values(examples).reduce((sum, cat) => sum + cat.items.length, 0);
    
    if (exampleCount === 0) {
      console.log(chalk.red('❌ No examples found in subdirectories'));
      process.exit(1);
    }
    
    while (true) {
      displayHeader();
      console.log(chalk.gray(`Found ${exampleCount} examples in ${Object.keys(examples).length} categories`));
      console.log('');
      
      const choices = await createMenu(examples);
      
      const { selectedExample } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedExample',
          message: 'Choose an example to run:',
          choices,
          pageSize: process.stdout.rows - 10 // Leave some space for header and prompt
        }
      ]);
      
      if (selectedExample === 'quit') {
        console.log(chalk.green('👋 Goodbye!'));
        process.exit(0);
      }
      
      await runExample(selectedExample);
    }
    
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log(chalk.green('\n👋 Goodbye!'));
      process.exit(0);
    }
    console.error(chalk.red('❌ Error:'), error.message);
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(chalk.green('\n\n👋 Goodbye!'));
  process.exit(0);
});

main();