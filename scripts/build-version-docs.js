/* eslint-disable no-console */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Exit immediately if a command exits with a non-zero status
process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

// Check if version name is provided
if (process.argv.length < 3) {
  console.error('Error: No version name provided.');
  console.error('Usage: node build-version-docs.js <version-name>');
  process.exit(1);
}

console.log(process.argv);

const VERSION = process.argv[2];

// Check if version name is "main"
if (VERSION === 'main') {
  console.error('Error: Version name cannot be "main".');
  process.exit(1);
}

const DOCS_DIR = path.join('docs', VERSION);

// Create the directory if it doesn't exist
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// Build Storybook
try {
  execSync(`storybook build -o ${DOCS_DIR}`, { stdio: 'inherit' });
  console.log(`Storybook built successfully in ${DOCS_DIR}`);
} catch (error) {
  console.error('Error building Storybook:', error);
  process.exit(1);
}
