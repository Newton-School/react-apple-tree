#!/usr/bin/env node
/* eslint-disable no-console */

// Exit immediately if a command exits with a non-zero status
process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

const args = process.argv.slice(2);
const tagName = args[0];
const allowPre = args.includes('--allow-pre');

if (!tagName) {
  console.error('Error: Tag name is required.');
  process.exit(1);
}

const versionRegex = /^v\d+\.\d+\.\d+$/;
const preVersionRegex = /^v\d+\.\d+\.\d+-\d+$/;

if (allowPre) {
  if (versionRegex.test(tagName) || preVersionRegex.test(tagName)) {
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
