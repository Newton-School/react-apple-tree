/**
 * This script validates a given tag name based on specific versioning rules
 * and optionally checks if the tag name exists in a `versions.json` file.
 *
 * The script expects the following arguments:
 *
 * @param {string} tagName - The tag name to validate. It must follow semantic versioning.
 *                           Examples: `v1.0.0` (for release versions) or `v1.0.0-1` (for pre-release versions).
 * @param {boolean} [--pre] - Optional flag to indicate that the tag name is a pre-release version.
 * @param {boolean} [--docs] - Optional flag to check if the tag name exists in the `versions.json` file.
 *
 * Behavior:
 * - If `--pre` is provided, the tag name is validated against the pre-release version regex.
 * - If `--docs` is provided, the script checks if the tag name exists in the `versions.json` file.
 * - If the tag name is invalid or not found in `versions.json` (when `--docs` is used), the script exits with an error.
 * - If the tag name is valid and all checks pass, the script logs success messages to the console.
 *
 * Usage:
 * Run the script with the required arguments to validate the tag name.
 * Example: `node check-tag-name.js v1.0.0`
 * or use the npm script: `npm run check-tag-name v1.0.0-1 --pre`
 */

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
