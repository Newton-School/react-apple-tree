/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// Exit immediately if a command exits with a non-zero status
process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

const args = process.argv.slice(2);
const tagName = args[0];
const isPre = args.includes('--pre');
const checkForDocs = args.includes('--docs');

if (!tagName) {
  console.error('Error: Tag name is required.');
  process.exit(1);
}

const versionRegex = /^v\d+\.\d+\.\d+$/;
const preVersionRegex = /^v\d+\.\d+\.\d+-\d+$/;

if (isPre) {
  if (preVersionRegex.test(tagName)) {
    console.log('Valid tag name.');
  } else {
    console.error('Invalid tag name.');
    process.exit(1);
  }
} else if (versionRegex.test(tagName)) {
  console.log('Valid tag name.');
} else {
  console.error('Invalid tag name.');
  process.exit(1);
}

if (checkForDocs) {
  const versionsFilePath = path.join(__dirname, 'versions.json');
  const versions = JSON.parse(fs.readFileSync(versionsFilePath, 'utf8'));

  if (versions[versions.length - 1] === tagName) {
    console.log('Version is present in versions.json.');
  } else {
    console.error('Version is not present in versions.json.');
    process.exit(1);
  }
}
